import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface TimeFrameDisplayProps {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
}

export function TimeFrameDisplay({
  startDate,
  endDate,
  month,
  year,
}: TimeFrameDisplayProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const getMonthName = (monthStr?: string) => {
    if (!monthStr) return "";
    const monthIndex = parseInt(monthStr, 10) - 1;
    return monthNames[monthIndex] || monthStr;
  };

  const getCurrentPeriod = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} - Günümüz`;
    } else if (month && year) {
      return `${getMonthName(month)} ${year}`;
    } else if (month) {
      return `${getMonthName(month)} ${new Date().getFullYear()}`;
    } else if (year) {
      return `${year} Yılı`;
    } else {
      return "Tüm Zamanlar";
    }
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="py-1 px-2 flex items-center gap-1">
        <CalendarIcon className="h-3.5 w-3.5" />
        <span>Zaman Aralığı:</span>
      </Badge>
      <Badge variant="secondary" className="py-1 px-2">
        {currentPeriod}
      </Badge>
    </div>
  );
}
