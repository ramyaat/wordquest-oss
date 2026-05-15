import './globals.css'

export const metadata = {
  title: 'Word Quest – Battle of Words',
  description: 'Grade 7 Vocabulary Competition Trainer',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
