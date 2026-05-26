import "./globals.css";

export const metadata = {
  title: "Rent Management",
  description: "Private tenant rent and electricity bill manager",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f3f6f4] bg-[linear-gradient(180deg,rgba(22,114,79,0.12),transparent_310px)] font-sans text-[#17211c] dark:bg-[#111714] dark:bg-[linear-gradient(180deg,rgba(61,171,129,0.14),transparent_320px)] dark:text-[#eef7f2] print:bg-white print:text-black">
        {children}
      </body>
    </html>
  );
}
