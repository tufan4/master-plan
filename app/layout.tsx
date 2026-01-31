import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Master Tufan OS",
    description: "Engineering Mastermind System",
    icons: {
        icon: '/master_tufan_logo.png' // Assumed generated image path
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={spaceGrotesk.className}>{children}</body>
        </html>
    );
}
