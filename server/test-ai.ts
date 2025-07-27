// Simple test to verify AI agent is working
import { LocalAIAssistant } from "./routes/ai-local.js";

const testAI = new LocalAIAssistant();

// Mock lead data for testing
const testLeads = [
  {
    id: 1,
    customerName: "John Doe",
    firstCustomerSource: "Instagram",
    leadType: "satis",
    status: "yeni",
    assignedPersonnel: "Ahmet Yılmaz",
    requestDate: "2024-01-15",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    firstCustomerSource: "Facebook",
    leadType: "kiralama",
    status: "arama_yapildi",
    assignedPersonnel: "Mehmet Kaya",
    requestDate: "2024-01-16",
  },
  {
    id: 3,
    customerName: "Ali Veli",
    firstCustomerSource: "Instagram",
    leadType: "satis",
    status: "randevu_alindi",
    assignedPersonnel: "Ahmet Yılmaz",
    requestDate: "2024-01-17",
  },
];

async function testAIQueries() {
  console.log("🧪 Testing AI Assistant...\n");

  const queries = [
    "Kaç adet lead var?",
    "Satılık lead sayısı nedir?",
    "Instagram dan gelen lead sayısı",
    "Personel performansı analizi",
    "Lead kaynakları dağılımı",
    "Durum analizi yap",
  ];

  for (const query of queries) {
    try {
      console.log(`❓ Soru: ${query}`);
      const result = await testAI.processQuery(query, testLeads);
      console.log(`✅ Cevap: ${result.summary}`);
      if (result.chartSpec) {
        console.log(
          `📊 Grafik: ${result.chartSpec.title} (${result.chartSpec.type})`
        );
      }
      console.log("---");
    } catch (error) {
      console.error(`❌ Hata: ${error}`);
    }
  }
}

if (process.argv.includes("--test-ai")) {
  testAIQueries();
}

export { testAIQueries };
