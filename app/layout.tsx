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
      <body className="min-h-screen bg-[#F6FAFE] text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-800">
        {children}
      </body>
    </html>
  );
}
