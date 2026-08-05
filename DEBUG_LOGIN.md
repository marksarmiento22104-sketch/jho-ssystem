# 🔍 Debug Login Issues - Step by Step

## 📋 Debugging Checklist

Follow these steps to identify and fix the login issue:

---

## Step 1: Check the Request URL

### Open Browser Console:
1. Press **F12** (or right-click → Inspect)
2. Go to **Network** tab
3. Try to login again
4. Look for the **login** request (usually red if failed)
5. Click on it

### What URL do you see?

**Correct URL:**
```
✅ POST https://jho-ssystem-production.up.railway.app/api/login
```

**Wrong URLs:**
```
❌ POST https://railyn.up.railway.app/jho-ssystem-production.up.railway.app/api/login
❌ POST http://jho-ssystem-production.up.railway.app/api/login (no https)
❌ POST https://railyn.up.railway.app/api/login (wrong domain)
```

---

## Step 2: Check the Error Code

Look at the request in Network tab:

| Status Code | What It Means | Solution |
|-------------|---------------|----------|
| **405 Method Not Allowed** | URL is wrong or route doesn't exist | Check URL, verify backend route |
| **404 Not Found** | Backend route not found | Check backend is deployed, verify route exists |
| **401 Unauthorized** | Wrong credentials | Check username/password |
| **419 CSRF Token Mismatch** | Session/CORS issue | Check SANCTUM_STATEFUL_DOMAINS |
| **500 Internal Server Error** | Backend error | Check backend logs |
| **CORS Error** | CORS policy blocking | Check CORS_ALLOWED_ORIGINS |

---

## Step 3: Verify Backend Variables

Go to Railway → **Backend Service** → **Variables**

Check these EXACTLY:

```env
APP_URL=https://jho-ssystem-production.up.railway.app
SANCTUM_STATEFUL_DOMAINS=railyn.up.railway.app
CORS_ALLOWED_ORIGINS=https://railyn.up.railway.app
SESSION_DOMAIN=.railway.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
```

**Common mistakes:**
- ❌ SANCTUM has `https://` (should NOT have it)
- ❌ CORS missing `https://` (should HAVE it)
- ❌ SESSION_DOMAIN missing the dot `.` (must start with dot)
- ❌ Typo in domain names

---

## Step 4: Verify Frontend Variables

Go to Railway → **Frontend Service** → **Variables**

```env
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

**Also check Build Arguments:**
Settings → Build → Build Arguments
```
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

**Both must have `https://`**

---

## Step 5: Check Backend Logs

Go to Railway → **Backend Service** → **Logs** tab

Look for errors when you try to login:

**Common errors:**
```
SQLSTATE[HY000] [2002] Connection refused
→ Database not connected

The route [api/login] could not be found
→ Routes not set up correctly

CORS policy: No 'Access-Control-Allow-Origin' header
→ CORS_ALLOWED_ORIGINS wrong

419 CSRF token mismatch
→ SANCTUM_STATEFUL_DOMAINS wrong
```

---

## Step 6: Verify Backend is Running

### Check if backend responds:

Open this URL in browser:
```
https://jho-ssystem-production.up.railway.app/
```

**Expected:** You should see a Laravel welcome page or some response

**If you see:** 404, 500, or nothing → Backend has issues

### Check health endpoint:
```
https://jho-ssystem-production.up.railway.app/up
```

**Expected:** Should return something (even if 404, means Laravel is running)

---

## Step 7: Test API Endpoint Directly

Open this in browser:
```
https://jho-ssystem-production.up.railway.app/api/me
```

**Expected:** 401 Unauthorized (because not logged in) - **This is good!**
**Bad:** 404 Not Found - means routes not working

---

## Step 8: Check CORS Preflight

In browser Network tab, look for:
```
OPTIONS https://jho-ssystem-production.up.railway.app/api/login
```

This is the CORS preflight request.

