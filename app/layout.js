import './globals.css';

export const metadata = {
  title: "Akshita's Games 🌸",
  description: 'Simple games for Akshita',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
