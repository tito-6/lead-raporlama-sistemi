import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, DollarSign, Users, Globe, Facebook, Phone, MessageCircle, BarChart2, Building2, Briefcase, Palette, Megaphone, Calendar } from "lucide-react";

const INNO_LOGO = "/innogylogo.webp";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const PROJECTS = [
  { value: "sanayi", label: "Model Sanayi Merkezi", icon: <Building2 className="text-blue-700" /> },
  { value: "kuyum", label: "Model Kuyum Merkezi", icon: <Briefcase className="text-yellow-700" /> },
];

const EXPENSE_TYPES = [
  { value: "kreatif", label: "KREATİF AJANS", icon: <Palette className="text-pink-500" /> },
  { value: "reklamajans", label: "REKLAM AJANSI", icon: <Megaphone className="text-green-600" /> },
  { value: "reklamharcama", label: "REKLAM HARCAMASI", icon: <DollarSign className="text-blue-600" /> },
];

const SOURCES = [
  { value: "meta", label: "Meta", icon: <Facebook className="text-blue-700" /> },
  { value: "google", label: "Google", icon: <Globe className="text-blue-500" /> },
  { value: "tiktok", label: "TikTok", icon: <BarChart2 className="text-pink-500" /> },
  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="text-green-500" /> },
  { value: "sabit", label: "Sabit Hat", icon: <Phone className="text-gray-700" /> },
];

const STORAGE_KEY = "lead-gider-detaylari-expenses";

function getCurrentYear() {
  return new Date().getFullYear();
}

function loadExpenses() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  return [];
}

