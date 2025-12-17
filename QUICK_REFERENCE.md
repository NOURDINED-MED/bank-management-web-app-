# ⚡ Quick Reference Guide

## 🔐 Test Accounts

### Option 1: Create Your Own
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Create accounts for:
   - Admin (email: `admin@bams.com`)
   - Teller (email: `teller@bams.com`)
   - Customer (email: `customer@bams.com`)
4. Set passwords (e.g., `password123`)
5. Create profiles in `users` table with correct roles

### Option 2: Use Existing Users
Check your Supabase `users` table for existing accounts.

---

## 🌐 Quick URLs

- **Login:** `http://localhost:3000/login`
- **Admin:** `http://localhost:3000/admin`
- **Teller:** `http://localhost:3000/teller`
- **Customer:** `http://localhost:3000/customer`
- **Check Config:** `http://localhost:3000/login/check-config`
- **Setup Messages:** `http://localhost:3000/setup-messages`

---

## 🚀 Quick Commands

```bash
# Start server
npm run dev

# Check if running
curl http://localhost:3000

# Kill process (if port in use)
lsof -ti:3000 | xargs kill
```

---

## ✅ Pre-Flight Checklist

Before testing, make sure:
- [ ] Dev server running (`npm run dev`)
- [ ] Supabase keys in `.env.local`
- [ ] Can login successfully
- [ ] Messages table created (if using messaging)
- [ ] Browser console shows no errors (F12)

---

## 🎯 Quick Test Steps

1. **Login Test** (30 sec)
   - Go to `/login`
   - Login with your credentials
   - Should redirect to dashboard

2. **Transaction Test** (1 min)
   - As Admin: Click customer → Deposit $100
   - Check Transactions tab → Should appear

3. **Dark Mode Test** (10 sec)
   - Click theme toggle
   - Verify everything visible

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Supabase configuration |
| `TESTING_GUIDE.md` | Complete testing guide |
| `QUICK_TEST.md` | 5-minute test |
| `SYSTEM_SUMMARY.md` | Full system overview |
| `FIX_LOGIN_ERROR.md` | Login troubleshooting |

---

## 🐛 Quick Fixes

### Can't Login?
- Check: `/login/check-config`
- Verify `.env.local` has correct keys
- Restart server: `npm run dev`

### Messages Not Working?
- Visit: `/setup-messages`
- Create messages table in Supabase

### Page Not Loading?
- Clear browser cache
- Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Review relevant `.md` guide file
4. Verify Supabase dashboard is accessible

---

**Last Updated:** Today


























