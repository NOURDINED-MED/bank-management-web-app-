# 🧪 BAMS System Testing Guide

Complete guide to test all features of your Banking Management System.

---

## 📋 Prerequisites

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```
   Server should be at: `http://localhost:3000`

2. **Verify Supabase is configured:**
   - Go to: `http://localhost:3000/login/check-config`
   - Should show: ✅ All environment variables are set
   - Should show: ✅ Connected successfully

3. **Make sure the messages table exists:**
   - Go to: `http://localhost:3000/setup-messages`
   - Click "Check if Messages Table Exists"
   - If it doesn't exist, follow the instructions to create it

---

## 🔐 1. Authentication Testing

### Test Login
1. Go to: `http://localhost:3000/login`
2. Test with different user roles:

#### Admin Login
- **Email:** (your admin email)
- **Password:** (your admin password)
- **Expected:** Redirects to `/admin` dashboard

#### Teller Login
- **Email:** (your teller email)
- **Password:** (your teller password)
- **Expected:** Redirects to `/teller` dashboard

#### Customer Login
- **Email:** (your customer email)
- **Password:** (your customer password)
- **Expected:** Redirects to `/customer` dashboard

### Test Logout
1. Click profile menu → "Logout"
2. **Expected:** Redirects to `/login` page
3. Try accessing protected pages - should redirect to login

---

## 👤 2. Admin Dashboard Testing

### Login as Admin
1. Login with admin credentials
2. **Verify dashboard shows:**
   - ✅ Total customers count
   - ✅ Total transactions
   - ✅ Total accounts
   - ✅ Bank balance: $10,000,000,000

### Test Customer Management
1. Go to **"Customer Management"** tab
2. **View customers list:**
   - Should show real customers from database
   - Each customer should have: Name, Email, Status, Actions
3. **Search for a customer:**
   - Type in search box
   - Results should filter in real-time
4. **Edit a customer:**
   - Click "Edit" on any customer
   - Change name, email, phone, or status
   - Click "Save"
   - **Expected:** Changes saved successfully

### Test Create Customer
1. Go to **"Customer Management"** tab
2. Click **"Create New Customer"** button
3. Fill in form:
   - Full Name
   - Email
   - Phone
   - Initial Deposit (optional)
4. Click **"Create Customer"**
5. **Expected:**
   - Success message
   - Customer appears in list
   - Link to customer dashboard provided

### Test Admin Transactions
1. Click on a customer → **"View Profile"**
2. **Test Deposit:**
   - Click **"Deposit"** button
   - Enter amount (e.g., $100)
   - Click **"Process Deposit"**
   - **Expected:** Success message, balance updated
3. **Test Withdrawal:**
   - Click **"Withdraw"** button
   - Enter amount (e.g., $50)
   - Click **"Process Withdrawal"**
   - **Expected:** Success message, balance updated
4. **Test Transfer:**
   - Click **"Transfer"** button
   - Enter recipient account number
   - Enter amount
   - Click **"Process Transfer"**
   - **Expected:** Success message, both accounts updated

### Test Transactions View
1. Go to **"Transactions"** tab
2. **Verify:**
   - Shows all transactions from database
   - Can see: Date, Type, Amount, From, To, Status
   - Can refresh to see new transactions

### Test Support/Messages (Admin)
1. Go to **"Support"** tab
2. Click **"Customer Messages"** sub-tab
3. **Test receiving messages:**
   - Messages sent by customers should appear here
   - Unread messages should be highlighted
4. **Test replying:**
   - Click on a message
   - Type a reply
   - Click **"Send Reply"**
   - **Expected:** Reply sent successfully

### Test Dark Mode (Admin)
1. Click theme toggle (sun/moon icon) in navbar
2. **Verify:**
   - All sections switch to dark mode
   - Text is readable
   - All cards, tables, forms are styled correctly
   - Bottom sections (Support, Reports, etc.) also in dark mode

---

## 🏦 3. Teller Dashboard Testing

### Login as Teller
1. Login with teller credentials
2. **Verify dashboard shows:**
   - ✅ Total transactions processed today
   - ✅ Daily limits remaining
   - ✅ Performance metrics
   - ✅ Bank balance: $10,000,000,000

### Test Customer Search
1. Use the search box at top
2. Search by:
   - Account number
   - Customer name
   - Email
   - Phone
3. **Expected:** Results appear in dropdown
4. Click on a customer
5. **Expected:** Customer mini-profile appears on right

### Test Teller Transactions
1. **Via Customer Mini-Profile:**
   - Click **"Deposit"** → Enter amount → Process
   - Click **"Withdraw"** → Enter amount → Process
   - Click **"Transfer"** → Enter details → Process

2. **Via Transaction Pages:**
   - Go to `/teller/deposit`
   - Search customer → Enter amount → Process
   - Go to `/teller/withdrawal`
   - Search customer → Enter amount → Process
   - Go to `/teller/transfer`
   - Enter sender/recipient → Enter amount → Process

3. **Verify transactions appear:**
   - Go back to `/teller` dashboard
   - Scroll to "Recent Transactions"
   - **Expected:** Your new transactions appear in the list

### Test Messages (Teller)
1. Go to **"Messages"** tab
2. **Verify:**
   - Can see messages from customers
   - Can reply to messages
   - Messages marked as read when opened

### Test Dark Mode (Teller)
1. Toggle dark mode
2. **Verify:**
   - All sections properly styled
   - Left sidebar readable
   - Transaction cards visible
   - Customer mini-profile styled correctly

---

## 👥 4. Customer Dashboard Testing

