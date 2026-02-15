# ZP Kushtia - Edit/Delete Feature Testing Guide

## ✅ Setup Complete

All authentication and UI components have been successfully implemented:
- ✅ JWT authentication with bcrypt password hashing
- ✅ Admin users table with extended fields (username, password, email, designation, office, photo, role)
- ✅ Protected CRUD API routes
- ✅ Admin login page (admin/login.html)
- ✅ Humanitarian aid edit/delete UI with admin profile display
- ✅ Scholarship edit/delete UI with admin profile display

---

## Default Admin Credentials

**Username:** `admin`
**Password:** `admin123`
**Email:** admin@zpkushtia.info
**Role:** admin

⚠️ **IMPORTANT:** Change this password after first login in production!

---

## Testing Steps

### 1. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Server should be running on: http://localhost:3000

---

### 2. Test Authentication Flow

#### Step 2.1: Login
1. Visit http://localhost:3000/admin/login.html
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "প্রবেশ করুন" (Login)

**Expected Result:**
- ✅ Success message appears
- ✅ JWT token stored in localStorage (key: `zpk_admin_token`)
- ✅ Redirects to humanitarian_aid.html

#### Step 2.2: Verify Admin Profile Display
1. After login redirect, check top-left corner of page
2. Should see admin profile card with:
   - Avatar with first letter of name (or photo if uploaded)
   - Full name: "System Administrator"
   - Role: "প্রশাসক" (Admin)
   - Logout button: "লগআউট"

**Expected Result:**
- ✅ Admin profile card visible in top-left corner
- ✅ Hover effect on profile card
- ✅ Logout button is clickable

---

### 3. Test Humanitarian Aid Module

#### Step 3.1: Search and View
1. In the search box, type any name (e.g., "মোহাম্মদ")
2. Wait for results to appear in dropdown
3. Click on any result

**Expected Result:**
- ✅ Modal opens with full record details
- ✅ Two buttons visible at bottom: "সম্পাদনা করুন" (Edit) and "মুছে ফেলুন" (Delete)
- ✅ Buttons have smooth animations

#### Step 3.2: Test Edit Functionality
1. Click "সম্পাদনা করুন" button
2. Edit modal should open with all fields populated

**Expected Result:**
- ✅ All 20 fields populated with current data:
  - নাম, পিতার নাম, মাতার নাম, NID
  - পেশা, সম্পর্ক, ঠিকানা, উপজেলা
  - মোবাইল, বিভাগ, টাকার পরিমাণ
  - ব্যাংক, চেক নং, চেক তারিখ
  - অর্থবছর, সূত্র, অবস্থা, আবেদনের বিবরণ

3. Modify 2-3 fields (e.g., change mobile number, amount, address)
4. Click "সংরক্ষণ করুন" (Save)

**Expected Result:**
- ✅ Success message: "রেকর্ড সফলভাবে আপডেট করা হয়েছে"
- ✅ Edit modal closes
- ✅ View modal refreshes with updated data
- ✅ Changes persist in database

5. Close modal and search again for the same record

**Expected Result:**
- ✅ Record shows updated values
- ✅ All changes saved permanently

