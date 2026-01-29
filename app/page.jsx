'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './page.module.css';

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className={styles.landing}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className="container">
                    <div className={styles.navContent}>
                        <Link href="/" className={styles.logo}>
                            <Image src="/favicon.svg" alt="pitchPDF" width={32} height={32} className={styles.logoIcon} />
                            <span>pitchPDF</span>
                        </Link>
                        <ul className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/services">Services</Link></li>
                        </ul>
                        <div className={styles.navActions}>
                            <ThemeToggle />
                            <Link href="/signup" className="btn btn-primary">Get Started</Link>
                            <button
                                className={styles.mobileMenuBtn}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                {mobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={`${styles.hero} section`}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            The Future of Proposal<br />Generation with Latest Technology
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Create professional, winning proposals in minutes with our AI-powered platform
                        </p>
                        <div className={styles.heroCta}>
                            <Link href="/signup" className="btn btn-primary">Start Creating</Link>
                            <Link href="/about" className="btn btn-secondary">Learn More</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className={`${styles.servicesSection} section`}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>
                        Efficient and Integrated<br />Proposal Services
                    </h2>

                    <div className={styles.servicesGrid}>
                        <div className={styles.serviceCard}>
                            <div className={styles.serviceIcon}>📄</div>
                            <h3>Proposal Creation</h3>
                            <p>Generate professional proposals with AI-powered content suggestions</p>
                        </div>

                        <div className={styles.serviceCard}>
                            <div className={styles.serviceIcon}>⚡</div>
                            <h3>Quality Control</h3>
                            <p>Automated checks ensure error-free, professional output</p>
                        </div>

                        <div className={styles.serviceCard}>
                            <div className={styles.serviceIcon}>🚀</div>
                            <h3>Rapid Delivery</h3>
                            <p>Generate and download PDFs in seconds, not hours</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={`${styles.benefitsSection} section`}>
                <div className="container">
                    <div className={styles.benefitsGrid}>
                        <div className={styles.benefitsVisual}>
                            <div className={styles.chartPlaceholder}>
                                <div className={styles.barChart}>
                                    <div className={styles.bar} style={{ height: '60%' }}></div>
                                    <div className={styles.bar} style={{ height: '80%' }}></div>
                                    <div className={styles.bar} style={{ height: '45%' }}></div>
                                    <div className={styles.bar} style={{ height: '95%' }}></div>
                                    <div className={styles.bar} style={{ height: '70%' }}></div>
                                </div>
                                <div className={styles.statBadge}>
                                    <span className={styles.statBadgeNumber}>10x+</span>
                                    <span className={styles.statBadgeLabel}>Increase</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.benefitsContent}>
                            <h2>Key Benefits of Our System for Your Business Efficiency</h2>
                            <ul className={styles.benefitsList}>
                                <li>
                                    <span className={styles.checkIcon}>✓</span>
                                    <span>Reduce proposal creation time by 80%</span>
                                </li>
                                <li>
                                    <span className={styles.checkIcon}>✓</span>
                                    <span>Improve consistency across all proposals</span>
                                </li>


                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className={`${styles.pricingSection} section`}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>
                        Tailored Plans for Your<br />Proposal Needs
                    </h2>
                    <p className={styles.pricingSubtitle}>Choose the plan that fits your workflow</p>

                    <div className={styles.pricingGrid}>
                        <div className={styles.pricingCard}>
                            <h3>Pay Per Use</h3>
                            <div className={styles.price}>
                                <span className={styles.priceAmount}>₹99</span>
                                <span className={styles.pricePeriod}>/PDF</span>
                            </div>
                            <p className={styles.pricingDesc}>Perfect for occasional use</p>
                            <ul className={styles.featuresList}>
                                <li>✓ Pay only when you generate</li>
                                <li>✓ AI-powered proposals</li>
                                <li>✓ Professional PDF export</li>
                                <li>✓ No monthly commitment</li>
                            </ul>
                            <Link href="/signup" className={`btn btn-secondary ${styles.pricingBtn}`}>
                                Get Started →
                            </Link>
                        </div>

                        <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                            <div className={styles.popularBadge}>Most Popular</div>
                            <h3>Unlimited</h3>
                            <div className={styles.price}>
                                <span className={styles.priceAmount}>₹299</span>
                                <span className={styles.pricePeriod}>/month</span>
                            </div>
                            <p className={styles.pricingDesc}>For professionals who generate frequently</p>
                            <ul className={styles.featuresList}>
                                <li>✓ Unlimited PDF generations</li>
                                <li>✓ AI-powered proposals</li>
                                <li>✓ Professional PDF export</li>
                                <li>✓ Best value for regular use</li>
                            </ul>
                            <Link href="/signup" className={`btn btn-primary ${styles.pricingBtn}`}>
                                Get Started →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className={`${styles.ctaSection} section`}>
                <div className="container">
                    <div className={styles.ctaContent}>
                        <h2>From Idea to Proposal in Minutes</h2>
                        <p>Join thousands of professionals who trust pitchPDF</p>
                        <Link href="/signup" className="btn btn-primary">Get Started Now</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerGrid}>
                        <div className={styles.footerBrand}>
                            <div className={styles.logo}>
                                <Image src="/favicon.svg" alt="pitchPDF" width={32} height={32} className={styles.logoIcon} />
                                <span>pitchPDF</span>
                            </div>
                            <p>Streamline your proposal workflow with AI-powered automation and professional templates.</p>
                        </div>
                        <div className={styles.footerLinks}>
                            <h4>Company</h4>
                            <ul>
                                <li><Link href="/about">About Us</Link></li>
                                <li><Link href="/services">Services</Link></li>

                            </ul>
                        </div>
                        <div className={styles.footerLinks}>
                            <h4>Resources</h4>
                            <ul>
                                <li><Link href="/dashboard">Dashboard</Link></li>
                                <li><Link href="/history">History</Link></li>
                                <li><Link href="/billing">Pricing</Link></li>
                            </ul>
                        </div>
                        <div className={styles.footerLinks}>
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link href="/login">Sign In</Link></li>
                                <li><Link href="/signup">Sign Up</Link></li>
                                <li><Link href="/account">Account</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <p>© 2026 pitchPDF. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
