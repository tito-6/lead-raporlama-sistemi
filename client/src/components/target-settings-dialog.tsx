import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Target,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { useSalesTargets, SalesTargetData } from "@/hooks/useSalesTargets";
import { useToast } from "@/hooks/use-toast";

interface TargetSettingsDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

interface ProjectTarget {
  projectName: string;
  target: number;
  period: "monthly" | "bimonthly";
  description: string;
}

interface PersonnelOverride {
  personnelName: string;
  projectName: string;
  target: number;
  effectiveDate: string;
}

export default function TargetSettingsDialog({
  trigger,
  className = "",
}: TargetSettingsDialogProps) {
  const {
    targets,
    loading,
    error,
    loadTargets,
    saveTargets,
    updatePersonnelTarget,
    removePersonnelTarget,
  } = useSalesTargets();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [projectTargets, setProjectTargets] = useState<ProjectTarget[]>([]);
  const [personnelOverrides, setPersonnelOverrides] = useState<PersonnelOverride[]>([]);
  const [newProjectTarget, setNewProjectTarget] = useState<ProjectTarget>({
    projectName: "",
    target: 1,
    period: "monthly",
    description: "",
  });
  const [newPersonnelOverride, setNewPersonnelOverride] = useState<PersonnelOverride>({
    personnelName: "",
    projectName: "",
    target: 1,
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Load targets when dialog opens
  useEffect(() => {
    if (open && !targets) {
      loadTargets();
    }
  }, [open, targets, loadTargets]);

  // Update local state when targets are loaded
  useEffect(() => {
    if (targets) {
      // Convert default targets to project targets array
      const defaultTargets = Object.entries(targets.salesTargets.default).map(
        ([projectName, target]) => ({
          projectName,
          target: target.target,
          period: target.period,
          description: target.description,
        })
      );
      setProjectTargets(defaultTargets);

      // Convert personnel targets to overrides array
      const overrides: PersonnelOverride[] = [];
      Object.entries(targets.salesTargets.personnel).forEach(([personnelName, projects]) => {
        Object.entries(projects).forEach(([projectName, target]) => {
          overrides.push({
            personnelName,
            projectName,
            target: target.target,
            effectiveDate: new Date().toISOString().split('T')[0], // We don't store dates yet
          });
        });
      });
      setPersonnelOverrides(overrides);
    }
  }, [targets]);

  const handleSaveProjectTargets = async () => {
    try {
      if (!targets) return;

      const updatedTargets = { ...targets };
      
      // Clear existing default targets
      updatedTargets.salesTargets.default = {};
      
      // Add all project targets
      projectTargets.forEach(pt => {
        updatedTargets.salesTargets.default[pt.projectName] = {
          target: pt.target,
          period: pt.period,
          description: pt.description,
        };
      });

      updatedTargets.salesTargets.lastUpdated = new Date().toISOString();
      
      await saveTargets(updatedTargets);
      toast({
        title: "Success",
        description: "Project targets updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project targets",
        variant: "destructive",
      });
      console.error("Error saving project targets:", error);
    }
  };

  const handleSavePersonnelOverride = async (override: PersonnelOverride) => {
    try {
      await updatePersonnelTarget(
        override.personnelName,
        override.target,
        override.projectName
      );
      toast({
        title: "Success",
        description: `Target updated for ${override.personnelName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update personnel target",
        variant: "destructive",
      });
      console.error("Error updating personnel target:", error);
    }
  };

  const handleRemovePersonnelOverride = async (personnelName: string) => {
    try {
      await removePersonnelTarget(personnelName);
      setPersonnelOverrides(prev => 
        prev.filter(override => override.personnelName !== personnelName)
      );
      toast({
        title: "Success",
        description: `Removed override for ${personnelName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove personnel override",
        variant: "destructive",
      });
      console.error("Error removing personnel override:", error);
    }
  };

  const addProjectTarget = () => {
    if (newProjectTarget.projectName && newProjectTarget.target > 0) {
      setProjectTargets(prev => [...prev, { ...newProjectTarget }]);
      setNewProjectTarget({
        projectName: "",
        target: 1,
        period: "monthly",
        description: "",
      });
    }
  };

  const removeProjectTarget = (index: number) => {
    setProjectTargets(prev => prev.filter((_, i) => i !== index));
  };

  const addPersonnelOverride = () => {
    if (newPersonnelOverride.personnelName && newPersonnelOverride.projectName) {
      const override = { ...newPersonnelOverride };
      setPersonnelOverrides(prev => [...prev, override]);
      handleSavePersonnelOverride(override);
      setNewPersonnelOverride({
        personnelName: "",
        projectName: "",
        target: 1,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className={className}>
      <Settings className="h-4 w-4 mr-2" />
      Target Settings
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Target Settings
          </DialogTitle>
          <DialogDescription>
            Configure default targets for projects and set custom targets for individual personnel.
            Changes are saved immediately and persist across server restarts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Default Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Project Default Targets
              </CardTitle>
              <CardDescription>
                Set default sales targets for each project. These apply to all personnel unless overridden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Project Targets */}
              <div className="space-y-3">
                {projectTargets.map((target, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Project</Label>
                        <Input
                          value={target.projectName}
                          onChange={(e) => {
                            const updated = [...projectTargets];
                            updated[index].projectName = e.target.value;
                            setProjectTargets(updated);
                          }}
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Target</Label>
                        <Input
                          type="number"
                          min="1"
                          value={target.target}
                          onChange={(e) => {
                            const updated = [...projectTargets];
                            updated[index].target = parseInt(e.target.value) || 1;
                            setProjectTargets(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Period</Label>
                        <Select
                          value={target.period}
                          onValueChange={(value: "monthly" | "bimonthly") => {
                            const updated = [...projectTargets];
                            updated[index].period = value;
                            setProjectTargets(updated);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="bimonthly">Bi-monthly (Every 2 months)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={target.description}
                          onChange={(e) => {
                            const updated = [...projectTargets];
                            updated[index].description = e.target.value;
                            setProjectTargets(updated);
                          }}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProjectTarget(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Project Target */}
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Add New Project Target</h4>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Project Name</Label>
                    <Input
                      value={newProjectTarget.projectName}
                      onChange={(e) => setNewProjectTarget(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="e.g., Model Sanayi Merkezi"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Target</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newProjectTarget.target}
                      onChange={(e) => setNewProjectTarget(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="w-40">
                    <Label className="text-xs">Period</Label>
                    <Select
                      value={newProjectTarget.period}
                      onValueChange={(value: "monthly" | "bimonthly") => 
                        setNewProjectTarget(prev => ({ ...prev, period: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bimonthly">Bi-monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={newProjectTarget.description}
                      onChange={(e) => setNewProjectTarget(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={addProjectTarget}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveProjectTargets} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Project Targets
              </Button>
            </CardContent>
          </Card>

          {/* Personnel Overrides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personnel Target Overrides
              </CardTitle>
              <CardDescription>
                Set custom targets for specific personnel that override the project defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Personnel Overrides */}
              <div className="space-y-3">
                {personnelOverrides.map((override, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{override.personnelName}</Badge>
                        <span className="text-sm text-gray-600">→</span>
                        <Badge variant="secondary">{override.projectName}</Badge>
                      </div>
                      <div className="text-sm">
                        Target: <span className="font-medium">{override.target} sales</span>
                        <span className="text-gray-500 ml-2">
                          (Effective: {new Date(override.effectiveDate).toLocaleDateString()})
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePersonnelOverride(override.personnelName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {personnelOverrides.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No personnel overrides configured. All personnel use project defaults.
                  </div>
                )}
              </div>

              {/* Add New Personnel Override */}
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Add Personnel Override</h4>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Personnel Name</Label>
                    <Input
                      value={newPersonnelOverride.personnelName}
                      onChange={(e) => setNewPersonnelOverride(prev => ({ ...prev, personnelName: e.target.value }))}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Project</Label>
                    <Select
                      value={newPersonnelOverride.projectName}
                      onValueChange={(value) => setNewPersonnelOverride(prev => ({ ...prev, projectName: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTargets.map((target) => (
                          <SelectItem key={target.projectName} value={target.projectName}>
                            {target.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Target</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newPersonnelOverride.target}
                      onChange={(e) => setNewPersonnelOverride(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="w-40">
                    <Label className="text-xs">Effective Date</Label>
                    <Input
                      type="date"
                      value={newPersonnelOverride.effectiveDate}
                      onChange={(e) => setNewPersonnelOverride(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addPersonnelOverride}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Override
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Project Defaults</h4>
                  <div className="space-y-1">
                    {projectTargets.map((target, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{target.projectName}:</span>{" "}
                        {target.target} sale{target.target !== 1 ? 's' : ''} per {target.period === 'monthly' ? 'month' : '2 months'}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Personnel Overrides</h4>
                  <div className="space-y-1">
                    {personnelOverrides.length > 0 ? (
                      personnelOverrides.map((override, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{override.personnelName}:</span>{" "}
                          {override.target} sales on {override.projectName}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No overrides configured</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
