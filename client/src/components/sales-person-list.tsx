import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalesPersonProps {
  salesPersons: { name: string; count: number; percentage?: number }[];
  onVisibilityChange?: (visiblePersonnel: string[]) => void;
}

export function SalesPersonList({
  salesPersons,
  onVisibilityChange,
}: SalesPersonProps) {
  // Default to showing only Recber and Yasemin
  const [visiblePersonnel, setVisiblePersonnel] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Initialize with only Recber and Yasemin visible
    const initialVisible = new Set(
      salesPersons
        .filter(
          (person) =>
            person.name.toLowerCase().includes("recber") ||
            person.name.toLowerCase().includes("yasemin")
        )
        .map((person) => person.name)
    );

    setVisiblePersonnel(initialVisible);

    // Notify parent component
    if (onVisibilityChange) {
      onVisibilityChange(Array.from(initialVisible));
    }
  }, [salesPersons]);

  const toggleVisibility = (name: string) => {
    const newVisiblePersonnel = new Set(visiblePersonnel);

    if (newVisiblePersonnel.has(name)) {
      newVisiblePersonnel.delete(name);
    } else {
      newVisiblePersonnel.add(name);
    }

    setVisiblePersonnel(newVisiblePersonnel);

    // Notify parent component
    if (onVisibilityChange) {
      onVisibilityChange(Array.from(newVisiblePersonnel));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Personel</TableHead>
          <TableHead className="text-center">Lead Sayısı</TableHead>
          <TableHead className="text-center">Oran</TableHead>
          <TableHead className="text-center">Görünürlük</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {salesPersons.map((person) => (
          <TableRow key={person.name}>
            <TableCell>
              <span className="font-medium">{person.name}</span>
            </TableCell>
            <TableCell className="text-center">{person.count}</TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">
                %{person.percentage ? person.percentage.toFixed(1) : 0}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleVisibility(person.name)}
                aria-label={
                  visiblePersonnel.has(person.name) ? "Gizle" : "Göster"
                }
                title={visiblePersonnel.has(person.name) ? "Gizle" : "Göster"}
              >
                {visiblePersonnel.has(person.name) ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
