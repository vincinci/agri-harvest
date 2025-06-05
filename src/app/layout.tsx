import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fresh Greenhouse - Premium Vegetables",
  description: "Fresh vegetables grown in our sustainable greenhouses. Premium peppers, carrots, and cucumbers delivered to your door.",
  authors: [{ name: "Fresh Greenhouse" }],
  keywords: "vegetables, greenhouse, peppers, carrots, cucumbers, fresh produce",
  openGraph: {
    title: "Fresh Greenhouse - Premium Vegetables",
    description: "Fresh vegetables grown in our sustainable greenhouses.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fresh Greenhouse - Premium Vegetables",
    description: "Fresh vegetables grown in our sustainable greenhouses.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
