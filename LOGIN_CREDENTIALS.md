# 🔐 LOGIN CREDENTIALS - RAILWAY PRODUCTION

## ✅ PASSWORD: `password123`

Lahat ng accounts, same password: **`password123`**

---

## 👥 ADMIN ACCOUNTS

### Admin 1:
```
Email: jholand123@gmail.com
Password: password123
```

### Admin 2:
```
Email: admin@gmail.com
Password: password123
```

---

## 👤 STAFF ACCOUNT

```
Email: staff@gmail.com
Password: password123
```

---

## 🚀 HOW TO LOGIN

1. Go to: **https://railyn.up.railway.app**

2. Enter credentials:
   ```
   Email: admin@gmail.com
   Password: password123
   ```

3. Click Login

4. ✅ Redirected to Dashboard!

---

## ⏳ WAIT FOR DEPLOYMENT

Railway is currently deploying with the new password.

**Status:**
- ✅ Code pushed to GitHub
- ⏳ Railway is rebuilding (3-5 minutes)
- ⏳ Database will be seeded with new accounts
- ✅ Password will be: `password123`

**Check deployment:**
Railway Dashboard → Backend Service → Deployments tab

---

## 🎯 AFTER DEPLOYMENT

### Try to login with:

**Option 1 (Recommended):**
```
Email: admin@gmail.com
Password: password123
```

**Option 2:**
```
Email: jholand123@gmail.com
Password: password123
```

**Staff Account:**
```
Email: staff@gmail.com
Password: password123
```

---

## 🔄 IF DATABASE ALREADY HAS OLD ACCOUNTS

Kung meron na accounts sa database (with old unknown passwords), kailangan mo:

### Option A: Delete old accounts first

Railway Backend Shell:
```bash
php artisan tinker
>>> App\Models\User::truncate();
>>> exit
```

Then trigger redeploy or run:
```bash
php artisan db:seed --force
```

### Option B: Create additional admin

Railway Backend Shell:
```bash
php artisan tinker
>>> App\Models\User::create([
    'name' => 'New Admin',
    'email' => 'newadmin@test.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'is_active' => 1
]);
```

Login with:
```
Email: newadmin@test.com
Password: password123
```

---

## 🔐 SECURITY REMINDER

⚠️ **IMPORTANT:** After first login, change the password!

1. Login to admin dashboard
2. Go to Settings → Profile
3. Change password to something more secure
4. Use combination of letters, numbers, symbols
5. At least 8 characters

---

## ✅ SUMMARY

```
✅ Password updated to: password123
✅ All accounts use same password
✅ Easy to remember and login
✅ Pushed to GitHub
⏳ Railway is deploying now
⏳ Wait 3-5 minutes
✅ Then try to login!
```

---

## 📞 QUICK REFERENCE

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin 1 | jholand123@gmail.com | password123 | admin |
| Admin 2 | admin@gmail.com | password123 | admin |
| Staff | staff@gmail.com | password123 | staff |

---

**Password: `password123`**
**Login URL: https://railyn.up.railway.app**
**Wait: 3-5 minutes for deployment**

🎉 **After deployment, login with: admin@gmail.com / password123**
