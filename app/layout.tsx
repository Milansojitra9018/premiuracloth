import type { Metadata } from 'next';
import "@/src/index.css";
import Providers from './providers';
import { LayoutWrapper } from './LayoutWrapper';

export const metadata: Metadata = {
  title: 'Premiura | Premium Clothing & Fabric Studio',
  description: 'Discover Premiura, your ultimate destination for premium clothing and high-quality fabrics. Shop the latest trends in men\'s, women\'s, and kids\' fashion.',
  keywords: 'clothing, fashion, premium fabric, men\'s wear, women\'s wear, kids\' wear, textile studio, Premiura'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
