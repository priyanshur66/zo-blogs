'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="p-4 flex justify-between items-center border-b">
      <Link href="/">
        <h1 className="text-2xl font-bold">zo-blogs</h1>
      </Link>
      <nav className="flex gap-4 items-center">
        <Link href="/discover">Discover</Link>
        <Link href="/write">Write</Link>
        <ConnectButton />
      </nav>
    </header>
  );
} 