function saveExpenses(expenses: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

const getYears = (expenses: any[]) => {
  const years = expenses.map(e => e.year || getCurrentYear());
  return Array.from(new Set([...years, getCurrentYear()])).sort();
};

const LeadGiderDetaylariTab: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>(loadExpenses());
  const [newExpense, setNewExpense] = useState({
    project: PROJECTS[0].value,
    year: getCurrentYear(),
    month: new Date().getMonth(),
    type: EXPENSE_TYPES[0].value,
    source: SOURCES[0].value,
    amount: 0,
    lead: "",
    customDate: "",
  });
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedProject, setSelectedProject] = useState<string>(PROJECTS[0].value);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editExpense, setEditExpense] = useState<any>(null);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const years = getYears(expenses);

  const handleAdd = () => {
    if (!newExpense.amount || isNaN(Number(newExpense.amount))) return;
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        ...newExpense,
        amount: Number(newExpense.amount),
        lead: newExpense.lead ? Number(newExpense.lead) : undefined,
        customDate: newExpense.customDate || null,
      },
    ]);
    setNewExpense({
      project: selectedProject,
      year: selectedYear,
      month: selectedMonth,
      type: EXPENSE_TYPES[0].value,
      source: SOURCES[0].value,
      amount: 0,
      lead: "",
      customDate: "",
    });
  };

  const handleDelete = (id: number) => setExpenses(expenses.filter(e => e.id !== id));

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditExpense({ ...expense });
  };
  const handleEditChange = (field: string, value: any) => {
    setEditExpense((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = () => {
    setExpenses(expenses.map(e => (e.id === editingId ? { ...editExpense, amount: Number(editExpense.amount), lead: editExpense.lead ? Number(editExpense.lead) : undefined } : e)));
    setEditingId(null);
    setEditExpense(null);
  };
  const handleEditCancel = () => {
    setEditingId(null);
    setEditExpense(null);
  };

  // Filtered for selected project/year/month
  const filteredExpenses = expenses.filter(e =>
    e.project === selectedProject &&
    e.year === selectedYear &&
    e.month === selectedMonth
  );

  // Grouped for summary table (project > year > month)
  const grouped = expenses.reduce((acc, e) => {
    const p = e.project;
    const y = e.year;
    const m = e.month;
    if (!acc[p]) acc[p] = {};
    if (!acc[p][y]) acc[p][y] = {};
    if (!acc[p][y][m]) acc[p][y][m] = [];
    acc[p][y][m].push(e);
    return acc;
  }, {} as any);

  // Summaries for filtered
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalMetaLead = filteredExpenses.filter(e => e.source === "meta").reduce((sum, e) => sum + (e.lead || 0), 0);
  const totalGoogleLead = filteredExpenses.filter(e => e.source === "google").reduce((sum, e) => sum + (e.lead || 0), 0);
  const totalLead = filteredExpenses.reduce((sum, e) => sum + (e.lead || 0), 0);
  const avgCPL = totalLead > 0 ? (totalAmount / totalLead).toFixed(2) : "-";

  // Group expenses by project and month for the detailed table
  const groupedDetails = expenses.reduce((acc, e) => {
    const p = e.project;
    const m = e.month;
    if (!acc[p]) acc[p] = {};
    if (!acc[p][m]) acc[p][m] = [];
    acc[p][m].push(e);
    return acc;
  }, {} as any);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="flex items-center mb-8">
        <img src={INNO_LOGO} alt="İNNO Logo" className="w-16 h-16 mr-4 rounded shadow" />
        <h2 className="text-3xl font-bold text-blue-900 tracking-tight">Lead Gider Detayları</h2>
      </div>
      <Card className="shadow-xl border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="font-medium text-blue-700">Proje:</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedProject}
              onChange={e => {
                setSelectedProject(e.target.value);
                setNewExpense({ ...newExpense, project: e.target.value });
              }}
            >
              {PROJECTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="font-medium text-blue-700 ml-4">Yıl:</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedYear}
              onChange={e => {
                setSelectedYear(Number(e.target.value));
                setNewExpense({ ...newExpense, year: Number(e.target.value) });
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="font-medium text-blue-700 ml-4">Ay:</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(Number(e.target.value));
                setNewExpense({ ...newExpense, month: Number(e.target.value) });
              }}
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <select
              className="border rounded px-2 py-1"
              value={newExpense.type}
              onChange={e => setNewExpense({ ...newExpense, type: e.target.value })}
            >
              {EXPENSE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {newExpense.type === "reklamharcama" && (
              <select
                className="border rounded px-2 py-1"
                value={newExpense.source}
                onChange={e => setNewExpense({ ...newExpense, source: e.target.value })}
              >
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}
            <input
              className="border rounded px-2 py-1 w-32"
              type="number"
              min={0}
              placeholder="Tutar (₺)"
              value={newExpense.amount}
              onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
            />
            {newExpense.type === "reklamharcama" && (
              <input
                className="border rounded px-2 py-1 w-24"
                type="number"
                min={0}
                placeholder="Lead"
                value={newExpense.lead}
                onChange={e => setNewExpense({ ...newExpense, lead: e.target.value })}
              />
            )}
            <input
              className="border rounded px-2 py-1 w-40"
              type="date"
              value={newExpense.customDate}
              onChange={e => setNewExpense({ ...newExpense, customDate: e.target.value })}
            />
            <Button onClick={handleAdd} variant="default" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Ekle
            </Button>
          </div>

          {/* Modern summary table grouped by project > year > month */}
          <div className="overflow-x-auto mt-8">
            {Object.keys(grouped).map(projectKey => (
              <div key={projectKey} className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {PROJECTS.find(p => p.value === projectKey)?.icon}
                  <span className="text-xl font-bold text-blue-900">{PROJECTS.find(p => p.value === projectKey)?.label}</span>
                </div>
                {Object.keys(grouped[projectKey]).map(yearKey => (
                  <div key={yearKey} className="mb-4 ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-lg font-semibold text-gray-800">{yearKey}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="rounded-lg overflow-hidden border">
                        <TableHeader>
                          <TableRow className="bg-blue-100">
                            <TableHead>Konu</TableHead>
                            {Object.keys(grouped[projectKey][yearKey]).map(monthKey => (
                              <TableHead key={monthKey}>{MONTHS[Number(monthKey)]}</TableHead>
                            ))}
                            <TableHead className="bg-red-200 text-red-900 font-bold">Toplam Harcama</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Ajanslar */}
                          {EXPENSE_TYPES.filter(t => t.value !== "reklamharcama").map(type => (
                            <TableRow key={type.value} className="font-semibold italic">
                              <TableCell>{type.label}</TableCell>
                              {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                                const sum = grouped[projectKey][yearKey][monthKey]
                                  .filter((e: any) => e.type === type.value)
                                  .reduce((s: number, e: any) => s + Number(e.amount), 0);
                                return <TableCell key={monthKey}>{sum > 0 ? sum.toLocaleString("tr-TR") + " ₺" : ""}</TableCell>;
                              })}
                              <TableCell className="bg-red-50">
                                {Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                  return total + grouped[projectKey][yearKey][monthKey]
                                    .filter((e: any) => e.type === type.value)
                                    .reduce((s: number, e: any) => s + Number(e.amount), 0);
                                }, 0).toLocaleString("tr-TR") + " ₺"}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Reklam Harcamaları (kaynak bazlı) */}
                          {SOURCES.map(source => (
                            <TableRow key={source.value}>
                              <TableCell>{source.label}</TableCell>
                              {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                                const sum = grouped[projectKey][yearKey][monthKey]
                                  .filter((e: any) => e.type === "reklamharcama" && e.source === source.value)
                                  .reduce((s: number, e: any) => s + Number(e.amount), 0);
                                return <TableCell key={monthKey}>{sum > 0 ? sum.toLocaleString("tr-TR") + " ₺" : ""}</TableCell>;
                              })}
                              <TableCell className="bg-red-50">
                                {Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                  return total + grouped[projectKey][yearKey][monthKey]
                                    .filter((e: any) => e.type === "reklamharcama" && e.source === source.value)
                                    .reduce((s: number, e: any) => s + Number(e.amount), 0);
                                }, 0).toLocaleString("tr-TR") + " ₺"}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Toplam Gider */}
                          <TableRow className="font-bold bg-blue-50">
                            <TableCell>TOPLAM GİDER</TableCell>
                            {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                              const sum = grouped[projectKey][yearKey][monthKey]
                                .reduce((s: number, e: any) => s + Number(e.amount), 0);
                              return <TableCell key={monthKey}>{sum > 0 ? sum.toLocaleString("tr-TR") + " ₺" : ""}</TableCell>;
                            })}
                            <TableCell className="bg-red-100">
                              {Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                return total + grouped[projectKey][yearKey][monthKey]
                                  .reduce((s: number, e: any) => s + Number(e.amount), 0);
                              }, 0).toLocaleString("tr-TR") + " ₺"}
                            </TableCell>
                          </TableRow>
                          {/* Meta Lead, Google Lead, Lead başına ort. maliyet */}
                          <TableRow className="italic">
                            <TableCell>META LEAD</TableCell>
                            {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                              const sum = grouped[projectKey][yearKey][monthKey]
                                .filter((e: any) => e.type === "reklamharcama" && e.source === "meta")
                                .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                              return <TableCell key={monthKey}>{sum > 0 ? sum : ""}</TableCell>;
                            })}
                            <TableCell className="bg-red-50">
                              {Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                return total + grouped[projectKey][yearKey][monthKey]
                                  .filter((e: any) => e.type === "reklamharcama" && e.source === "meta")
                                  .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                              }, 0)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="italic">
                            <TableCell>GOOGLE</TableCell>
                            {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                              const sum = grouped[projectKey][yearKey][monthKey]
                                .filter((e: any) => e.type === "reklamharcama" && e.source === "google")
                                .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                              return <TableCell key={monthKey}>{sum > 0 ? sum : ""}</TableCell>;
                            })}
                            <TableCell className="bg-red-50">
                              {Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                return total + grouped[projectKey][yearKey][monthKey]
                                  .filter((e: any) => e.type === "reklamharcama" && e.source === "google")
                                  .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                              }, 0)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="font-bold italic">
                            <TableCell>LEAD BAŞINA ORT MALİYET</TableCell>
                            {Object.keys(grouped[projectKey][yearKey]).map(monthKey => {
                              const totalAmount = grouped[projectKey][yearKey][monthKey]
                                .reduce((s: number, e: any) => s + Number(e.amount), 0);
                              const totalLead = grouped[projectKey][yearKey][monthKey]
                                .filter((e: any) => e.type === "reklamharcama")
                                .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                              return <TableCell key={monthKey}>{totalLead > 0 ? (totalAmount / totalLead).toFixed(2) : ""}</TableCell>;
                            })}
                            <TableCell className="bg-red-50">
                              {(() => {
                                const totalAmount = Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                  return total + grouped[projectKey][yearKey][monthKey]
                                    .reduce((s: number, e: any) => s + Number(e.amount), 0);
                                }, 0);
                                const totalLead = Object.keys(grouped[projectKey][yearKey]).reduce((total, monthKey) => {
                                  return total + grouped[projectKey][yearKey][monthKey]
                                    .filter((e: any) => e.type === "reklamharcama")
                                    .reduce((s: number, e: any) => s + (e.lead || 0), 0);
                                }, 0);
                                return totalLead > 0 ? (totalAmount / totalLead).toFixed(2) : "";
                              })()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Detailed expense list for selected project/year/month */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Detaylı Gider Listesi</h3>
            {Object.keys(groupedDetails).map(projectKey => (
              <div key={projectKey} className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {PROJECTS.find(p => p.value === projectKey)?.icon}
                  <span className="text-lg font-bold text-blue-900">{PROJECTS.find(p => p.value === projectKey)?.label}</span>
                </div>
                {Object.keys(groupedDetails[projectKey]).map(monthKey => (
                  <div key={monthKey} className="mb-4 ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-gray-800">{MONTHS[Number(monthKey)]}</span>
                    </div>
                    <Table className="rounded-lg overflow-hidden">
                      <TableHeader>
                        <TableRow className="bg-blue-100">
                          <TableHead>Tip</TableHead>
                          <TableHead>Kaynak</TableHead>
                          <TableHead>Tutar (₺)</TableHead>
                          <TableHead>Lead</TableHead>
                          <TableHead>Yıl</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedDetails[projectKey][monthKey].map((e: any) => (
                          <TableRow key={e.id} className="hover:bg-blue-50">
                            {editingId === e.id ? (
                              <>
                                <TableCell>
                                  <select
                                    className="border rounded px-2 py-1"
                                    value={editExpense.type}
                                    onChange={ev => handleEditChange("type", ev.target.value)}
                                  >
                                    {EXPENSE_TYPES.map(t => (
                                      <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                  </select>
                                </TableCell>
                                <TableCell>
                                  {editExpense.type === "reklamharcama" ? (
                                    <select
                                      className="border rounded px-2 py-1"
                                      value={editExpense.source}
                                      onChange={ev => handleEditChange("source", ev.target.value)}
                                    >
                                      {SOURCES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span>{editExpense.type === "kreatif" ? "KREATİF AJANS" : "REKLAM AJANSI"}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <input
                                    className="border rounded px-2 py-1 w-24"
                                    type="number"
                                    min={0}
                                    value={editExpense.amount}
                                    onChange={ev => handleEditChange("amount", Number(ev.target.value))}
                                  />
                                </TableCell>
                                <TableCell>
                                  {editExpense.type === "reklamharcama" ? (
                                    <input
                                      className="border rounded px-2 py-1 w-16"
                                      type="number"
                                      min={0}
                                      value={editExpense.lead || ""}
                                      onChange={ev => handleEditChange("lead", ev.target.value)}
                                    />
                                  ) : (
                                    <span>-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <input
                                    className="border rounded px-2 py-1 w-16"
                                    type="number"
                                    min={2000}
                                    value={editExpense.year}
                                    onChange={ev => handleEditChange("year", Number(ev.target.value))}
                                  />
                                </TableCell>
                                <TableCell>
                                  <input
                                    className="border rounded px-2 py-1 w-32"
                                    type="date"
                                    value={editExpense.customDate || ""}
                                    onChange={ev => handleEditChange("customDate", ev.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" variant="default" onClick={handleEditSave}>Kaydet</Button>
                                  <Button size="sm" variant="ghost" onClick={handleEditCancel}>İptal</Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>
                                  {EXPENSE_TYPES.find(t => t.value === e.type)?.icon} {EXPENSE_TYPES.find(t => t.value === e.type)?.label}
                                </TableCell>
                                <TableCell>
                                  {e.type === "reklamharcama"
                                    ? (<span>{SOURCES.find(s => s.value === e.source)?.icon} {SOURCES.find(s => s.value === e.source)?.label}</span>)
                                    : (e.type === "kreatif" ? "KREATİF AJANS" : "REKLAM AJANSI")}
                                </TableCell>
                                <TableCell>{e.amount.toLocaleString("tr-TR")} ₺</TableCell>
                                <TableCell>{e.type === "reklamharcama" ? (e.lead || "-") : "-"}</TableCell>
                                <TableCell>{e.year}</TableCell>
                                <TableCell>{e.customDate ? new Date(e.customDate).toLocaleDateString("tr-TR") : "-"}</TableCell>
                                <TableCell>
                                  <Button size="icon" variant="ghost" onClick={() => handleEdit(e)}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h18" /></svg></Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadGiderDetaylariTab;
