import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withLogo?: boolean;
}

export function LoadingSpinner({
  size = "md",
  className = "",
  withLogo = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (withLogo) {
    return (
      <div
        className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      >
        <div className="relative">
          <img
            src="/attached_assets/innogylogo.webp"
            alt="İNNO Gayrimenkul Logo"
            className="w-16 h-16 object-contain animate-pulse"
          />
        </div>
        <Loader2
          className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        />
        <p className="text-sm text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}
