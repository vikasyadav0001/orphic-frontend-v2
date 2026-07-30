import type { Metadata } from "next";
import { Inter, Pacifico, Chelsea_Market } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth-guard";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

const chelsea = Chelsea_Market({
  variable: "--font-chelsea",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orphic AI",
  description: "Next Generation AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pacifico.variable} ${chelsea.variable} dark h-full overflow-x-hidden max-w-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden max-w-full bg-background text-foreground">
        <TooltipProvider>
          <AuthGuard>{children}</AuthGuard>
        </TooltipProvider>
      </body>
    </html>
  );
}
