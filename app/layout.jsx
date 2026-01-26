import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
    title: 'pitchPDF',
    description: 'Professional proposal generator for freelancers and businesses',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
