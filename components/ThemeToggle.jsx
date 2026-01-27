'use client';

import { useTheme } from '@/components/ThemeProvider';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className={styles.icon}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </span>
        </button>
    );
}
