import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import { brands, products } from "@/lib/data";

export const metadata: Metadata = {
  title: "FIT MAP",
  description: "내가 만족했던 옷을 기준으로 다른 브랜드 옷의 핏을 비교해요",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const drawerBrands = brands.map((b) => ({ id: b.id, name: b.name, count: products.filter((p) => p.brandId === b.id).length }));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-neutral-100 text-neutral-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white pb-10 shadow-sm">
          <AppHeader brands={drawerBrands} />
          {children}
        </div>
      </body>
    </html>
  );
}
