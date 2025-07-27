import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersistentExpenseManagementTab from "@/components/persistent-expense-management-tab";
import UnifiedExpenseManagementTab from "@/components/unified-expense-management-tab";

export default function ExpenseManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gider Yönetimi</h1>
      </div>

      <Tabs defaultValue="persistent" className="w-full">
        <TabsList>
          <TabsTrigger value="persistent">Kalıcı Gider Yönetimi</TabsTrigger>
          <TabsTrigger value="legacy">Eski Gider Yönetimi</TabsTrigger>
        </TabsList>

        <TabsContent value="persistent" className="mt-4">
          <PersistentExpenseManagementTab />
        </TabsContent>

        <TabsContent value="legacy" className="mt-4">
          <UnifiedExpenseManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
