import { Geist, Geist_Mono } from "next/font/google";
import GenerateMetadata, { isMaintenance } from "../lib/metadata";
import MaintenanceUIPage from "@/components/ui/Maintenance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  return await GenerateMetadata();
}

export default async function RootLayout({ children }) {
  const isMaintenanceUI = await isMaintenance();

  if (isMaintenanceUI) {
    return <MaintenanceUIPage />;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
