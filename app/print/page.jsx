'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from '../generate/generate.module.css';

function ProposalPreview() {
    const searchParams = useSearchParams();

    // Decode data from URL
    let formData = {
        clientName: '',
        clientCompany: '',
        projectTitle: '',
        problemStatement: '',
        proposedSolution: '',
        scopeOfWork: '',
        timeline: '',
        pricing: '',
        terms: '',
        contactInfo: ''
    };

    try {
        const encodedData = searchParams.get('data');
        if (encodedData) {
            formData = JSON.parse(decodeURIComponent(encodedData));
        }
    } catch (e) {
        console.error('Failed to parse proposal data:', e);
    }

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={styles.printContainer}>
            <div className={styles.proposal}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <div className={styles.heroOverlay}></div>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBrand}>
                            <span className={styles.brandDot}></span>
                            <span className={styles.brandName}>pitchPDF</span>
                        </div>
                        <h1 className={styles.heroTitle}>
                            {formData.projectTitle || 'Project Proposal'}
                        </h1>
                        <p className={styles.heroSubtitle}>Professional Services Proposal</p>
                        <div className={styles.heroMeta}>
                            <span className={styles.heroBadge}>PROPOSAL</span>
                            <span className={styles.heroDate}>{today}</span>
                        </div>
                    </div>
                    <div className={styles.heroShape}></div>
                </div>

                {/* Client Panel */}
                <div className={styles.clientPanel}>
                    <div className={styles.clientCard}>
                        <span className={styles.panelLabel}>Prepared For</span>
                        <h3 className={styles.clientName}>
                            {formData.clientName || 'Client Name'}
                        </h3>
                        <p className={styles.clientCompany}>
                            {formData.clientCompany || 'Company Name'}
                        </p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className={styles.contentArea}>
                    {/* Two-Column: Challenge + Solution */}
                    {(formData.problemStatement || formData.proposedSolution) && (
                        <div className={styles.twoColumnGrid}>
                            {formData.problemStatement && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <span className={styles.iconDot}></span>
                                        </div>
                                        <h2 className={styles.cardTitle}>The Challenge</h2>
                                    </div>
                                    <p className={styles.cardBody}>{formData.problemStatement}</p>
                                </div>
                            )}

                            {formData.proposedSolution && (
                                <div className={styles.contentCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <span className={styles.iconDot}></span>
                                        </div>
                                        <h2 className={styles.cardTitle}>Our Solution</h2>
                                    </div>
                                    <p className={styles.cardBody}>{formData.proposedSolution}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {formData.scopeOfWork && (
                        <div className={`${styles.docSection} ${styles.altBg}`}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionAnchor}></div>
                                <h2 className={styles.sectionTitle}>Scope of Work</h2>
                            </div>
                            <div className={styles.scopeGrid}>
                                {formData.scopeOfWork.split('\n').filter(line => line.trim()).map((item, i) => (
                                    <div key={i} className={styles.scopeBlock}>
                                        <div className={styles.scopeHeader}>
                                            <span className={styles.scopeDot}></span>
                                            <span className={styles.scopeIndex}>0{i + 1}</span>
                                        </div>
                                        <p className={styles.scopeContent}>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.timeline && (
                        <div className={styles.docSection}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionAnchor}></div>
                                <h2 className={styles.sectionTitle}>Timeline</h2>
                            </div>
                            <div className={styles.timelineContainer}>
                                <div className={styles.timelineLine}></div>
                                {formData.timeline.split('\n').filter(line => line.trim()).map((item, i) => (
                                    <div key={i} className={styles.timelineItem}>
                                        <div className={styles.timelineMarker}></div>
                                        <div className={styles.timelineContent}>
                                            <span className={styles.timelinePhase}>Phase {i + 1}</span>
                                            <p className={styles.timelineText}>{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Investment Highlight */}
                    {formData.pricing && (
                        <div className={styles.investmentCard}>
                            <div className={styles.investmentOverlay}></div>
                            <div className={styles.investmentBg}></div>
                            <div className={styles.investmentContent}>
                                <span className={styles.investmentLabel}>Total Investment</span>
                                <p className={styles.investmentAmount}>{formData.pricing}</p>
                            </div>
                        </div>
                    )}

                    {formData.terms && (
                        <div className={`${styles.docSection} ${styles.altBg}`}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionAnchor}></div>
                                <h2 className={styles.sectionTitle}>Terms & Conditions</h2>
                            </div>
                            <p className={styles.termsBody}>{formData.terms}</p>
                        </div>
                    )}
                </div>

                {/* Footer Branding */}
                <div className={styles.footerSection}>
                    <div className={styles.footerBrandStrip}></div>
                    <div className={styles.footerContent}>
                        <div className={styles.footerLeft}>
                            <span className={styles.panelLabel}>Prepared By</span>
                            {(() => {
                                const contactLines = (formData.contactInfo || 'Your Name\ncontact@email.com\n555-0123').split('\n');
                                const name = contactLines[0] || '';
                                const email = contactLines[1] || '';
                                const phone = contactLines[2] || '';

                                return (
                                    <div className={styles.identityStack}>
                                        <p className={styles.identityName}>{name}</p>
                                        {email && <p className={styles.identityEmail}>{email}</p>}
                                        {phone && <p className={styles.identityPhone}>{phone}</p>}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className={styles.footerRight}>
                            <div className={styles.signatureBox}>
                                <div className={styles.signatureLine}></div>
                                <span className={styles.signatureLabel}>Authorized Signature</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <span className={styles.footerLogoMark}>p</span>
                        <span className={styles.footerBrandText}>pitchPDF Premium Document</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProposalPreview />
        </Suspense>
    );
}