### Login as Customer
1. Login with customer credentials
2. **Verify dashboard shows:**
   - ✅ Account balance
   - ✅ Recent transactions
   - ✅ Account summary
   - ✅ Cards overview

### Test View Transactions
1. Go to **"Transactions"** tab
2. **Verify:**
   - Shows customer's transactions
   - Can filter by type (All, Deposit, Withdrawal, Transfer)
   - Shows correct amounts and dates

### Test View Account Details
1. Go to **"Accounts"** tab
2. **Verify:**
   - Shows account number
   - Shows account type
   - Shows balance
   - Shows account status

### Test Send Message
1. Go to **"Messages"** tab
2. **Fill in form:**
   - To: Select "Admin" or "Teller" or leave blank (all staff)
   - Subject: Test message
   - Message: This is a test message
   - Priority: Normal
   - Category: General
3. Click **"Send Message"**
4. **Expected:**
   - Success toast message
   - Message appears in "Sent" tab
   - Message appears in admin/teller inbox

### Test View Messages
1. In **"Messages"** tab:
   - Click **"Received"** tab
   - Should show messages from admin/teller
   - Unread messages highlighted
2. Click on a message
3. **Expected:** Message marked as read

### Test Dark Mode (Customer)
1. Toggle dark mode
2. **Verify:**
   - All sections properly styled
   - Overview cards readable
   - Transaction list visible
   - Message interface styled correctly

---

## 🌍 5. Language Testing

### Test Language Switching
1. Click language selector in navbar
2. **Test each language:**
   - **English:** All text in English
   - **العربية (Arabic):** All text in Arabic (RTL layout)
   - **Français (French):** All text in French
3. **Verify:**
   - Navigation menu translated
   - Page titles translated
   - Buttons translated
   - Form labels translated
   - Error messages translated (if implemented)

---

## 💾 6. Data Persistence Testing

### Test Transaction Persistence
1. **As Admin:**
   - Create a deposit transaction
   - Logout
   - Login again
   - Go to Transactions tab
   - **Expected:** Transaction still there

2. **As Teller:**
   - Process a withdrawal
   - Refresh page (F5)
   - **Expected:** Transaction appears in dashboard

### Test Balance Updates
1. Make a deposit of $100
2. Check account balance
3. **Expected:** Balance increased by $100
4. Make a withdrawal of $50
5. Check account balance
6. **Expected:** Balance decreased by $50

---

## 🎨 7. UI/UX Testing

### Test Responsive Design
1. **Desktop:** Full width layout
2. **Tablet:** Resize browser to tablet width
   - **Expected:** Layout adapts, sidebar may collapse
3. **Mobile:** Resize to mobile width
   - **Expected:** Mobile-friendly layout, hamburger menu

### Test Navigation
1. Click through all menu items
2. **Expected:** 
   - Smooth page transitions
   - Active page highlighted in menu
   - No broken links

### Test Error Handling
1. **Test invalid login:**
   - Wrong email/password
   - **Expected:** Clear error message
2. **Test insufficient funds:**
   - Try to withdraw more than balance
   - **Expected:** Error message, withdrawal blocked
3. **Test invalid account:**
   - Transfer to non-existent account
   - **Expected:** Error message

---

## 📊 8. Performance Testing

### Test Page Load Speed
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate between pages
4. **Expected:** Pages load in < 2 seconds

### Test Real-time Updates
1. Open two browser windows:
   - Window 1: Admin dashboard
   - Window 2: Teller dashboard
2. Create transaction in Teller window
3. Refresh Admin dashboard
4. **Expected:** Transaction appears

---

## 🔍 9. Quick Test Checklist

Print this checklist and test each item:

### Authentication
- [ ] Admin login works
- [ ] Teller login works
- [ ] Customer login works
- [ ] Logout works
- [ ] Protected routes redirect to login

### Admin Features
- [ ] View all customers
- [ ] Search customers
- [ ] Edit customer
- [ ] Create new customer
- [ ] Deposit for customer
- [ ] Withdraw for customer
- [ ] Transfer between accounts
- [ ] View all transactions
- [ ] Receive customer messages
- [ ] Reply to messages
- [ ] Dark mode works

### Teller Features
- [ ] Search customers
- [ ] View customer profile
- [ ] Process deposit
- [ ] Process withdrawal
- [ ] Process transfer
- [ ] View transaction history
- [ ] See daily limits
- [ ] See performance metrics
- [ ] Receive messages
- [ ] Reply to messages
- [ ] Dark mode works

### Customer Features
- [ ] View account balance
- [ ] View transactions
- [ ] View account details
- [ ] Send message to staff
- [ ] View received messages
- [ ] Dark mode works

### General
- [ ] Language switching works (English/Arabic/French)
- [ ] Dark mode toggle works
- [ ] All pages are responsive
- [ ] No console errors
- [ ] No broken links

---

## 🐛 Troubleshooting

### If login doesn't work:
1. Check: `http://localhost:3000/login/check-config`
2. Verify Supabase keys in `.env.local`
3. Restart dev server: `npm run dev`

### If messages don't work:
1. Check: `http://localhost:3000/setup-messages`
2. Follow instructions to create messages table
3. Refresh page and try again

### If transactions don't appear:
1. Check browser console (F12) for errors
2. Verify database connection
3. Refresh the page

### If dark mode has issues:
1. Clear browser cache
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## ✅ Success Criteria

Your system is working correctly if:
- ✅ All three roles can login successfully
- ✅ Transactions are created and visible
- ✅ Balances update correctly
- ✅ Messages can be sent and received
- ✅ Dark mode works on all pages
- ✅ Language switching works
- ✅ No console errors
- ✅ All features are accessible

---

**Happy Testing! 🚀**
























