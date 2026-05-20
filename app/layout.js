import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Magpie Mediations — Practitioner-Led Civil Mediation',
  description: 'Connect with vetted, actively-practicing civil litigators for mediation. Fixed pricing, fully digital workflow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
