import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  // Customer Information
  customerId: text("customer_id"),
  contactId: text("contact_id"),
  customerName: text("customer_name").notNull(),

  // Source and Form Data
  firstCustomerSource: text("first_customer_source"),
  formCustomerSource: text("form_customer_source"),
  webFormNote: text("web_form_note"),
  requestDate: text("request_date").notNull(),
  infoFormLocation1: text("info_form_location_1"),
  infoFormLocation2: text("info_form_location_2"),
  infoFormLocation3: text("info_form_location_3"),
  infoFormLocation4: text("info_form_location_4"),

  // Personnel Assignment
  assignedPersonnel: text("assigned_personnel").notNull(),
  reminderPersonnel: text("reminder_personnel"),

  // Response and Follow-up
  wasCalledBack: text("was_called_back"), // Geri dönüş yapıldı mı?
  webFormPoolDate: text("web_form_pool_date"),
  formSystemDate: text("form_system_date"),
  assignmentTimeDiff: text("assignment_time_diff"),
  responseTimeDiff: text("response_time_diff"),
  outgoingCallSystemDate: text("outgoing_call_system_date"),
  customerResponseDate: text("customer_response_date"),
  wasEmailSent: text("was_email_sent"), // Mail gönderildi mi?
  customerEmailResponseDate: text("customer_email_response_date"),
  unreachableByPhone: text("unreachable_by_phone"),
  daysWaitingResponse: integer("days_waiting_response"),
  daysToResponse: integer("days_to_response"),
  callNote: text("call_note"),
  emailNote: text("email_note"),

  // Meeting and Results
  oneOnOneMeeting: text("one_on_one_meeting"), // Birebir görüşme yapıldı mı?
  meetingDate: text("meeting_date"),
  responseResult: text("response_result"), // Dönüş görüşme sonucu
  negativeReason: text("negative_reason"), // Dönüş olumsuzluk nedeni
  wasSaleMade: text("was_sale_made"), // Satış yapıldı mı?
  saleCount: integer("sale_count"),
  appointmentDate: text("appointment_date"),
  lastMeetingNote: text("last_meeting_note"),
  lastMeetingResult: text("last_meeting_result"),

  // Derived fields
  leadType: text("lead_type").notNull(), // 'kiralama' or 'satis' (derived from webFormNote)
  status: text("status").notNull(), // 'yeni', 'bilgi-verildi', 'olumsuz', 'satis', 'takipte', 'randevu'
  projectName: text("project_name"), // Extracted from WebForm Notu

  // Lead Expenses (in Turkish Lira)
  agencyMonthlyFees: decimal("agency_monthly_fees", {
    precision: 10,
    scale: 2,
  }).default("0.00"), // Agency monthly fees in TL
  adsExpenses: decimal("ads_expenses", { precision: 10, scale: 2 }).default(
    "0.00"
  ), // Advertising expenses in TL

  createdAt: timestamp("created_at").defaultNow(),
});

export const salesReps = pgTable("sales_reps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  monthlyTarget: integer("monthly_target").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const leadExpenses = pgTable("lead_expenses", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(), // Format: "2025-01"
  expenseType: text("expense_type").notNull(), // "agency_fee" or "ads_expense"
  amountTL: decimal("amount_tl", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  projectName: text("project_name"), // For ads_expense, can specify which project it belongs to
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    // Make some fields optional for backwards compatibility
    customerId: z.string().optional(),
    contactId: z.string().optional(),
    firstCustomerSource: z.string().optional(),
    formCustomerSource: z.string().optional(),
    webFormNote: z.string().optional(),
    infoFormLocation1: z.string().optional(),
    infoFormLocation2: z.string().optional(),
    infoFormLocation3: z.string().optional(),
    infoFormLocation4: z.string().optional(),
    reminderPersonnel: z.string().optional(),
    wasCalledBack: z.string().optional(),
    webFormPoolDate: z.string().optional(),
    formSystemDate: z.string().optional(),
    assignmentTimeDiff: z.string().optional(),
    responseTimeDiff: z.string().optional(),
    outgoingCallSystemDate: z.string().optional(),
    customerResponseDate: z.string().optional(),
    wasEmailSent: z.string().optional(),
    customerEmailResponseDate: z.string().optional(),
    unreachableByPhone: z.string().optional(),
    daysWaitingResponse: z.number().optional(),
    daysToResponse: z.number().optional(),
    agencyMonthlyFees: z.string().optional(),
    adsExpenses: z.string().optional(),
    callNote: z.string().optional(),
    emailNote: z.string().optional(),
    oneOnOneMeeting: z.string().optional(),
    meetingDate: z.string().optional(),
    responseResult: z.string().optional(),
    negativeReason: z.string().optional(),
    wasSaleMade: z.string().optional(),
    saleCount: z.number().optional(),
    appointmentDate: z.string().optional(),
    lastMeetingNote: z.string().optional(),
    lastMeetingResult: z.string().optional(),
    projectName: z.string().optional(),
  });

export const insertSalesRepSchema = createInsertSchema(salesReps).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }).default(
    "0"
  ),
  totalLeads: integer("total_leads").default(0),
  cpl: decimal("cpl", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadExpenseSchema = createInsertSchema(leadExpenses)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    expenseType: z.enum(["agency_fee", "ads_expense"]),
    projectName: z.string().optional(), // Optional project name for ads_expense
  });

export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type SalesRep = typeof salesReps.$inferSelect;
export type InsertSalesRep = z.infer<typeof insertSalesRepSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type LeadExpense = typeof leadExpenses.$inferSelect;
export type InsertLeadExpense = z.infer<typeof insertLeadExpenseSchema>;
export type LeadSource = typeof leadSources.$inferSelect;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;
