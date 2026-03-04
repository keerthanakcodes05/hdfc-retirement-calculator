import '../styles/globals.css';

export const metadata = {
  title: 'Retirement Planning Calculator | HDFC Mutual Fund',
  description:
    'Plan your retirement corpus with HDFC Mutual Fund. Calculate required SIP, corpus needed, and see your life timeline — Education, FinCal Innovation Hackathon.',
  keywords: 'HDFC Mutual Fund, retirement planning calculator, SIP, corpus, financial planning, mutual fund',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#224c87',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
