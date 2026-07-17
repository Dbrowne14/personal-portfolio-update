import type { Metadata } from "next";
import { archivo, ibmPlexMono } from "@/lib/fonts";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "David Browne — Full-stack product engineer",
  description:
    "From evaluating products to shipping them. David Browne is a London-based full-stack engineer building complete products after eight years in technology investment banking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <div className="flex flex-1 flex-col pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
