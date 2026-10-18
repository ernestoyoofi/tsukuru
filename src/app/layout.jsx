import { Crimson_Text, Geist, JetBrains_Mono } from "next/font/google";
import Header from "@/components/ui/Header";
import MaintenanceUIPage from "@/components/ui/Maintenance";
import GenerateMetadata, { isMaintenance } from "../lib/metadata";
import "./globals.css";
import Footer from "@/components/ui/Footer";
import detectAssets from "@/lib/assets-detected";
import loadConfig from "@/lib/load-config";
import GlobalRootClient from "./RootClient";

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
  const assetsHeader = await detectAssets({
    dir: "~/public/assets",
    filename: "icon-header",
    match_ext: ["svg", "webp", "png"],
  });
  const assetsFooter = await detectAssets({
    dir: "~/public/assets",
    filename: "icon-footer",
    match_ext: ["svg", "webp", "png"],
  });

  const basicMeta = {
    title: loadConfigs?.metadata?.title?.default || "",
    description: loadConfigs?.metadata?.description || "",
    url: loadConfigs?.metadata?.url || "",
    creator: loadConfigs?.metadata?.creator || "",
    assets: {
      preload_dir: loadConfigs.base.dist || "",
      media: {
        header: assetsHeader[0]?.name,
        footer: assetsFooter[0]?.name,
      },
    },
    footer: loadConfigs.footer || {},
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
