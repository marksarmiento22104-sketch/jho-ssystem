# 🔧 Reset Users and Create New Admin

## 🎯 Problem

May old users na sa database with unknown passwords. Kailangan i-reset.

---

## ✅ Solution - Run in Railway Backend Shell

### Step 1: Open Railway Backend Shell

Railway Dashboard → Backend Service → Click "Shell" tab (or three dots → Shell)

### Step 2: Run These Commands

Copy and paste one by one:

#### A. Delete old users:
```bash
php artisan tinker
```

Then:
```php
App\Models\User::truncate();
exit
```

#### B. Re-seed with new password:
```bash
php artisan db:seed --class=UserSeeder --force
```

#### C. Verify accounts created:
```bash
php artisan tinker
```

Then:
```php
App\Models\User::all(['id','name','email','role']);
exit
```

---

## 🎯 OR Simpler - Just Create New Admin

If gusto mo lang magdagdag ng bagong admin without deleting:

```bash
php artisan tinker
```

Then copy all of this:
```php
App\Models\User::create([
    'name' => 'Railway Admin',
    'email' => 'railway@admin.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'is_active' => 1
]);
exit
```

Login with:
```
Email: railway@admin.com
Password: password123
```

---

## 📋 Complete Reset Script

Para sigurado, copy paste this entire script in Railway Shell:

```bash
php artisan tinker --execute="
App\Models\User::truncate();
App\Models\User::create(['name'=>'Admin','email'=>'admin@store.com','password'=>bcrypt('password123'),'role'=>'admin','is_active'=>1]);
echo 'Admin created!';
echo '\nEmail: admin@store.com';
echo '\nPassword: password123';
"
```

---

## ✅ After Running Commands

Try login:
```
Email: admin@store.com
Password: password123
```

OR

```
Email: railway@admin.com
Password: password123
```

---

## 🆘 If Tinker Doesn't Work

Alternative - Create via raw SQL:

```bash
php artisan tinker --execute="
DB::table('users')->truncate();
DB::table('users')->insert([
    'name' => 'Admin',
    'email' => 'admin@store.com',
    'password' => '\$2y\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui',
    'role' => 'admin',
    'is_active' => 1,
    'created_at' => now(),
    'updated_at' => now()
]);
echo 'Done!';
"
```

Login:
```
Email: admin@store.com
Password: password123
```

---

## 💡 Quick Fix (Fastest)

Run this ONE command:

```bash
php artisan tinker --execute="App\Models\User::create(['name'=>'New Admin','email'=>'newadmin@test.com','password'=>bcrypt('password123'),'role'=>'admin','is_active'=>1]);"
```

Login:
```
Email: newadmin@test.com
Password: password123
```

---

## ✅ Summary

Piliin mo:

### Option 1: Reset lahat (recommended)
```bash
php artisan tinker
>>> App\Models\User::truncate();
>>> exit
php artisan db:seed --class=UserSeeder --force
```

### Option 2: Add new admin lang
```bash
php artisan tinker
>>> App\Models\User::create(['name'=>'Admin','email'=>'myadmin@test.com','password'=>bcrypt('password123'),'role'=>'admin','is_active'=>1]);
>>> exit
```

Login: `myadmin@test.com` / `password123`

---

**Gawin mo yan sa Railway Backend Shell, then try login ulit!** 🚀
