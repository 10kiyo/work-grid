import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://work-grid-liard.vercel.app'),
  title: {
    default: 'WorkGrid — Real-time Collaborative Kanban',
    template: '%s | WorkGrid',
  },
  description:
    'Platform manajemen proyek berbasis Kanban dengan sinkronisasi Supabase Realtime, optimistic drag-and-drop, dan isolasi keamanan multi-tenant Row Level Security.',
  icons: {
    icon: '/logo-kiyo.webp?v=2',
    shortcut: '/logo-kiyo.webp?v=2',
    apple: '/logo-kiyo.webp?v=2',
  },
  openGraph: {
    title: 'WorkGrid — Real-time Collaborative Kanban',
    description:
      'Platform manajemen proyek berbasis Kanban dengan sinkronisasi Supabase Realtime, optimistic drag-and-drop, dan Row Level Security.',
    url: 'https://work-grid-liard.vercel.app',
    siteName: 'WorkGrid',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkGrid — Real-time Collaborative Kanban',
    description:
      'Platform manajemen proyek berbasis Kanban dengan Supabase Realtime & Row Level Security.',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
