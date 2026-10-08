import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Provider } from "@/components/provider";
import { Shell } from "@/components/shell";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source",
});

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "TOEIC 300 OS",
  description: "56 天托业阅读个人备考助理。打开就知道今天做什么。",
  applicationName: "TOEIC 300 OS",
  appleWebApp: { capable: true, title: "TOEIC 300", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
