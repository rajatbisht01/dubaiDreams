import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dubai Dreams",
  description: "Find Your Perfect Property in Dubai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` ${geistSans.variable} ${geistMono.variable}  `}>
        <Navigation/>
        <div className="pt-20  bg-bg-dark">
        {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}
