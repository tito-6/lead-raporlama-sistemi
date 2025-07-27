import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";
import { detectProjectFromWebFormNotu } from "@/lib/project-detector";
import { useQuery } from "@tanstack/react-query";

interface Lead {
  id?: string;
  webFormNote?: string;
  projectName?: string;
  [key: string]: any;
}

interface ProjectFilterProps {
  value: string;
  onChange: (project: string) => void;
  availableProjects?: string[];
}

export default function ProjectFilter({
  value,
  onChange,
  availableProjects,
}: ProjectFilterProps) {
  // If availableProjects is not provided, extract from leads
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      return response.json();
    },
    enabled: !availableProjects,
  });

  const projects = useMemo(() => {
    if (availableProjects && availableProjects.length > 0)
      return availableProjects;

    // Use a normalized map to prevent case-sensitive duplicates
    const projectMap = new Map<string, string>();

    // Add our primary projects with correct capitalization
    const primaryProjects = ["Model Sanayi Merkezi", "Model Kuyum Merkezi"];
    primaryProjects.forEach((project) => {
      const normalizedKey = project.toLowerCase();
      projectMap.set(normalizedKey, project);
    });

    // Add projects from leads but respect our primary project capitalizations
    leads.forEach((lead) => {
      // Extract from webFormNotu
      const webFormNotu = lead.webFormNote || "";
      const detectedProject = detectProjectFromWebFormNotu(webFormNotu);
      if (detectedProject) {
        const normalizedKey = detectedProject.toLowerCase();
        // Only add if it's not a primary project or doesn't exist yet
        if (!projectMap.has(normalizedKey)) {
          projectMap.set(normalizedKey, detectedProject);
        }
      }

      // Extract from projectName
      if (lead.projectName) {
        const normalizedKey = lead.projectName.toLowerCase();
        // Only add if it's not a primary project or doesn't exist yet
        if (!projectMap.has(normalizedKey)) {
          projectMap.set(normalizedKey, lead.projectName);
        }
      }
    });

    return Array.from(projectMap.values()).sort();
  }, [leads, availableProjects]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          Proje Filtresi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Proje seçin" />
          </SelectTrigger>
          <SelectContent className="w-full max-w-xs">
            <SelectItem value="all">Tüm Projeler</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
