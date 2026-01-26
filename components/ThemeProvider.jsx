'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => null,
    resolvedTheme: 'light',
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Define auth routes that must always be light
    const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].some(route =>
        pathname?.startsWith(route)
    );

    useEffect(() => {
        setMounted(true);
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        // If on auth route, force light theme visual
        if (isAuthRoute) {
            setResolvedTheme('light');
            root.setAttribute('data-theme', 'light');
            // We do NOT update localStorage here to preserve user preference
            return;
        }

        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const targetTheme = theme === 'system' ? systemTheme : theme;

        setResolvedTheme(targetTheme);
        root.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                const newSystemTheme = e.matches ? 'dark' : 'light';
                setResolvedTheme(newSystemTheme);
                root.setAttribute('data-theme', newSystemTheme);
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, mounted, isAuthRoute]);

    // Avoid hydration mismatch by rendering nothing until mounted (or a placeholder)
    // For a theme provider, rendering children is usually fine, but the theme might flash.
    // We'll render children immediately but the effect applies the attribute.

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
