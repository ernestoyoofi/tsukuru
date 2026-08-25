import { Geist, JetBrains_Mono, Crimson_Text } from "next/font/google";
import GenerateMetadata, { isMaintenance } from "../lib/metadata";
import MaintenanceUIPage from "@/components/ui/Maintenance";
import "./globals.css";
import Header from "@/components/ui/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
});
const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  variable: "--font-crimson-text",
  subsets: ["latin"],
  preload: true,
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  preload: true,
});

export async function generateMetadata() {
  return await GenerateMetadata();
}

export default async function RootLayout({ children }) {
  const isMaintenanceUI = await isMaintenance();
  const globalVariableFonts = `${crimsonText.variable} ${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased`;

  if (isMaintenanceUI) {
    return (
      <html lang="en" className={globalVariableFonts}>
        <body>
          <MaintenanceUIPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={globalVariableFonts}>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