**Check Response Headers should include:**
```
Access-Control-Allow-Origin: https://railyn.up.railway.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

If these are missing → CORS not configured correctly

---

## Step 9: Hard Refresh Browser

After any changes:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

This clears cache and loads fresh code.

---

## Step 10: Check Database Seeding

If login URL is correct but credentials don't work:

Railway Backend Shell:
```bash
php artisan tinker
>>> App\Models\User::count()
```

**Expected:** Should show a number (e.g., 3)
**If 0:** Database not seeded, run:
```bash
exit
php artisan db:seed --force
```

---

## 🆘 Common Fixes

### Fix 1: Wrong URL (405 Error)

**Symptom:** URL shows combined domains
**Solution:**
1. Frontend Variables: `VITE_API_URL=https://jho-ssystem-production.up.railway.app`
2. Frontend Build Argument: Same as above
3. Redeploy frontend

### Fix 2: CORS Error

**Symptom:** "CORS policy" in console
**Solution:**
1. Backend Variables: `CORS_ALLOWED_ORIGINS=https://railyn.up.railway.app`
2. Must include `https://`
3. Must match frontend URL exactly

### Fix 3: CSRF Token Mismatch (419)

**Symptom:** "419 CSRF token mismatch"
**Solution:**
1. Backend Variables:
   ```
   SESSION_DOMAIN=.railway.app (with dot!)
   SESSION_SECURE_COOKIE=true
   SESSION_SAME_SITE=none
   SANCTUM_STATEFUL_DOMAINS=railyn.up.railway.app (no https)
   ```

### Fix 4: Unauthorized (401)

**Symptom:** Correct URL, but 401 error
**Solution:**
1. Check `SANCTUM_STATEFUL_DOMAINS=railyn.up.railway.app`
2. No `https://` prefix
3. Must match frontend domain exactly

### Fix 5: Database Not Seeded

**Symptom:** Login fails with "Invalid credentials"
**Solution:**
```bash
# Railway Backend Shell
php artisan db:seed --force
```

Or create new admin:
```bash
php artisan tinker
>>> \App\Models\User::create(['name'=>'Admin','email'=>'admin@test.com','password'=>bcrypt('password'),'role'=>'admin','is_active'=>1]);
```

---

## 📊 Variable Reference Table

| Variable | Service | Value | Notes |
|----------|---------|-------|-------|
| APP_URL | Backend | `https://jho-ssystem-production.up.railway.app` | With https |
| ASSET_URL | Backend | `https://jho-ssystem-production.up.railway.app` | With https |
| SANCTUM_STATEFUL_DOMAINS | Backend | `railyn.up.railway.app` | **NO https** |
| CORS_ALLOWED_ORIGINS | Backend | `https://railyn.up.railway.app` | **WITH https** |
| SESSION_DOMAIN | Backend | `.railway.app` | **With dot** |
| SESSION_SECURE_COOKIE | Backend | `true` | Must be true |
| SESSION_SAME_SITE | Backend | `none` | Must be none |
| VITE_API_URL | Frontend (Var) | `https://jho-ssystem-production.up.railway.app` | With https |
| VITE_API_URL | Frontend (Build Arg) | `https://jho-ssystem-production.up.railway.app` | With https |

---

## 🎯 Quick Diagnostic

Run through this checklist:

- [ ] Frontend loads at https://railyn.up.railway.app
- [ ] Backend responds at https://jho-ssystem-production.up.railway.app
- [ ] Login request goes to correct URL (no combined domains)
- [ ] No CORS errors in console
- [ ] Backend Variables: SANCTUM_STATEFUL_DOMAINS correct (no https)
- [ ] Backend Variables: CORS_ALLOWED_ORIGINS correct (with https)
- [ ] Frontend Variables: VITE_API_URL correct (with https)
- [ ] Frontend Build Arg: VITE_API_URL correct (with https)
- [ ] Database seeded (users exist)
- [ ] Hard refreshed browser (Ctrl+Shift+R)

---

## 💡 Next Steps

**Based on your error, do this:**

1. **Check Network tab** - what's the exact URL being called?
2. **Check the status code** - 405? 404? CORS?
3. **Check backend logs** - any errors?
4. **Verify all variables** - use the table above
5. **Report back** with:
   - Exact URL from Network tab
   - Status code
   - Any error in backend logs

---

**This guide will help identify exactly what's wrong!** 🔍
