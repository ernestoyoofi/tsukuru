import { Geist, JetBrains_Mono, Crimson_Text } from "next/font/google";
import GenerateMetadata, { isMaintenance } from "../lib/metadata";
import MaintenanceUIPage from "@/components/ui/Maintenance";
import Header from "@/components/ui/Header";
import "./globals.css";
import GlobalRootClient from "./RootClient";
import Footer from "@/components/ui/Footer";
import loadConfig from "@/lib/load-config";

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
  const loadConfigs = await loadConfig();
  const globalVariableFonts = `${crimsonText.variable} ${geistSans.variable} ${jetBrainsMono.variable} h-full antialiased`;

  const basicMeta = {
    title: loadConfigs?.metadata?.title?.default || "",
    description: loadConfigs?.metadata?.description || "",
    url: loadConfigs?.metadata?.url || "",
  };

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
        <GlobalRootClient>
          <Header data={basicMeta} />
          <main className="w-full min-h-[calc(100dvh-50px)]">{children}</main>
          <Footer data={basicMeta} />
        </GlobalRootClient>
      </body>
    </html>
  );
}
