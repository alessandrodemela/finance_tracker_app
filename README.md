# 💰 Finance Tracker

A modern, high-performance personal finance management application built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Track your income, manage expenses, and visualize your spending habits with ease.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ Features

- 📊 **Interactive Dashboard**: Real-time visualization of spending trends and budget vs. actuals.
- 💸 **Transaction Tracking**: Seamless logging of income and expenses with detailed categorization.
- 📅 **Month-over-Month Analysis**: Navigate through previous months to compare financial performance.
- 🎯 **Budget Management**: Set budgets for specific categories and monitor your progress.
- 🔒 **Secure Data**: Powered by Supabase for reliable, real-time data synchronization.
- 📱 **Responsive Design**: Optimized for both desktop and mobile use.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla CSS with Modern CSS Variables (Glassmorphism & Dark Mode)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: TypeScript

## 🛠️ Local Setup

Follow these steps to get the project running on your local machine:

### 1. Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account and project

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd finance-tracker
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configuration

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🚢 Deployment

The project is optimized for deployment on **Vercel**:

1. Push your code to GitHub.
2. Connect your GitHub repository to [Vercel](https://vercel.com/new).
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.
4. Deploy!

---

## 📄 License

This project is open-source and available under the MIT License.

