import type { Metadata } from "next";
import { Inter, Syncopate } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-syncopate" });

export const metadata: Metadata = {
    title: "Master Tufan OS",
    description: "Engineering Mastermind System",
    icons: {
        icon: '/master_tufan_logo_v3.png?v=3'
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${syncopate.variable} font-sans bg-slate-950 text-slate-200`}>{children}</body>
        </html>
    );
}
