import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Tambahkan suppressHydrationWarning agar tidak error saat transisi tema
    <html
      lang="id"
      className="font-sans"
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* 3. Bungkus seluruh aplikasi dengan ThemeProvider */}

        {children}
      </body>
    </html>
  );
}
