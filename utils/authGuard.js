'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

/**
 * Auth guard hook for protecting routes
 * Redirects to /login if user is not authenticated
 * 
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useAuthGuard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // Not logged in - redirect to login
                router.push('/login');
            } else {
                // Logged in - allow access
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    return { user, loading };
}

/**
 * Loading component shown while checking auth state
 */
export function AuthLoading() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa'
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e5e7eb',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
