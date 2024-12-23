import "./globals.css";
import { UserContextProvider } from "@/context/UserContext";
import { geistMono, geistSans } from "@/lib/fonts";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

const metadata: Metadata = {
  title: "SocialApp",
  description: "App For Mentors and Mentees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} max-w-screen overflow-x-hidden 
         bg-[#fff] flex gap-3 flex-col min-h-screen w-screen antialiased`}
      >
        <UserContextProvider>
          {children}
          <Toaster />
        </UserContextProvider>

     
      </body>
    </html>
  );
}
