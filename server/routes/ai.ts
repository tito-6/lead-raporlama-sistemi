import { Request, Response } from 'express';
import { ollamaService } from '../llm/ollama.js';
import { storage } from '../storage.js';

interface AIQueryRequest {
  query: string;
}

interface StreamEvent {
  type: 'text' | 'chart' | 'error' | 'complete';
  chunk?: string;
  chartSpec?: any;
  error?: string;
}

// Database schema for AI context
const getDatabaseSchema = () => `
TABLE: leads
- id: integer (primary key)
- customerId: text (Müşteri ID)
- contactId: text (İletişim ID) 
- customerName: text (Müşteri Adı Soyadı)
- firstCustomerSource: text (İlk Müşteri Kaynağı - Instagram, Facebook, Referans, etc.)
- formCustomerSource: text (Form Müşteri Kaynağı)
- webFormNote: text (WebForm Notu - contains project and lead type info)
- requestDate: text (Talep Geliş Tarihi)
- assignedPersonnel: text (Atanan Personel)
- reminderPersonnel: text (Hatırlatma Personeli)
- followUpMade: text (GERİ DÖNÜŞ YAPILDI MI?)
- lastContactNote: text (SON GORUSME NOTU)
- lastContactResult: text (SON GORUSME SONUCU)
- leadType: text (satis=satılık, kiralama=kiralık)
- projectName: text (extracted from webFormNote)
- status: text (yeni, arama_yapildi, randevu_alindi, satis_yapildi, olumsuz, etc.)
- lastUpdateDate: text

TABLE: sales_reps
- id: integer (primary key)
- name: text (Sales representative name)
- monthlyTarget: integer (Monthly target)
- isActive: boolean

Common Queries:
- Lead counts by source: SELECT firstCustomerSource, COUNT(*) FROM leads GROUP BY firstCustomerSource
- Sales vs Rental: SELECT leadType, COUNT(*) FROM leads GROUP BY leadType  
- Status distribution: SELECT status, COUNT(*) FROM leads GROUP BY status
- Monthly trends: SELECT strftime('%Y-%m', requestDate) as month, COUNT(*) FROM leads GROUP BY month
- Personnel performance: SELECT assignedPersonnel, COUNT(*) FROM leads GROUP BY assignedPersonnel
`;

export async function handleAIQuery(req: Request, res: Response) {
  try {
    const { query }: AIQueryRequest = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const sendEvent = (event: StreamEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      // Check if Ollama is available
      const modelAvailable = await ollamaService.ensureModelAvailable();
      if (!modelAvailable) {
        sendEvent({
          type: 'error',
          error: 'AI service unavailable. Please ensure Ollama is running with llama3.2:3b-instruct-q4_0 model.'
        });
        return res.end();
      }

      sendEvent({ type: 'text', chunk: 'Sorunuzu analiz ediyorum...\n' });

      // Generate SQL query
      const schema = getDatabaseSchema();
      const sqlQuery = await ollamaService.generateSQL(query, schema);
      
      sendEvent({ type: 'text', chunk: `SQL sorgusu oluşturuldu: ${sqlQuery}\n` });

      // Execute query safely
      let results: any[] = [];
      try {
        // For safety, we'll use the storage interface instead of direct SQL
        const leads = await storage.getLeads();
        
        // Parse and execute simple queries
        if (sqlQuery.toLowerCase().includes('count') && sqlQuery.toLowerCase().includes('group by')) {
          results = await executeGroupByQuery(leads, sqlQuery);
        } else if (sqlQuery.toLowerCase().includes('select') && sqlQuery.toLowerCase().includes('from leads')) {
          results = await executeSelectQuery(leads, sqlQuery);
        } else {
          // Fallback to basic lead stats
          results = [
            { total_leads: leads.length },
            { sales_leads: leads.filter(l => l.leadType === 'satis').length },
            { rental_leads: leads.filter(l => l.leadType === 'kiralama').length }
          ];
        }

        sendEvent({ type: 'text', chunk: `${results.length} sonuç bulundu.\n` });

      } catch (queryError) {
        console.error('Query execution error:', queryError);
        // Use basic aggregation as fallback
        const leads = await storage.getLeads();
        results = [{ total_leads: leads.length, note: 'Basit analiz' }];
      }

      sendEvent({ type: 'text', chunk: 'Sonuçları yorumluyorum...\n' });

      // Interpret results and generate response
      const interpretation = await ollamaService.interpretResults(sqlQuery, results, query);

      sendEvent({ type: 'text', chunk: interpretation.summary });

      if (interpretation.chartSpec) {
        sendEvent({ 
          type: 'chart', 
          chartSpec: interpretation.chartSpec 
        });
      }

      sendEvent({ type: 'complete' });

    } catch (error) {
      console.error('AI query error:', error);
      sendEvent({
        type: 'error',
        error: `Sorgu işlenirken hata oluştu: ${error.message}`
      });
    }

    res.end();

  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions for basic query parsing
async function executeGroupByQuery(leads: any[], sqlQuery: string): Promise<any[]> {
  const query = sqlQuery.toLowerCase();
  
  if (query.includes('firstcustomersource')) {
    const grouped = leads.reduce((acc, lead) => {
      const source = lead.firstCustomerSource || 'Bilinmiyor';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }
  
  if (query.includes('leadtype')) {
    const grouped = leads.reduce((acc, lead) => {
      const type = lead.leadType === 'satis' ? 'Satılık' : lead.leadType === 'kiralama' ? 'Kiralık' : 'Bilinmiyor';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }
  
  if (query.includes('status')) {
    const grouped = leads.reduce((acc, lead) => {
      const status = lead.status || 'Bilinmiyor';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }
  
  if (query.includes('assignedpersonnel')) {
    const grouped = leads.reduce((acc, lead) => {
      const personnel = lead.assignedPersonnel || 'Atanmamış';
      acc[personnel] = (acc[personnel] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }

  return [{ total: leads.length }];
}

async function executeSelectQuery(leads: any[], sqlQuery: string): Promise<any[]> {
  const query = sqlQuery.toLowerCase();
  
  // Filter by lead type if specified
  let filteredLeads = leads;
  if (query.includes("leadtype = 'satis'") || query.includes('satılık')) {
    filteredLeads = leads.filter(l => l.leadType === 'satis');
  } else if (query.includes("leadtype = 'kiralama'") || query.includes('kiralık')) {
    filteredLeads = leads.filter(l => l.leadType === 'kiralama');
  }
  
  // Filter by source if specified
  if (query.includes('instagram')) {
    filteredLeads = filteredLeads.filter(l => 
      l.firstCustomerSource?.toLowerCase().includes('instagram')
    );
  } else if (query.includes('facebook')) {
    filteredLeads = filteredLeads.filter(l => 
      l.firstCustomerSource?.toLowerCase().includes('facebook')
    );
  }
  
  // Apply LIMIT if specified
  const limitMatch = query.match(/limit (\d+)/);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1]);
    filteredLeads = filteredLeads.slice(0, limit);
  }
  
  return filteredLeads.length > 0 ? filteredLeads : [{ message: 'No results found' }];
}