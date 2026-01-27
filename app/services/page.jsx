import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './services.module.css';

export default function ServicesPage() {
    return (
        <div className={styles.servicesPage}>
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
                        <h1>Our Services</h1>
                        <p className={styles.lead}>
                            Comprehensive proposal solutions tailored to your business needs.
                        </p>

                        <div className={styles.servicesGrid}>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>📄</div>
                                <h3>AI-Powered Proposal Generation</h3>
                                <p>
                                    Let our advanced AI help you create compelling, professional proposals in minutes.
                                    Our system understands your business and suggests the best content.
                                </p>
                            </div>







                            <div className={styles.serviceCard}>
                                <div className={styles.serviceIcon}>⚡</div>
                                <h3>Rapid PDF Export</h3>
                                <p>
                                    Generate high-quality PDF documents instantly. Our optimized rendering ensures
                                    your proposals look perfect every time.
                                </p>
                            </div>


                        </div>

                        <div className={styles.cta}>
                            <h2>Ready to transform your proposal workflow?</h2>
                            <Link href="/signup" className="btn btn-primary">Start Creating Now</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
