# 🔧 Frontend URL Error - URGENT FIX

## 🔍 Problem

Your frontend is making requests to the wrong URL:
```
❌ https://railyn.up.railway.app/jho-ssystem-production.up.railway.app/api/login
```

It should be:
```
✅ https://jho-ssystem-production.up.railway.app/api/login
```

**Cause:** The `VITE_API_URL` environment variable is not set correctly on Railway.

---

## ✅ URGENT FIX - Do This Now

### Step 1: Update Frontend Environment Variable

Go to Railway → **Frontend Service** → Variables tab

**Check if `VITE_API_URL` exists:**
- If it exists, **update** it
- If it doesn't exist, **add** it

**Set it to:**
```
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

### Step 2: Add Build Argument (CRITICAL!)

Go to Railway → **Frontend Service** → Settings tab → **Build** section

Click "Add Build Argument"

Add:
```
Name: VITE_API_URL
Value: https://jho-ssystem-production.up.railway.app
```

⚠️ **IMPORTANT:** VITE_ variables are **build-time** variables. They must be set as **BOTH**:
1. Environment Variable (Runtime)
2. Build Argument (Build time) ← **THIS IS CRITICAL**

### Step 3: Trigger Redeploy

After updating:
1. Railway will auto-detect and redeploy
2. OR click "Deploy" → "Redeploy"

Wait 3-5 minutes for rebuild.

---

## 🔍 Verification

After redeploy:

1. Open frontend: https://railyn.up.railway.app
2. Open browser console (F12)
3. Try to login
4. Check the Network tab
5. The request should now go to:
   ```
   POST https://jho-ssystem-production.up.railway.app/api/login
   ```

---

## 📋 Complete Frontend Variables

Your Railway Frontend service should have:

### Environment Variables:
```
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

### Build Arguments:
```
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

**Both must be set!**

---

## 🎯 Why This Happened

Vite (your frontend build tool) replaces `import.meta.env.VITE_API_URL` with the actual value **during build time**.

If the build argument is not set:
- Build time: `import.meta.env.VITE_API_URL` = `undefined`
- Runtime: Variable is already baked into the bundle as `undefined`
- Result: axios uses empty string, making relative URLs

**That's why it became:**
```
https://railyn.up.railway.app + /jho-ssystem-production.up.railway.app/api/login
```

---

## 🔧 How to Add Build Argument on Railway

### Visual Guide:

1. **Go to Frontend Service**
2. **Click "Settings" tab**
3. **Scroll to "Build" section**
4. **Click "+ Add Build Argument"**
5. **Enter:**
   - Name: `VITE_API_URL`
   - Value: `https://jho-ssystem-production.up.railway.app`
6. **Click "Add"**
7. **Redeploy**

---

## 📊 Before vs After

### Before (Wrong):
```javascript
// At build time:
baseURL = import.meta.env.VITE_API_URL || '';
// VITE_API_URL is undefined (not set at build)
baseURL = undefined || '';
baseURL = '';

// At runtime:
POST /api/login
// Becomes relative URL, appends to current domain
POST https://railyn.up.railway.app/jho-ssystem-production.up.railway.app/api/login
```

### After (Correct):
```javascript
// At build time (with build argument):
baseURL = import.meta.env.VITE_API_URL || '';
// VITE_API_URL = 'https://jho-ssystem-production.up.railway.app'
baseURL = 'https://jho-ssystem-production.up.railway.app';

// At runtime:
POST https://jho-ssystem-production.up.railway.app/api/login ✅
```

---

## 🆘 Still Not Working?

### Check Build Logs:
Railway → Frontend Service → Deployments → Latest → View Build Logs

Look for:
```
VITE_API_URL=https://jho-ssystem-production.up.railway.app
```

If you don't see it, the build argument is not set!

### Verify in Browser Console:
After the frontend loads, check in console:
```javascript
// Type this in browser console:
console.log(import.meta.env)
```

You should see:
```javascript
{
  VITE_API_URL: "https://jho-ssystem-production.up.railway.app"
}
```

### Hard Refresh Browser:
After Railway redeploys:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

This clears cache and loads the new build.

---

## ✅ Quick Checklist

Complete this checklist:

- [ ] Open Railway Frontend Service
- [ ] Go to Variables tab
- [ ] Add/Update: `VITE_API_URL=https://jho-ssystem-production.up.railway.app`
- [ ] Go to Settings tab
- [ ] Scroll to Build section
- [ ] Add Build Argument: `VITE_API_URL=https://jho-ssystem-production.up.railway.app`
- [ ] Wait for redeploy (3-5 minutes)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Try login again
- [ ] Check Network tab - URL should be correct now

---

## 🎯 Expected Result

After fix:
```
✅ Login request goes to: https://jho-ssystem-production.up.railway.app/api/login
✅ CORS headers are correct
✅ Login succeeds
✅ Redirects to dashboard
```

---

**TL;DR: Add `VITE_API_URL` as BOTH Environment Variable AND Build Argument on Railway Frontend Service, then redeploy!** 🚀
