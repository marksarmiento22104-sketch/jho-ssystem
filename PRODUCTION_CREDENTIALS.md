# 🔐 Production Login Credentials (Railway)

## 👥 User Accounts (From Your Database Seeder)

Your UserSeeder creates these accounts:

---

### 🔑 Admin Account 1 (Owner)
```
Email: jholand123@gmail.com
Password: [UNKNOWN - password hash in seeder]
Role: Admin
Status: Active
```

### 🔑 Admin Account 2
```
Email: admin@gmail.com
Password: [UNKNOWN - password hash in seeder]
Role: Admin
Status: Active
```

### 🔑 Staff Account
```
Email: staff@gmail.com
Password: [UNKNOWN - password hash in seeder]
Role: Staff
Status: Active
```

---

## ⚠️ PASSWORD ISSUE

Your seeder has **pre-hashed passwords** from your local database. These passwords are encrypted and I cannot determine what they were.

**You have 3 options:**

---

## ✅ OPTION 1: Try Common Passwords (Quickest)

Try these common passwords that might have been used:

1. `password`
2. `admin123`
3. `Password123`
4. `12345678`

If none work, use Option 2 or 3 below.

---

## ✅ OPTION 2: Create New Admin User (Recommended)

After seeding, create a fresh admin user with a known password:

### Steps:
1. Go to Railway → Backend Service → Shell
2. Run this command:

```bash
php artisan tinker
```

3. Then paste this code (replace YOUR_PASSWORD):

```php
$user = new App\Models\User();
$user->name = 'Railway Admin';
$user->email = 'railway@admin.com';
$user->password = bcrypt('YOUR_PASSWORD');  // <- Put your password here
$user->role = 'admin';
$user->is_active = 1;
$user->save();
exit
```

4. Now you can login with:
   - Email: `railway@admin.com`
   - Password: `YOUR_PASSWORD`

---

## ✅ OPTION 3: Update Seeder with Known Password

If you want to update the seeder for future deployments:

### Steps:
1. Open: `store/database/seeders/UserSeeder.php`

2. Replace the password hashes with a known password:

```php
// Generate new hash locally:
php artisan tinker
>>> bcrypt('your-desired-password')
// Copy the output hash
```

3. Update the seeder with the new hash

4. Commit and push to GitHub

5. Redeploy on Railway

6. Run `php artisan db:seed --force` again

---

## 🎯 RECOMMENDED ACTION

**Use Option 2** - It's fastest and doesn't require redeployment:

```bash
# In Railway Backend Shell:
php artisan tinker

# Then run:
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@railynstore.com';
$user->password = bcrypt('admin123456');
$user->role = 'admin';
$user->is_active = 1;
$user->save();
exit
```

**Now login with:**
- Email: `admin@railynstore.com`
- Password: `admin123456`

---

## 🔍 How to Check if Accounts Were Created

In Railway Backend Shell:
```bash
php artisan tinker
>>> App\Models\User::all(['id', 'name', 'email', 'role']);
```

This shows all users in the database.

---

## 📊 Test Credentials vs Production

The `TEST_CREDENTIALS.md` file you saw is for **LOCAL TESTING** only.

Those credentials are different from your production seeder:

| Local Test | Production Seeder |
|------------|-------------------|
| admin1@store.com | jholand123@gmail.com |
| admin2@store.com | admin@gmail.com |
| anna@store.com | staff@gmail.com |
| Known passwords | Unknown hashed passwords |

---

## 🚀 Quick Fix - Create Admin Now

**Copy and paste this into Railway Backend Shell:**

```bash
php artisan tinker
```

Then:

```php
\App\Models\User::create([
    'name' => 'Railway Admin',
    'email' => 'admin@railway.com',
    'password' => bcrypt('Admin123!'),
    'role' => 'admin',
    'is_active' => 1
]);
exit
```

**Login credentials:**
```
Email: admin@railway.com
Password: Admin123!
```

---

## 🔐 Security Notes

1. **Change default passwords** immediately after first login
2. Use strong passwords in production (minimum 8 characters, mix of letters/numbers/symbols)
3. Enable Two-Factor Authentication if available
4. Don't share admin credentials
5. Use staff accounts for day-to-day operations

---

## ✅ Verification Checklist

After creating your admin user:

- [ ] Run database seeder: `php artisan db:seed --force`
- [ ] Create admin user (Option 2 above)
- [ ] Open frontend: https://railyn.up.railway.app
- [ ] Login with new admin credentials
- [ ] Access admin dashboard
- [ ] Change password in settings
- [ ] Create additional admin/staff users as needed

---

## 🆘 Still Can't Login?

### Check Backend Logs:
Railway → Backend Service → Logs

Look for authentication errors.

### Verify Database Connection:
```bash
php artisan tinker
>>> DB::connection()->getPdo();
>>> App\Models\User::count();
```

### Reset All Users (Nuclear Option):
```bash
php artisan tinker
>>> App\Models\User::truncate();
>>> exit
php artisan db:seed --class=UserSeeder --force
```

Then create a new admin with Option 2.

---

**TL;DR: The passwords are unknown. Create a new admin user using Option 2 above.** 🚀
