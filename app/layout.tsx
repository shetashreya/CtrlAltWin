import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";

const primaryFont = Geist({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

// Change the title and description to your own.
export const metadata: Metadata = {
  title: "Coastal Threat Alert System",
  description: "AI-powered early warning platform for coastal communities & ecosystems - Hackathon MVP",
};

export default function RootLayout({
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body className="antialiased">
        <main className="h-screen">
          <CosmicAnalyticsProvider>
            {children}
          </CosmicAnalyticsProvider>
        </main>
      </body>
    </html>
  );
}