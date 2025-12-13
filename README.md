# 🏦 BAMS Banking Application

A modern, full-featured banking application built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Setup Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. (Optional) Run `supabase-security-schema.sql` for additional security features

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📚 Documentation

- **Main Setup Guide**: See `SUPABASE_SETUP.md`
- **School Project Guide**: See `README_SCHOOL_PROJECT.md`
- **Security Implementation**: See `SECURITY_IMPLEMENTATION_GUIDE.md`

## ✨ Features

- ✅ Real authentication with Supabase
- ✅ Customer, Teller, and Admin dashboards
- ✅ Real-time transactions
- ✅ Account management
- ✅ Multi-language support (EN, AR, ES, FR)
- ✅ Dark mode
- ✅ Comprehensive security features

## 🏗️ Project Structure

```
app/              # Next.js app router pages
components/       # React components
lib/              # Utilities and configurations
public/           # Static assets
supabase-schema.sql    # Main database schema
```

## 🔐 Authentication

- **Signup**: `/signup` - Create new customer accounts
- **Login**: `/login` - Sign in to your account
- **Auto-confirmation**: Email verification is disabled for development

## 📖 For More Information

See `README_SCHOOL_PROJECT.md` for detailed project documentation.

