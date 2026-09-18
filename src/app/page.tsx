'use client';

import dynamic from 'next/dynamic';
import ProtectedLayout from '@/components/ProtectedLayout';

const App = dynamic(() => import('../App'), { ssr: false });

export default function HomePage() {
  return (
    <ProtectedLayout>
      <App />
    </ProtectedLayout>
  );
}