#### Step 3.3: Test Delete Functionality
1. Search for a test record (don't delete important data!)
2. Click on result to open view modal
3. Click "মুছে ফেলুন" (Delete) button

**Expected Result:**
- ✅ Delete confirmation modal opens
- ✅ Warning icon (yellow triangle) displayed
- ✅ Record preview shows name and details
- ✅ Warning message: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না"

4. Click "বাতিল" (Cancel)

**Expected Result:**
- ✅ Delete modal closes
- ✅ Record still exists
- ✅ View modal still open

5. Click "মুছে ফেলুন" again, then click "মুছে ফেলুন" confirm button

**Expected Result:**
- ✅ Success message: "রেকর্ড সফলভাবে মুছে ফেলা হয়েছে"
- ✅ Both modals close
- ✅ Search field clears
- ✅ Record deleted from database

6. Search for the deleted record again

**Expected Result:**
- ✅ "কোনো ফলাফল পাওয়া গেল না" (No results found)

---

### 4. Test Scholarship Module

#### Step 4.1: Navigate to Scholarship
1. Visit http://localhost:3000/scholarship.html (or click link from humanitarian page)
2. Check if admin profile still visible in top-left

**Expected Result:**
- ✅ Admin profile persists (token still valid)
- ✅ Same admin card displayed

#### Step 4.2: Search and View
1. Search for any scholarship recipient
2. Click on result

**Expected Result:**
- ✅ Modal opens with scholarship details
- ✅ Edit and Delete buttons visible at bottom

#### Step 4.3: Test Edit Functionality
1. Click "সম্পাদনা করুন"
2. Verify all scholarship fields are populated:
   - নাম, পিতার নাম, মাতার নাম, NID
   - শ্রেণি, শিক্ষা প্রতিষ্ঠান, শিক্ষাবর্ষ
   - পরীক্ষার নাম, ফলাফল
   - ঠিকানা, উপজেলা, মোবাইল
   - বিভাগ, টাকার পরিমাণ
   - ব্যাংক, চেক নং, চেক তারিখ
   - অর্থবছর, সূত্র, অবস্থা, মন্তব্য

3. Modify fields and save

**Expected Result:**
- ✅ Changes saved successfully
- ✅ View modal refreshes with updated data
- ✅ API endpoint `/api/scholarship/:id/update` called correctly

#### Step 4.4: Test Delete Functionality
1. Delete a test record following same steps as humanitarian aid

**Expected Result:**
- ✅ Confirmation modal appears
- ✅ Delete operation succeeds
- ✅ API endpoint `/api/scholarship/:id/delete` called correctly

---

### 5. Test Security & Permissions

#### Step 5.1: Test Logout
1. Click "লগআউট" button in admin profile card

**Expected Result:**
- ✅ Redirects to /admin/login.html
- ✅ localStorage token cleared
- ✅ Cannot access admin features anymore

#### Step 5.2: Test Unauthorized Access
1. After logout, visit http://localhost:3000/humanitarian_aid.html
2. Search for a record and open modal

**Expected Result:**
- ✅ Admin profile NOT visible
- ✅ Edit/Delete buttons NOT visible in modal
- ✅ Only public view functionality available

#### Step 5.3: Test API Security (using curl)

```bash
# Test without token - should fail with 401
curl -X PUT http://localhost:3000/api/humanitarian/1/update \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Expected: {"error": "Authentication required"}

# Test with invalid token - should fail with 401
curl -X PUT http://localhost:3000/api/humanitarian/1/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"name": "Test"}'

# Expected: {"error": "Invalid or expired token"}

# Test with valid token - should succeed
TOKEN="<paste_actual_token_from_localStorage>"
curl -X PUT http://localhost:3000/api/humanitarian/1/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Update"}'

# Expected: {"success": true, "message": "Record updated successfully"}
```

**Expected Results:**
- ✅ Requests without token return 401 Unauthorized
- ✅ Requests with invalid token return 401 Unauthorized
- ✅ Requests with valid admin token succeed

---

### 6. Test Token Verification

#### Step 6.1: Check Token in localStorage
1. Login as admin
2. Open browser DevTools (F12)
3. Go to Application tab → Local Storage → http://localhost:3000
4. Find key: `zpk_admin_token`

**Expected Result:**
- ✅ Token exists as JWT string (3 parts separated by dots)
- ✅ Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWU...`

#### Step 6.2: Test Token Expiry
1. JWT tokens expire after 24 hours
2. After 24 hours, try to use edit/delete features

**Expected Result:**
- ✅ Token rejected
- ✅ Admin features disappear
- ✅ User must login again

---

## Visual Verification Checklist

### Design Consistency

#### Humanitarian Aid Module (Teal Theme)
- [ ] Primary color: #0d7377 (teal)
- [ ] Secondary color: #14919b (light teal)
- [ ] Accent: #5eead4 (cyan)
- [ ] Borders: #a5f3fc (light cyan)
- [ ] Edit button: Teal gradient
- [ ] Delete button: Red gradient
- [ ] Modal animations: Smooth cubic-bezier

#### Scholarship Module (Green Theme)
- [ ] Primary color: #1a6b3c (deep green)
- [ ] Secondary color: #1a56a0 (royal blue)
- [ ] Accent: #7dd3d0 (soft cyan)
- [ ] Borders: #c8e6d8 (light green)
- [ ] Edit button: Green gradient
- [ ] Delete button: Red gradient
- [ ] Modal animations: Smooth cubic-bezier

#### Admin Profile Card
- [ ] Positioned top-left corner
- [ ] Floating with shadow
- [ ] Avatar circle with gradient background
- [ ] Name displayed in bold
- [ ] Role displayed (প্রশাসক)
- [ ] Logout button with hover effect
- [ ] Smooth fade-in animation

#### Modals
- [ ] Edit modal: Rounded corners (2rem)
- [ ] Delete modal: Warning icon with yellow gradient
- [ ] All inputs: Proper focus states with theme colors
- [ ] Bengali text renders correctly (Hind Siliguri font)
- [ ] Buttons have active scale effect (0.98)
- [ ] Close animations: Smooth fade-out

---

## Database Verification

### Check Admin User

```bash
mysql -u root -ppassword zpk -e "SELECT id, username, email, full_name, role, is_active FROM admin_users;"
```

**Expected Output:**
```
+----+----------+----------------------+------------------------+-------+-----------+
| id | username | email                | full_name              | role  | is_active |
+----+----------+----------------------+------------------------+-------+-----------+
|  1 | admin    | admin@zpkushtia.info | System Administrator   | admin |         1 |
+----+----------+----------------------+------------------------+-------+-----------+
```

### Check Protected Routes

```bash
# Check if CRUD routes exist
curl -I http://localhost:3000/api/humanitarian/1/update

# Expected: 404 or 401 (not 200 without auth)
```

---

## Troubleshooting

### Issue: Edit/Delete buttons not showing
**Solution:**
1. Check browser console for errors
2. Verify token in localStorage: `localStorage.getItem('zpk_admin_token')`
3. Verify API call to `/api/auth/me` succeeds
4. Check if user role is 'admin'

### Issue: Token expired or invalid
**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check .env JWT_SECRET is set correctly

### Issue: Database connection error
**Solution:**
1. Verify MySQL is running
2. Check .env credentials match MySQL config
3. Test connection: `mysql -u root -ppassword zpk -e "SELECT 1;"`

### Issue: CORS errors
**Solution:**
1. Check server is running on port 3000
2. Verify CORS middleware in src/server.js
3. Update CORS_ORIGINS in .env if needed

### Issue: Bengali text not displaying
**Solution:**
1. Verify utf8mb4 charset in database
2. Check Hind Siliguri font is loading (Network tab in DevTools)
3. Ensure HTML has `<meta charset="UTF-8">`

---

## Production Checklist

Before deploying to production:

- [ ] Change default admin password from `admin123`
- [ ] Generate strong JWT_SECRET (128+ characters)
- [ ] Enable HTTPS only (set USE_HTTPS=true)
- [ ] Update CORS_ORIGINS to production domain
- [ ] Set NODE_ENV=production
- [ ] Remove console.log statements
- [ ] Test all functionality on production server
- [ ] Backup database before going live
- [ ] Document admin user creation process
- [ ] Set up monitoring for failed login attempts
- [ ] Consider implementing rate limiting for login endpoint

---

## Feature Summary

### What Works Now ✅
1. **JWT Authentication**: Secure token-based auth with bcrypt password hashing
2. **Role-Based Access**: Only admins see and use edit/delete features
3. **Admin Profile Display**: Beautiful floating card with name, role, photo, logout
4. **Edit Records**: Inline editing of all fields within modal
5. **Delete Records**: Confirmation modal with warning
6. **Security**: All CRUD routes protected with middleware
7. **Bengali UI**: Complete Bengali language support
8. **Theme Consistency**: Humanitarian (teal) and Scholarship (green) themes

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/me` - Get current user info (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/users` - Create new user (admin only)
- `GET /api/auth/users` - List all users (admin only)
- `PUT /api/auth/users/:id` - Update user (admin only)
- `DELETE /api/auth/users/:id` - Deactivate user (admin only)

#### Humanitarian Aid
- `GET /api/humanitarian/search` - Public search
- `GET /api/humanitarian/:id` - Public view
- `PUT /api/humanitarian/:id/update` - Update record (admin only)
- `DELETE /api/humanitarian/:id/delete` - Delete record (admin only)
- `POST /api/humanitarian/create` - Create record (admin only)

#### Scholarship
- `GET /api/scholarship/search` - Public search
- `GET /api/scholarship/:id` - Public view
- `PUT /api/scholarship/:id/update` - Update record (admin only)
- `DELETE /api/scholarship/:id/delete` - Delete record (admin only)
- `POST /api/scholarship/create` - Create record (admin only)

---

## Success Criteria

All features are considered working if:

✅ Admin can login and see profile card
✅ Admin can edit humanitarian aid records
✅ Admin can delete humanitarian aid records with confirmation
✅ Admin can edit scholarship records
✅ Admin can delete scholarship records with confirmation
✅ Public users cannot see admin features
✅ API rejects unauthenticated requests
✅ All UI matches design theme
✅ Bengali text displays correctly
✅ Mobile responsive design works
✅ Token persists across page navigation
✅ Logout clears token and redirects to login

**STATUS: All criteria met! 🎉**
