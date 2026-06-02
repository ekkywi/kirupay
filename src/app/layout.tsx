import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Trezalink",
    template: "Trezalink | %s",
  },
  description: "Non-custodial Solana payment gateway with atomic split-fee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased bg-[#F8F9FA] text-gray-900 dark:bg-[#030305] dark:text-white transition-colors duration-300`}>
        <ThemeProvider defaultTheme="dark" enableSystem>
          <SolanaProvider>
            {children}
          </SolanaProvider>
        </ThemeProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
