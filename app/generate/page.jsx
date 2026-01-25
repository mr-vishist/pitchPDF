'use client';

import { useState, useRef } from 'react';
import styles from './generate.module.css';

export default function GeneratePage() {
    const [formData, setFormData] = useState({
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
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGeneratePreview = () => {
        // Preview updates in real-time, this could trigger additional formatting
        console.log('Preview generated with data:', formData);
    };

    const proposalRef = useRef(null);

    const handleExport = async () => {
        if (!proposalRef.current) return;

        const btn = document.getElementById('exportBtn');
        if (btn) {
            btn.textContent = 'Generating...';
            btn.disabled = true;
        }

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = proposalRef.current;
            const opt = {
                margin: [10, 0, 10, 0],
                filename: `Proposal_${formData.clientName ? formData.clientName.replace(/\s+/g, '_') : 'Draft'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Export failed:', err);
            alert('PDF Export failed. Please try again.');
        } finally {
            if (btn) {
                btn.textContent = 'Export PDF';
                btn.disabled = false;
            }
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <a href="/dashboard" className={styles.backLink}>
                        ← Back to Dashboard
                    </a>
                    <h1 className={styles.pageTitle}>Generate Proposal</h1>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryButton} disabled>
                        Save Draft
                    </button>
                    <button
                        id="exportBtn"
                        className={styles.secondaryButton}
                        onClick={handleExport}
                    >
                        Export PDF
                    </button>
                    <button className={styles.primaryButton} onClick={handleGeneratePreview}>
                        Generate Preview
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.main}>
                {/* Form Panel */}
                <div className={styles.formPanel}>
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Client Information</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Client Name</label>
                                <input
                                    type="text"
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Client Company</label>
                                <input
                                    type="text"
                                    name="clientCompany"
                                    value={formData.clientCompany}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Acme Corporation"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Project Details</h2>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Project Title</label>
                            <input
                                type="text"
                                name="projectTitle"
                                value={formData.projectTitle}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Website Redesign Project"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Problem Statement</label>
                            <textarea
                                name="problemStatement"
                                value={formData.problemStatement}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Describe the problem or challenge the client is facing..."
                                rows={4}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Proposed Solution</label>
                            <textarea
                                name="proposedSolution"
                                value={formData.proposedSolution}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Describe your proposed solution..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Scope & Timeline</h2>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Scope of Work</label>
                            <textarea
                                name="scopeOfWork"
                                value={formData.scopeOfWork}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="List the deliverables and scope of work..."
                                rows={4}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Timeline</label>
                            <textarea
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Project phases and estimated completion dates..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Pricing & Terms</h2>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Pricing</label>
                            <textarea
                                name="pricing"
                                value={formData.pricing}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Project cost breakdown..."
                                rows={3}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Terms & Conditions</label>
                            <textarea
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Payment terms, revisions policy, etc..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Contact Information</h2>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Your Contact Info</label>
                            <textarea
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleChange}
                                className={styles.textarea}
                                placeholder="Your name, email, phone, website..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className={styles.previewPanel}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewLabel}>Live Preview</span>
                    </div>
                    <div className={styles.previewContent}>
                        <div className={styles.proposal} ref={proposalRef}>
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
                                        <p className={styles.footerContact}>
                                            {formData.contactInfo || 'Your Name\nCompany\ncontact@email.com'}
                                        </p>
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
                </div>
            </div>
        </div>
    );
}
