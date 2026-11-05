# 🛒 বাজার দর (BazarDor) — Daily Commodity Price Tracker

বাজার দর (BazarDor) is a responsive web application built with Next.js (App Router), Tailwind CSS, and BetterAuth. It allows users to track daily essential commodity prices across different markets in Bangladesh, view top price risers and fallers, filter and sort items by category, and inspect market-by-market price comparisons.

---

## 🔗 Project Links
- **Live Link:** [Paste your Vercel Live Link here]
- **GitHub Repository Link:** [Paste your GitHub Repository Link here]

---

## 🛠️ Technologies Used
- **Next.js 14 (App Router)** — File-based routing, dynamic routes, and UI rendering
- **Tailwind CSS** — Responsive layout, cards, and custom styling
- **BetterAuth** — User authentication (Email/Password, Google & GitHub Social Login, and Profile Name Update)
- **React Hot Toast** — Toast notifications for authentication, profile updates, and protected routes
- **JavaScript (ES6+)** — State management, API integration, and Bengali numeral sorting

---

## ✨ 5 Key Features
1. **Live Price Ticker & Market Highlights**: Displays an infinite scrolling price marquee below the navbar, along with dedicated Home sections for Top 6 Risers (`আজ দাম বেড়েছে ▲`), Top 6 Fallers (`আজ দাম কমেছে ▼`), and All Products (`সব পণ্য`).
2. **Category Filtering & Bengali Numeral Sorting**: Users can browse items by category (`চাল`, `ডাল`, `তেল`, `সবজি`, `মাছ`, `মাংস`, `ডিম-দুধ`, `মসলা`) and sort products by price (`ডিফল্ট`, `দাম: কম থেকে বেশি`, `দাম: বেশি থেকে কম`) with accurate Bengali digit conversion.
3. **Protected Product Details & Market Breakdown**: Authenticated users can inspect minimum, maximum, and average prices alongside a comprehensive market-by-market (`বাজারভিত্তিক আজকের দাম`) comparison table.
4. **BetterAuth Authentication**: Full Sign In and Sign Up flows supporting Email/Password as well as Google and GitHub social login with instant toast feedback.
5. **User Profile & Name Update**: Logged-in users can view their profile details and update their display name dynamically using BetterAuth's user update functionality.