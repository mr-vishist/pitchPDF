import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <div className={styles.aboutPage}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className="container">
                    <div className={styles.navContent}>
                        <Link href="/" className={styles.logo}>
                            <Image src="/favicon.svg" alt="pitchPDF" width={32} height={32} className={styles.logoIcon} />
                            <span>pitchPDF</span>
                        </Link>
                        <ul className={styles.navLinks}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/services">Services</Link></li>

                        </ul>
                        <div className={styles.navActions}>
                            <ThemeToggle />
                            <Link href="/signup" className="btn btn-primary">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <section className="section">
                <div className="container">
                    <div className={styles.content}>
                        <h1>About pitchPDF</h1>
                        <p className={styles.lead}>
                            We're revolutionizing the way professionals create proposals with AI-powered automation.
                        </p>
                        <div className={styles.story}>
                            <h2>Our Story</h2>
                            <p>
                                pitchPDF was born from the frustration of spending countless hours crafting proposals manually.
                                We knew there had to be a better way to help freelancers, agencies, and businesses create
                                professional, winning proposals in a fraction of the time.
                            </p>
                            <p>
                                Today, we serve thousands of professionals worldwide, helping them save time, increase
                                consistency, and win more business with our AI-powered platform.
                            </p>
                        </div>
                        <div className={styles.values}>
                            <h2>Our Values</h2>
                            <div className={styles.valuesGrid}>
                                <div className={styles.valueCard}>
                                    <h3>🚀 Innovation</h3>
                                    <p>Constantly pushing the boundaries of what's possible with AI</p>
                                </div>
                                <div className={styles.valueCard}>
                                    <h3>💎 Quality</h3>
                                    <p>Never compromising on the excellence of our output</p>
                                </div>
                                <div className={styles.valueCard}>
                                    <h3>🤝 Trust</h3>
                                    <p>Building lasting relationships with transparency and integrity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
