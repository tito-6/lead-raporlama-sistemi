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

// Built-in AI assistant using pattern matching and rule-based logic
class LocalAIAssistant {
  private turkishToEnglish = {
    satılık: "sales",
    kiralık: "rental",
    satis: "sales",
    kiralama: "rental",
    instagram: "Instagram",
    facebook: "Facebook",
    referans: "Referans",
    personel: "personnel",
    durum: "status",
    tarih: "date",
    müşteri: "customer",
    toplam: "total",
    kaç: "count",
    adet: "count",
    sayı: "count",
    "ne kadar": "how many",
    hangi: "which",
    kim: "who",
    nerede: "where",
    nasıl: "how",
    bugün: "today",
    dün: "yesterday",
    "bu hafta": "this week",
    "bu ay": "this month",
    "geçen ay": "last month",
    yeni: "new",
    "arama yapıldı": "called",
    "randevu alındı": "appointment",
    "satış yapıldı": "sold",
    olumsuz: "negative",
  };

  private patterns = [
    {
      pattern: /kaç.*(lead|müşteri|kişi)/i,
      type: "count",
      field: "total",
    },
    {
      pattern: /(satılık|satis).*(kaç|adet|sayı)/i,
      type: "count",
      field: "sales",
    },
    {
      pattern: /(kiralık|kiralama).*(kaç|adet|sayı)/i,
      type: "count",
      field: "rental",
    },
    {
      pattern: /(instagram|facebook|referans).*(kaç|adet|sayı)/i,
      type: "count_by_source",
      field: "source",
    },
    {
      pattern: /(durum|status).*(dağılım|analiz)/i,
      type: "group_by_status",
      field: "status",
    },
    {
      pattern: /(personel|satış temsilcisi).*(performans|analiz)/i,
      type: "group_by_personnel",
      field: "personnel",
    },
    {
      pattern: /(kaynak|source).*(dağılım|analiz)/i,
      type: "group_by_source",
      field: "source",
    },
    {
      pattern: /(aylık|ay).*(trend|analiz)/i,
      type: "monthly_trend",
      field: "month",
    },
    {
      pattern: /(günlük|gün).*(trend|analiz)/i,
      type: "daily_trend",
      field: "day",
    },
  ];

