import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
