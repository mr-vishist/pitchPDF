import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// import { onAuthStateChanged } from 'firebase/auth'; // No longer needed here
// import { auth } from '@/firebase/firebase'; // No longer needed here

/**
 * Auth guard hook for protecting routes
 * Redirects to /login if user is not authenticated
 * 
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useAuthGuard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isRedirecting) {
            setIsRedirecting(true);
            router.push('/login');
        }
    }, [user, loading, router, isRedirecting]);

    return { user, loading: loading || isRedirecting };
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
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
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
