import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  chartSpec?: ChartSpec;
}

interface ChartSpec {
  type: 'pie' | 'bar' | 'line';
  title: string;
  labels: string[];
  data: number[];
  colors?: string[];
}

interface StreamEvent {
  type: 'text' | 'chart' | 'error' | 'complete';
  chunk?: string;
  chartSpec?: ChartSpec;
  error?: string;
}

export default function ChatDrawer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage.content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let aiContent = '';
      let aiChartSpec: ChartSpec | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamEvent = JSON.parse(line.slice(6));
              
              if (data.type === 'text' && data.chunk) {
                aiContent += data.chunk;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: aiContent }
                      : msg
                  )
                );
              } else if (data.type === 'chart' && data.chartSpec) {
                aiChartSpec = data.chartSpec;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, chartSpec: aiChartSpec }
                      : msg
                  )
                );
              } else if (data.type === 'error') {
                aiContent += `\n❌ Hata: ${data.error}`;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: aiContent }
                      : msg
                  )
                );
              } else if (data.type === 'complete') {
                break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('Chat error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: `❌ Bağlantı hatası: ${error.message}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const renderChart = (chartSpec: ChartSpec) => {
    const data = chartSpec.labels.map((label, index) => ({
      name: label,
      value: chartSpec.data[index],
    }));

    const colors = chartSpec.colors || [
      '#9b51e0', '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#1abc9c', '#34495e', '#9b59b6', '#e67e22', '#95a5a6'
    ];

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            {chartSpec.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {chartSpec.type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (%${(percent * 100).toFixed(1)})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : chartSpec.type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={colors[0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const suggestedQueries = [
    "Instagram'dan gelen leadlerin kaç tanesi satış yapıldı?",
    "Bu ay kiralık leadlerin durum dağılımını göster",
    "Hangi personel en çok lead alıyor?",
    "Proje bazında lead sayıları nasıl?",
    "Son hafta Facebook leadlerinin analizi",
  ];

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[80vh] max-w-4xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-purple-600" />
            AI Lead Asistanı
            <Badge variant="secondary" className="ml-2">BETA</Badge>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col h-full p-4">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">🤖 AI Lead Asistanınızla konuşun</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Lead verileriniz hakkında doğal dilde sorular sorun, anlık analizler ve grafikler alın.
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-3">Örnek sorular:</p>
                  {suggestedQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="mr-2 mb-2 text-xs"
                      onClick={() => setInput(query)}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium mb-2">⚠️ Replit Ortamında Ollama Sınırlaması</p>
                  <p className="text-xs text-amber-700 mb-2">
                    Ollama, Replit'in sanallaştırılmış ortamında çalışmamaktadır. AI asistanı kullanmak için:
                  </p>
                  <div className="text-xs text-amber-600 space-y-1">
                    <p><strong>Seçenek 1:</strong> Projeyi yerel VS Code ortamınızda çalıştırın</p>
                    <p><strong>Seçenek 2:</strong> Kendi sunucunuzda deploy edin</p>
                    <p><strong>Seçenek 3:</strong> Docker ile yerel çalışma ortamı kurun</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      📖 <strong>Yerel Kurulum:</strong> OLLAMA_SETUP.md ve LOCAL_SETUP.md dosyalarını inceleyin
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && (
                          <Bot className="h-4 w-4 mt-0.5 text-purple-600" />
                        )}
                        {message.type === 'user' && (
                          <User className="h-4 w-4 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.chartSpec && renderChart(message.chartSpec)}
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Düşünüyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex space-x-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Lead verileriniz hakkında bir soru sorun..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-center mt-2">
            <p className="text-xs text-gray-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Bu özellik deneme aşamasındadır. Ollama servisinin çalışır durumda olması gerekir.
            </p>
          </div>
          
          <div className="flex items-center justify-center mt-1">
            <p className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
              📚 Kurulum kılavuzu: OLLAMA_SETUP.md dosyasını inceleyin
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}