  analyzeQuery(query: string): { type: string; field: string; filters: any } {
    const lowercaseQuery = query.toLowerCase();

    // Find matching pattern
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(lowercaseQuery)) {
        return {
          type: pattern.type,
          field: pattern.field,
          filters: this.extractFilters(lowercaseQuery),
        };
      }
    }

    // Default to general stats
    return {
      type: "general_stats",
      field: "total",
      filters: this.extractFilters(lowercaseQuery),
    };
  }

  private extractFilters(query: string): any {
    const filters: any = {};

    // Extract lead type
    if (query.includes("satılık") || query.includes("satis")) {
      filters.leadType = "satis";
    } else if (query.includes("kiralık") || query.includes("kiralama")) {
      filters.leadType = "kiralama";
    }

    // Extract source
    if (query.includes("instagram")) {
      filters.source = "Instagram";
    } else if (query.includes("facebook")) {
      filters.source = "Facebook";
    } else if (query.includes("referans")) {
      filters.source = "Referans";
    }

    // Extract time period
    if (query.includes("bugün") || query.includes("today")) {
      filters.period = "today";
    } else if (query.includes("bu hafta") || query.includes("this week")) {
      filters.period = "this_week";
    } else if (query.includes("bu ay") || query.includes("this month")) {
      filters.period = "this_month";
    }

    return filters;
  }

  async processQuery(
    query: string,
    leads: any[]
  ): Promise<{
    summary: string;
    chartSpec?: any;
    data: any[];
  }> {
    const analysis = this.analyzeQuery(query);
    let filteredLeads = this.applyFilters(leads, analysis.filters);

    switch (analysis.type) {
      case "count":
        return this.handleCount(filteredLeads, analysis.field);

      case "count_by_source":
        return this.handleCountBySource(filteredLeads);

      case "group_by_status":
        return this.handleGroupByStatus(filteredLeads);

      case "group_by_personnel":
        return this.handleGroupByPersonnel(filteredLeads);

      case "group_by_source":
        return this.handleGroupBySource(filteredLeads);

      case "monthly_trend":
        return this.handleMonthlyTrend(filteredLeads);

      case "daily_trend":
        return this.handleDailyTrend(filteredLeads);

      default:
        return this.handleGeneralStats(filteredLeads);
    }
  }

  private applyFilters(leads: any[], filters: any): any[] {
    let filtered = leads;

    if (filters.leadType) {
      filtered = filtered.filter((lead) => lead.leadType === filters.leadType);
    }

    if (filters.source) {
      filtered = filtered.filter((lead) =>
        lead.firstCustomerSource?.includes(filters.source)
      );
    }

    if (filters.period) {
      const now = new Date();
      filtered = filtered.filter((lead) => {
        const leadDate = new Date(lead.requestDate);

        switch (filters.period) {
          case "today":
            return leadDate.toDateString() === now.toDateString();
          case "this_week":
            const weekStart = new Date(
              now.setDate(now.getDate() - now.getDay())
            );
            return leadDate >= weekStart;
          case "this_month":
            return (
              leadDate.getMonth() === now.getMonth() &&
              leadDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  private handleCount(leads: any[], field: string): any {
    const count = leads.length;
    const salesCount = leads.filter((l) => l.leadType === "satis").length;
    const rentalCount = leads.filter((l) => l.leadType === "kiralama").length;

    return {
      summary: `Toplam ${count} adet lead bulunmaktadır. Bunların ${salesCount} tanesi satılık, ${rentalCount} tanesi kiralık lead'dir.`,
      data: [{ total: count, sales: salesCount, rental: rentalCount }],
      chartSpec: {
        type: "pie",
        title: "Lead Tipleri Dağılımı",
        labels: ["Satılık", "Kiralık"],
        data: [salesCount, rentalCount],
        colors: ["#9b51e0", "#3498db"],
      },
    };
  }

  private handleCountBySource(leads: any[]): any {
    const grouped = leads.reduce((acc, lead) => {
      const source = lead.firstCustomerSource || "Bilinmiyor";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    return {
      summary: `Lead kaynakları: ${labels
        .map((label, i) => `${label}: ${data[i]}`)
        .join(", ")}`,
      data: Object.entries(grouped).map(([name, count]) => ({ name, count })),
      chartSpec: {
        type: "pie",
        title: "Lead Kaynakları Dağılımı",
        labels,
        data,
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
    };
  }

  private handleGroupByStatus(leads: any[]): any {
    const grouped = leads.reduce((acc, lead) => {
      const status = lead.status || "Bilinmiyor";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    return {
      summary: `Lead durumları: ${labels
        .map((label, i) => `${label}: ${data[i]}`)
        .join(", ")}`,
      data: Object.entries(grouped).map(([name, count]) => ({ name, count })),
      chartSpec: {
        type: "bar",
        title: "Lead Durumları",
        labels,
        data,
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
    };
  }

  private handleGroupByPersonnel(leads: any[]): any {
    const grouped = leads.reduce((acc, lead) => {
      const personnel = lead.assignedPersonnel || "Atanmamış";
      acc[personnel] = (acc[personnel] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    return {
      summary: `Personel performansı: ${labels
        .map((label, i) => `${label}: ${data[i]}`)
        .join(", ")}`,
      data: Object.entries(grouped).map(([name, count]) => ({ name, count })),
      chartSpec: {
        type: "bar",
        title: "Personel Performansı",
        labels,
        data,
        colors: ["#9b51e0", "#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
      },
    };
  }

  private handleGroupBySource(leads: any[]): any {
    return this.handleCountBySource(leads);
  }

  private handleMonthlyTrend(leads: any[]): any {
    const monthlyData = leads.reduce((acc, lead) => {
      const date = new Date(lead.requestDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      return `${monthNum}/${year}`;
    });
    const data = sortedMonths.map((month) => monthlyData[month]);

    return {
      summary: `Aylık trend: ${labels
        .map((label, i) => `${label}: ${data[i]}`)
        .join(", ")}`,
      data: sortedMonths.map((month) => ({ month, count: monthlyData[month] })),
      chartSpec: {
        type: "line",
        title: "Aylık Lead Trendi",
        labels,
        data,
        colors: ["#9b51e0"],
      },
    };
  }

  private handleDailyTrend(leads: any[]): any {
    const dailyData = leads.reduce((acc, lead) => {
      const date = new Date(lead.requestDate);
      const dayKey = date.toISOString().split("T")[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {});

    const sortedDays = Object.keys(dailyData).sort().slice(-30); // Last 30 days
    const labels = sortedDays.map((day) => {
      const date = new Date(day);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const data = sortedDays.map((day) => dailyData[day]);

    return {
      summary: `Son 30 günlük trend görüntüleniyor. Günlük ortalama: ${Math.round(
        data.reduce((a, b) => a + b, 0) / data.length
      )} lead`,
      data: sortedDays.map((day) => ({ day, count: dailyData[day] })),
      chartSpec: {
        type: "line",
        title: "Günlük Lead Trendi (Son 30 Gün)",
        labels,
        data,
        colors: ["#3498db"],
      },
    };
  }

  private handleGeneralStats(leads: any[]): any {
    const total = leads.length;
    const salesCount = leads.filter((l) => l.leadType === "satis").length;
    const rentalCount = leads.filter((l) => l.leadType === "kiralama").length;

    const sourceStats = leads.reduce((acc, lead) => {
      const source = lead.firstCustomerSource || "Bilinmiyor";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const topSource = Object.entries(sourceStats).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0];

    return {
      summary: `Genel İstatistikler: 
      • Toplam ${total} lead
      • ${salesCount} satılık, ${rentalCount} kiralık
      • En çok lead kaynağı: ${topSource ? topSource[0] : "Bilinmiyor"} (${
        topSource ? topSource[1] : 0
      } lead)`,
      data: [
        {
          total,
          sales: salesCount,
          rental: rentalCount,
          topSource: topSource ? topSource[0] : "Bilinmiyor",
        },
      ],
      chartSpec: {
        type: "pie",
        title: "Lead Tipi Dağılımı",
        labels: ["Satılık", "Kiralık"],
        data: [salesCount, rentalCount],
        colors: ["#9b51e0", "#3498db"],
      },
    };
  }
}

const localAI = new LocalAIAssistant();

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
        chunk: "🤖 AI Asistan sorunuzu analiz ediyor...\n",
      });

      // Get all leads
      const leads = await storage.getLeads();

      sendEvent({
        type: "text",
        chunk: `📊 ${leads.length} lead verisi üzerinde analiz yapılıyor...\n`,
      });

      // Process query with local AI
      const result = await localAI.processQuery(query, leads);

      sendEvent({ type: "text", chunk: "✅ Analiz tamamlandı!\n\n" });
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
        error: `❌ Sorgu işlenirken hata oluştu: ${
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

export { LocalAIAssistant };
