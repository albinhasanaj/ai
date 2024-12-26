"use client";
import React, { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// grab password from env called passwordNEXT_PUBLIC_PASSWORD
const password = process.env.NEXT_PUBLIC_PASSWORD;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Local state for the password
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    // Only access localStorage on the client-side
    const savedPassword = localStorage.getItem("password");
    if (savedPassword) {
      setCurrentPassword(savedPassword);
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {currentPassword === password ? (
          <div>{children}</div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white p-6 rounded shadow-md">
              <h1 className="text-3xl font-bold mb-4">Enter Password</h1>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  // set local storage
                  localStorage.setItem("password", e.target.value);
                }}
                placeholder="Password"
                className="border p-2 rounded mb-4 w-full"
              />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
