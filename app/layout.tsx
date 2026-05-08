import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '工程图学 AI 答案生成器',
  description: '上传工程图学题目图片，选择题型，生成 SVG 形式答案。'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
