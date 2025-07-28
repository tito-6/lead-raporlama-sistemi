import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Save, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSalesReps } from "@/hooks/use-leads";

export default function SimplifiedSettingsTab() {
  const salesReps = useSalesReps().data || [];
  const queryClient = useQueryClient();
  const [targets, setTargets] = useState<Record<number, number>>({});

  // Initialize targets from sales reps
  useEffect(() => {
    if (salesReps.length > 0) {
      const targetsMap = salesReps.reduce(
        (acc: Record<number, number>, rep) => {
          // Default target to 1 sale per month as requested
          acc[rep.id] = rep.monthlyTarget || 1;
          return acc;
        },
        {}
      );
      setTargets(targetsMap);
    }
  }, [salesReps]);

  // Save targets mutation
  const saveTargetsMutation = useMutation({
    mutationFn: async ({
      id,
      monthlyTarget,
    }: {
      id: number;
      monthlyTarget: number;
    }) => {
      const response = await fetch(`/api/salesreps/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monthlyTarget }),
      });

      if (!response.ok) {
        throw new Error("Failed to save target");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salesreps"] });
      console.log("Satış hedefleri başarıyla kaydedildi");
    },
    onError: () => {
      console.error("Satış hedefleri kaydedilemedi");
    },
  });

  // Save all targets at once
  const saveAllTargets = async () => {
    try {
      await Promise.all(
        Object.entries(targets).map(([id, monthlyTarget]) =>
          saveTargetsMutation.mutate({
            id: parseInt(id),
            monthlyTarget,
          })
        )
      );
    } catch (error) {
      console.error("Error saving targets:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">⚙️ Ayarlar</h2>
          <p className="text-muted-foreground">
            Satış personeli aylık hedeflerini ayarlayın
          </p>
        </div>
      </div>

      {/* Monthly Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Satış Personeli Aylık Hedefleri
          </CardTitle>
          <CardDescription>
            Her satış personeli için aylık hedefi belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesReps.length > 0 ? (
              <>
                {salesReps.map((rep) => (
                  <div
                    key={rep.id}
                    className="grid grid-cols-2 gap-4 items-center border-b pb-3"
                  >
                    <div>
                      <Label htmlFor={`target-${rep.id}`}>{rep.name}</Label>
                    </div>
                    <div>
                      <Input
                        id={`target-${rep.id}`}
                        type="number"
                        min="0"
                        value={targets[rep.id] || rep.monthlyTarget || 1}
                        onChange={(e) =>
                          setTargets({
                            ...targets,
                            [rep.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={saveAllTargets}
                    disabled={saveTargetsMutation.isPending}
                  >
                    {saveTargetsMutation.isPending ? (
                      <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Hedefleri Kaydet
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Satış personeli bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
