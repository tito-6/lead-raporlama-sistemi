import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200 shadow-sm">
              <img
                src="/attached_assets/innogylogo.webp"
                alt="İNNO Gayrimenkul Logo"
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <AlertCircle className="h-8 w-8 text-red-500 hidden" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sayfa Bulunamadı
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Aradığınız sayfa mevcut değil.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
