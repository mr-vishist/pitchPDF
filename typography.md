---
trigger: always_on
---

# pitchPDF – UI Consistency System

This file defines the **complete typography, spacing, and UI consistency rules** for the pitchPDF website.
Use this as the single source of truth for all pages.

---

## 🔤 Font System

### Primary Font (UI + Body)

**Inter**
Clean, professional, SaaS standard, high readability


font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

Google Fonts:
[https://fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)

---

### Secondary Font (Optional – Headings / Brand Feel)

**DM Sans**
Modern, friendly, professional

font-family: 'DM Sans', system-ui, sans-serif;

> If keeping ultra-simple → use **Inter only** everywhere.

---

# 📐 Typography Scale

## Headings

### H1 – Main Hero Title

* Size: `48px`
* Weight: `700`
* Line-height: `1.1`
* Letter-spacing: `-0.02em`

Usage: Hero headlines, main page titles

---

### H2 – Section Titles

* Size: `32px`
* Weight: `600`
* Line-height: `1.2`

Usage: Feature sections, pricing, content blocks

---

### H3 – Subsections

* Size: `24px`
* Weight: `600`

Usage: Card titles, form sections

---

### H4 – Labels / Small Headers

* Size: `18px`
* Weight: `600`

Usage: Mini headers, form groups

---

## Body Text

### Body Large

* Size: `18px`
* Weight: `400`
* Line-height: `1.6`

Usage: Hero subtitles, descriptions

---

### Body Normal

* Size: `16px`
* Weight: `400`
* Line-height: `1.6`

Usage: Paragraphs, main content

---

### Body Small

* Size: `14px`
* Weight: `400`

Usage: Helper text, footers, hints

---

## UI Text

### Button Text

* Size: `16px`
* Weight: `600`
* Letter-spacing: `0.3px`

---

### Input Labels

* Size: `14px`
* Weight: `500`

---

### Input Text

* Size: `16px`
* Weight: `400`

---

### Placeholder Text

* Size: `14px`
* Weight: `400`
* Opacity: `0.6`

---

# 📏 Spacing System

Use **8px spacing system**:

* `4px`  → micro spacing
* `8px`  → small
* `16px` → base
* `24px` → medium
* `32px` → large
* `48px` → section gap
* `64px` → major section gap

---

# 🧩 Component Typography Rules

## Navbar

* Logo text: `20px`, `700`
* Links: `14px`, `500`

---

## Forms

* Label: `14px`, `500`
* Input: `16px`, `400`
* Helper text: `12–13px`, `400`

---

## Cards

* Title: `18px`, `600`
* Text: `14–16px`, `400`

---

## Pricing

* Price: `36px`, `700`
* Plan name: `18px`, `600`
* Features: `14px`, `400`

---

# 🧱 CSS Variables System

```css
:root {
  --font-primary: 'Inter', system-ui, sans-serif;

  --h1: 48px;
  --h2: 32px;
  --h3: 24px;
  --h4: 18px;

  --body-lg: 18px;
  --body: 16px;
  --body-sm: 14px;

  --fw-bold: 700;
  --fw-semi: 600;
  --fw-med: 500;
  --fw-reg: 400;
}
```

---

# 🎯 Visual Personality

**Feel:**

* Clean
* Minimal
* Professional
* Trustworthy
* Business-first

**Avoid:**

* Playful fonts
* Script fonts
* Comic styles
* Decorative fonts
* Thin typography
* Visual noise

---

# ✅ Consistency Rules

* One font family across the site
* Fixed heading sizes
* Fixed spacing scale
* Same button typography
* Same input typography
* Same hierarchy system
* Same layout rhythm

---

# 🧠 Design Principle

> "If it feels boring — it’s professional."

Professionals trust clean, predictable, structured UI.