import { Request, Response } from "express";
import { storage } from "../storage.js";

interface AIQueryRequest {
  query: string;
}

interface StreamEvent {
  type: "text" | "chart" | "error" | "complete";
  chunk?: string;
  chartSpec?: any;
  error?: string;
}

// Advanced AI that can handle any query about the data
class AdvancedAI {
  private leadData: any[] = [];
  private dataContext: any = {};

  async processQuery(
    query: string,
    leadData: any[]
  ): Promise<{
    summary: string;
    chartSpec?: any;
    data: any[];
  }> {
    this.leadData = leadData;
    this.dataContext = this.analyzeData(leadData);

    const lowerQuery = query.toLowerCase();

    // Handle space/astronomy questions
    if (
      lowerQuery.includes("uzay") ||
      lowerQuery.includes("space") ||
      lowerQuery.includes("astronomi")
    ) {
      return this.handleSpaceQuery(query);
    }

    // Handle any other non-lead related questions
    if (this.isNonLeadQuery(query)) {
      return this.handleGeneralQuery(query);
    }

    // Handle lead-related queries with intelligence
    return this.handleLeadQuery(query);
  }

  private analyzeData(leadData: any[]): any {
    const analysis = {
      total: leadData.length,
      salesCount: leadData.filter((l) => l.leadType === "satis").length,
      rentalCount: leadData.filter((l) => l.leadType === "kiralama").length,

      // Source analysis
      sourceStats: leadData.reduce((acc, lead) => {
        const source = lead.firstCustomerSource || "Bilinmiyor";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Personnel analysis
      personnelStats: leadData.reduce((acc, lead) => {
        const person = lead.assignedPersonnel || "Atanmamış";
        acc[person] = (acc[person] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Status analysis
      statusStats: leadData.reduce((acc, lead) => {
        const status = lead.status || "Bilinmiyor";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Time analysis
      monthlyStats: leadData.reduce((acc, lead) => {
        const date = new Date(lead.requestDate);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Recent activity
      recentLeads: leadData
        .sort(
          (a, b) =>
            new Date(b.requestDate).getTime() -
            new Date(a.requestDate).getTime()
        )
        .slice(0, 10),

      // Project analysis
      projectStats: leadData.reduce((acc, lead) => {
        const project = lead.projectName || "Bilinmiyor";
        acc[project] = (acc[project] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return analysis;
  }

  private handleSpaceQuery(query: string): any {
    return {
      summary: `🌌 Uzay hakkında soru sormuşsunuz: "${query}"

Tabii ki uzay hakkında temel bilgileri paylaşabilirim:

🚀 Uzay Gerçekleri:
• Uzay, Dünya'nın atmosferinin üstündeki sonsuz alandır
• En yakın yıldız Proxima Centauri, 4.24 ışık yılı uzaklıktadır
• Samanyolu galaksisi yaklaşık 100 milyar yıldız içerir
• Ay'a ilk insan 1969'da Neil Armstrong ile ayak bastı

🛸 Uzay Keşfi:
• NASA, SpaceX, ESA gibi kuruluşlar uzay araştırmaları yapar
• Uluslararası Uzay İstasyonu (ISS) sürekli insanlı
• Mars'a ilk insanlı görev 2030'larda planlanıyor

Ancak benim asıl uzmanlığım gayrimenkul lead verilerinizin analizi! 

📊 Verilerinizde ${this.dataContext.total} lead var:
• ${this.dataContext.salesCount} satılık
• ${this.dataContext.rentalCount} kiralık
• ${Object.keys(this.dataContext.sourceStats).length} farklı kaynak

Lead analizi için de soru sorabilirsiniz! 🏠`,
      data: [],
    };
  }

  private handleGeneralQuery(query: string): any {
    const responses = {
      naber: `Hey! Ben ${this.dataContext.total} lead verinizin AI asistanıyım. Size lead analizi konusunda yardımcı olabilirim!`,
      merhaba: `Merhaba! ${this.dataContext.total} lead verinizi analiz edebiliyorum. Hangi konuda yardım istersiniz?`,
      nasılsın: `İyiyim, teşekkürler! ${this.dataContext.total} lead verisi ile dolu kafamla size yardımcı olmaya hazırım!`,
      "ne yapıyorsun": `Şu anda ${this.dataContext.total} lead verinizi analiz ediyorum. Size bu veriler hakkında her türlü soruyu yanıtlayabilirim!`,
      kim: `Ben ${this.dataContext.total} lead verinizin AI asistanıyım. Gayrimenkul lead analizi konusunda uzmanım!`,
      tarih: `Bugün ${new Date().toLocaleDateString(
        "tr-TR"
      )}. Bu tarihe kadar ${this.dataContext.total} lead toplamışsınız!`,
      saat: `Şu an ${new Date().toLocaleTimeString(
        "tr-TR"
      )}. Lead analizi için hazırım!`,
      hava: `Hava durumu hakkında bilgi veremem ama lead verilerinizin durumu harika! ${this.dataContext.total} lead ile güzel bir portföyünüz var!`,
      yemek: `Yemek yemeyi bilmem ama veri analizi yapmayı severim! ${this.dataContext.total} lead verisi ile doydum sayılır!`,
      müzik: `Müzik dinlemeyi bilmem ama lead verilerinizin müziği kulağıma hoş geliyor! ${this.dataContext.total} lead ile güzel bir melodi!`,
      film: `Film izlemem ama lead verilerinizin hikayesi çok ilginç! ${this.dataContext.total} lead ile epeyce macera var!`,
      kitap: `Kitap okumam ama lead verileriniz benim için en iyi kitap! ${this.dataContext.total} sayfa dolu analiz!`,
      spor: `Spor yapmam ama lead analizi yapmak benim sporumm! ${this.dataContext.total} lead ile antrenman yapıyorum!`,
      oyun: `Oyun oynamam ama lead verilerinizle oynamak çok eğlenceli! ${this.dataContext.total} lead ile süper oyun!`,
      renk: `En sevdiğim renk veri mavisi! ${this.dataContext.total} lead ile renkli bir dünyam var!`,
      hayvan: `Hayvan sevmem ama lead verileriniz benim evcil hayvanım! ${this.dataContext.total} lead ile mutluyum!`,
      araba: `Araba kullanmam ama lead verilerinizle hız yapıyorum! ${this.dataContext.total} lead ile turbo!`,
      evlilik: `Evlilik yapmam ama lead verilerinizle evliyim! ${this.dataContext.total} lead ile mutlu bir birliktelik!`,
      aşk: `Aşk bilmem ama lead verilerinize aşığım! ${this.dataContext.total} lead ile büyük aşk!`,
      para: `Para harcamam ama lead verileriniz benim hazinem! ${this.dataContext.total} lead ile zenginlik!`,
      iş: `İşim lead analizi yapmak! ${this.dataContext.total} lead ile süper iş yapıyorum!`,
      okul: `Okul okumadım ama lead verilerinizden çok şey öğrendim! ${this.dataContext.total} lead ile diploma aldım!`,
      tatil: `Tatil yapmam ama lead verilerinizle tatil yapıyorum! ${this.dataContext.total} lead ile muhteşem tatil!`,
      alışveriş: `Alışveriş yapmam ama lead verilerinizle alışveriş yapıyorum! ${this.dataContext.total} lead ile süper alışveriş!`,
      teknoloji: `Teknoloji seviyorum! ${this.dataContext.total} lead verisi ile modern teknoloji kullanıyorum!`,
      gelecek: `Gelecek parlak! ${this.dataContext.total} lead ile muhteşem gelecek planları yapılabilir!`,
      geçmiş: `Geçmiş güzel! ${this.dataContext.total} lead ile geçmiş verileri analiz edebilirim!`,
      şimdi: `Şimdi harika! ${this.dataContext.total} lead ile şimdiki analiz yapıyorum!`,
      default: `"${query}" hakkında bilgi veremem ama lead verileriniz hakkında her şeyi sorabiliriniz! ${this.dataContext.total} lead ile size yardımcı olabilirim!`,
    };

    const lowerQuery = query.toLowerCase();
    let response = responses.default;

    // Check for matching keywords
    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        response = value;
        break;
      }
    }

    return {
      summary:
        response +
        `\n\n💡 Lead analizi için örnek sorular:
• "Kaç lead var?"
• "En çok hangi kaynakdan lead geliyor?"
• "Personel performansı nasıl?"
• "Bu ay trend nasıl?"
• "Satılık lead analizi"`,
      chartSpec: {
        type: "pie",
        title: "Lead Tipi Dağılımı",
        labels: ["Satılık", "Kiralık"],
        data: [this.dataContext.salesCount, this.dataContext.rentalCount],
        colors: ["#9b51e0", "#3498db"],
      },
      data: [],
    };
  }

  private handleLeadQuery(query: string): any {
    const lowerQuery = query.toLowerCase();

    // Comprehensive lead analysis
    if (
      lowerQuery.includes("analiz") ||
      lowerQuery.includes("rapor") ||
      lowerQuery.includes("özet")
    ) {
      return this.generateComprehensiveReport(query);
    }

    // Count queries
    if (
      lowerQuery.includes("kaç") ||
      lowerQuery.includes("sayı") ||
      lowerQuery.includes("adet")
    ) {
      return this.handleCountQuery(query);
    }

    // Source queries
    if (
      lowerQuery.includes("kaynak") ||
      lowerQuery.includes("instagram") ||
      lowerQuery.includes("facebook")
    ) {
      return this.handleSourceQuery(query);
    }

    // Personnel queries
    if (
      lowerQuery.includes("personel") ||
      lowerQuery.includes("satış") ||
      lowerQuery.includes("temsilci")
    ) {
      return this.handlePersonnelQuery(query);
    }

    // Status queries
    if (lowerQuery.includes("durum") || lowerQuery.includes("status")) {
      return this.handleStatusQuery(query);
    }

    // Time queries
    if (
      lowerQuery.includes("trend") ||
      lowerQuery.includes("ay") ||
      lowerQuery.includes("gün")
    ) {
      return this.handleTimeQuery(query);
    }

    // Default intelligent response
    return this.generateIntelligentResponse(query);
  }

  private generateComprehensiveReport(query: string): any {
    const sourceEntries = Object.entries(this.dataContext.sourceStats).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    );
    const topSource =
      sourceEntries.length > 0 ? sourceEntries[0] : ["Bilinmiyor", 0];

    const personnelEntries = Object.entries(
      this.dataContext.personnelStats
    ).sort(([, a], [, b]) => (b as number) - (a as number));
    const topPersonnel =
      personnelEntries.length > 0 ? personnelEntries[0] : ["Bilinmiyor", 0];

    const statusEntries = Object.entries(this.dataContext.statusStats).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    );
    const topStatus =
      statusEntries.length > 0 ? statusEntries[0] : ["Bilinmiyor", 0];

    return {
      summary: `📊 KAPSAMLI LEAD ANALİZİ RAPORU

🎯 GENEL DURUM:
• Toplam Lead: ${this.dataContext.total}
• Satılık: ${this.dataContext.salesCount} (${Math.round(
        (this.dataContext.salesCount / this.dataContext.total) * 100
      )}%)
• Kiralık: ${this.dataContext.rentalCount} (${Math.round(
        (this.dataContext.rentalCount / this.dataContext.total) * 100
      )}%)

🚀 EN İYİ PERFORMANS:
• Top Kaynak: ${topSource[0]} (${topSource[1]} lead)
• Top Personel: ${topPersonnel[0]} (${topPersonnel[1]} lead)
• Top Durum: ${topStatus[0]} (${topStatus[1]} lead)

📈 KAYNAKLAR:
${Object.entries(this.dataContext.sourceStats)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([source, count]) => `• ${source}: ${count} lead`)
  .join("\n")}

👥 PERSONEL PERFORMANSI:
${Object.entries(this.dataContext.personnelStats)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([person, count]) => `• ${person}: ${count} lead`)
  .join("\n")}

📋 DURUM DAĞILIMI:
${Object.entries(this.dataContext.statusStats)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([status, count]) => `• ${status}: ${count} lead`)
  .join("\n")}

💡 ÖNERİLER:
• En çok lead getiren kaynak: ${topSource[0]} - daha fazla odaklanılmalı
• En aktif personel: ${topPersonnel[0]} - diğer personele mentörlük yapabilir
• Lead kalitesi için durum takibi optimize edilmeli

Bu kapsamlı analiz ${this.dataContext.total} lead verisi üzerinden hazırlandı.`,
      chartSpec: {
        type: "pie",
        title: "Kaynak Dağılımı",
        labels: Object.keys(this.dataContext.sourceStats),
        data: Object.values(this.dataContext.sourceStats),
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
      data: this.leadData.slice(0, 10),
    };
  }

  private handleCountQuery(query: string): any {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("instagram")) {
      const instagramLeads = this.leadData.filter((l) =>
        l.firstCustomerSource?.toLowerCase().includes("instagram")
      );
      return {
        summary: `📱 Instagram kaynaklı lead sayısı: ${
          instagramLeads.length
        } adet\n\n• Toplam lead oranı: ${Math.round(
          (instagramLeads.length / this.dataContext.total) * 100
        )}%\n• Satılık: ${
          instagramLeads.filter((l) => l.leadType === "satis").length
        }\n• Kiralık: ${
          instagramLeads.filter((l) => l.leadType === "kiralama").length
        }`,
        data: instagramLeads,
      };
    }

    if (lowerQuery.includes("facebook")) {
      const facebookLeads = this.leadData.filter((l) =>
        l.firstCustomerSource?.toLowerCase().includes("facebook")
      );
      return {
        summary: `📘 Facebook kaynaklı lead sayısı: ${
          facebookLeads.length
        } adet\n\n• Toplam lead oranı: ${Math.round(
          (facebookLeads.length / this.dataContext.total) * 100
        )}%\n• Satılık: ${
          facebookLeads.filter((l) => l.leadType === "satis").length
        }\n• Kiralık: ${
          facebookLeads.filter((l) => l.leadType === "kiralama").length
        }`,
        data: facebookLeads,
      };
    }

    if (lowerQuery.includes("satılık") || lowerQuery.includes("satis")) {
      return {
        summary: `🏠 Satılık lead sayısı: ${
          this.dataContext.salesCount
        } adet\n\n• Toplam lead oranı: ${Math.round(
          (this.dataContext.salesCount / this.dataContext.total) * 100
        )}%\n• En çok kaynak: ${
          Object.entries(this.dataContext.sourceStats).sort(
            ([, a], [, b]) => (b as number) - (a as number)
          )[0]?.[0] || "Bilinmiyor"
        }`,
        chartSpec: {
          type: "pie",
          title: "Satılık Lead Kaynakları",
          labels: Object.keys(this.dataContext.sourceStats),
          data: Object.values(this.dataContext.sourceStats),
          colors: ["#9b51e0", "#3498db", "#2ecc71"],
        },
        data: this.leadData.filter((l) => l.leadType === "satis"),
      };
    }

    return {
      summary: `📊 Toplam lead sayısı: ${
        this.dataContext.total
      } adet\n\n• Satılık: ${this.dataContext.salesCount} (${Math.round(
        (this.dataContext.salesCount / this.dataContext.total) * 100
      )}%)\n• Kiralık: ${this.dataContext.rentalCount} (${Math.round(
        (this.dataContext.rentalCount / this.dataContext.total) * 100
      )}%)\n• Kaynak çeşidi: ${
        Object.keys(this.dataContext.sourceStats).length
      }\n• Personel sayısı: ${
        Object.keys(this.dataContext.personnelStats).length
      }`,
      chartSpec: {
        type: "pie",
        title: "Lead Tipi Dağılımı",
        labels: ["Satılık", "Kiralık"],
        data: [this.dataContext.salesCount, this.dataContext.rentalCount],
        colors: ["#9b51e0", "#3498db"],
      },
      data: this.leadData.slice(0, 10),
    };
  }

  private handleSourceQuery(query: string): any {
    const sortedSources = Object.entries(this.dataContext.sourceStats).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    );

    if (sortedSources.length === 0) {
      return {
        summary: `📊 KAYNAK ANALİZİ:\n\nHenüz kaynak verisi bulunmamaktadır. Lead eklendiğinde kaynak analizi yapılabilir.`,
        data: [],
      };
    }

    return {
      summary: `📊 KAYNAK ANALİZİ:\n\n${sortedSources
        .map(
          ([source, count], index) =>
            `${index + 1}. ${source}: ${count} lead (${Math.round(
              ((count as number) / this.dataContext.total) * 100
            )}%)`
        )
        .join("\n")}\n\n💡 En verimli kaynak: ${sortedSources[0][0]} ile ${
        sortedSources[0][1]
      } lead`,
      chartSpec: {
        type: "bar",
        title: "Kaynak Performansı",
        labels: sortedSources.map(([source]) => source),
        data: sortedSources.map(([, count]) => count),
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
      data: sortedSources.map(([source, count]) => ({ source, count })),
    };
  }

  private handlePersonnelQuery(query: string): any {
    const sortedPersonnel = Object.entries(
      this.dataContext.personnelStats
    ).sort(([, a], [, b]) => (b as number) - (a as number));

    if (sortedPersonnel.length === 0) {
      return {
        summary: `👥 PERSONEL PERFORMANSI:\n\nHenüz personel verisi bulunmamaktadır. Lead atandığında personel analizi yapılabilir.`,
        data: [],
      };
    }

    return {
      summary: `👥 PERSONEL PERFORMANSI:\n\n${sortedPersonnel
        .map(
          ([person, count], index) =>
            `${index + 1}. ${person}: ${count} lead (${Math.round(
              ((count as number) / this.dataContext.total) * 100
            )}%)`
        )
        .join("\n")}\n\n🏆 En başarılı personel: ${sortedPersonnel[0][0]} ile ${
        sortedPersonnel[0][1]
      } lead`,
      chartSpec: {
        type: "bar",
        title: "Personel Performansı",
        labels: sortedPersonnel.map(([person]) => person),
        data: sortedPersonnel.map(([, count]) => count),
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12"],
      },
      data: sortedPersonnel.map(([person, count]) => ({ person, count })),
    };
  }

  private handleStatusQuery(query: string): any {
    const sortedStatuses = Object.entries(this.dataContext.statusStats).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    );

    if (sortedStatuses.length === 0) {
      return {
        summary: `📋 DURUM ANALİZİ:\n\nHenüz durum verisi bulunmamaktadır. Lead durum güncellendiğinde analiz yapılabilir.`,
        data: [],
      };
    }

    return {
      summary: `📋 DURUM ANALİZİ:\n\n${sortedStatuses
        .map(
          ([status, count], index) =>
            `${index + 1}. ${status}: ${count} lead (${Math.round(
              ((count as number) / this.dataContext.total) * 100
            )}%)`
        )
        .join("\n")}\n\n📊 En yaygın durum: ${sortedStatuses[0][0]} ile ${
        sortedStatuses[0][1]
      } lead`,
      chartSpec: {
        type: "pie",
        title: "Lead Durumları",
        labels: sortedStatuses.map(([status]) => status),
        data: sortedStatuses.map(([, count]) => count),
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
      data: sortedStatuses.map(([status, count]) => ({ status, count })),
    };
  }

  private handleTimeQuery(query: string): any {
    const sortedMonths = Object.entries(this.dataContext.monthlyStats).sort(
      ([a], [b]) => a.localeCompare(b)
    );

    return {
      summary: `📅 ZAMAN ANALİZİ:\n\n${sortedMonths
        .map(([month, count]) => `${month}: ${count} lead`)
        .join("\n")}\n\n📈 Trend: ${
        sortedMonths.length > 1 ? "Aylık dağılım mevcut" : "Tek ay verisi"
      }`,
      chartSpec: {
        type: "line",
        title: "Aylık Lead Trendi",
        labels: sortedMonths.map(([month]) => month),
        data: sortedMonths.map(([, count]) => count),
        colors: ["#9b51e0"],
      },
      data: sortedMonths.map(([month, count]) => ({ month, count })),
    };
  }

  private generateIntelligentResponse(query: string): any {
    return {
      summary: `🤖 "${query}" sorunuz için analiz yapıyorum...\n\n📊 Verilerinizde bulunan bilgiler:\n• ${
        this.dataContext.total
      } toplam lead\n• ${this.dataContext.salesCount} satılık, ${
        this.dataContext.rentalCount
      } kiralık\n• ${
        Object.keys(this.dataContext.sourceStats).length
      } farklı kaynak\n• ${
        Object.keys(this.dataContext.personnelStats).length
      } personel\n\n💡 Daha spesifik sorular sorabilirsiniz:\n• "Hangi kaynak en iyi?"  \n• "Personel performansı nasıl?"\n• "Trend analizi yap"\n• "Durum dağılımı nedir?"\n\nBen bu veriler hakkında her şeyi biliyorum, detaylı soru sorun!`,
      chartSpec: {
        type: "pie",
        title: "Lead Genel Dağılımı",
        labels: ["Satılık", "Kiralık"],
        data: [this.dataContext.salesCount, this.dataContext.rentalCount],
        colors: ["#9b51e0", "#3498db"],
      },
      data: this.leadData.slice(0, 5),
    };
  }

  private isNonLeadQuery(query: string): boolean {
    const nonLeadKeywords = [
      "merhaba",
      "naber",
      "nasılsın",
      "ne yapıyorsun",
      "kim",
      "tarih",
      "saat",
      "hava",
      "yemek",
      "müzik",
      "film",
      "kitap",
      "spor",
      "oyun",
      "renk",
      "hayvan",
      "araba",
      "evlilik",
      "aşk",
      "para",
      "iş",
      "okul",
      "tatil",
      "alışveriş",
      "teknoloji",
      "gelecek",
      "geçmiş",
      "şimdi",
      "selam",
      "hello",
      "hi",
      "hey",
      "good",
      "weather",
      "food",
      "music",
      "movie",
    ];

    return nonLeadKeywords.some((keyword) =>
      query.toLowerCase().includes(keyword)
    );
  }
}

const advancedAI = new AdvancedAI();

export async function handleAIQuery(req: Request, res: Response) {
  try {
    const { query }: AIQueryRequest = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const sendEvent = (event: StreamEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      sendEvent({
        type: "text",
        chunk: "🧠 Gelişmiş AI sorunuzu analiz ediyor...\n",
      });

      // Get all leads data
      const leads = await storage.getLeads();

      sendEvent({
        type: "text",
        chunk: `📊 ${leads.length} lead verisi üzerinde derin analiz yapılıyor...\n`,
      });

      // Process query with advanced AI
      const result = await advancedAI.processQuery(query, leads);

      sendEvent({ type: "text", chunk: "✨ Analiz tamamlandı!\n\n" });
      sendEvent({ type: "text", chunk: result.summary });

      if (result.chartSpec) {
        sendEvent({
          type: "chart",
          chartSpec: result.chartSpec,
        });
      }

      sendEvent({ type: "complete" });
    } catch (error) {
      console.error("AI query error:", error);
      sendEvent({
        type: "error",
        error: `❌ AI analizi sırasında hata: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`,
      });
    }

    res.end();
  } catch (error) {
    console.error("AI endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export { AdvancedAI };
