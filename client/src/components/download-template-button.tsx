import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function DownloadTemplateButton() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/expense-template.csv";
    link.download = "gider-sablonu.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      className="gap-1"
    >
      <FileDown className="h-3 w-3" />
      Şablon İndir
    </Button>
  );
}
