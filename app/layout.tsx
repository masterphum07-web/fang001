import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bloom & Care - ระบบติดตามรอบเดือน & ซัพพอร์ตแฟน 💙',
  description: 'ระบบติดตามรอบเดือนอิงหลักสูตินารีแพทย์ (ACOG) พร้อมโหมด Partner Care สำหรับดูแลคนที่คุณรัก',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Prompt:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-800 font-['Kanit',sans-serif]">
        {children}
      </body>
    </html>
  );
}
