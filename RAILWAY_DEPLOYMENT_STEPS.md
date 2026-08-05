# RailynStore - Railway Deployment Steps

## ✅ Pre-Deployment Checklist (COMPLETED)

Your project has been configured for Railway deployment with the following changes:

### Files Modified:
1. ✅ **store/Procfile** - Removed `--seed` flag (migrations only on deploy)
2. ✅ **store/.env.example** - Updated with Railway production settings
3. ✅ **store-frontend/.env.production** - Created with VITE_API_URL template

### Already Configured:
- ✅ CORS config reads from `CORS_ALLOWED_ORIGINS`
- ✅ Session config supports cross-domain cookies
- ✅ Axios configured for dynamic API URLs
- ✅ React Router SPA routing fixed with `_redirects`

---

## 🚀 Railway Deployment Instructions

### STEP 1: Push to GitHub

```bash
cd c:\laragon\www\laravel_projects\Sia2\RailynStore\railynStore

# Initialize git if not already done
git init
git add .
git commit -m "Configure for Railway deployment"

# Add remote
git remote add origin https://github.com/Jeyeeem/Jho-sSircnicko.git
git branch -M main
git push -u origin main
```

---

### STEP 2: Create Railway Project

1. Go to https://railway.com
2. Click "Login with GitHub"
3. Click "New Project"
4. Click "Empty Project"
5. Name it "RailynStore"

---

### STEP 3: Add MySQL Database

1. Click "+ New" in your Railway project
2. Select "Database" → "MySQL"
3. Wait for it to provision (~30 seconds)
4. Click on the MySQL service → "Variables" tab
5. Note these variables (you'll reference them):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

---

### STEP 4: Deploy Backend (Laravel)

1. Click "+ New" → "GitHub Repo"
2. Select your "Jho-sSircnicko" repository
3. Click on the new service → "Settings" tab:
   - **Service Name**: Change to "backend" or "laravel-api"
   - **Root Directory**: Set to `store`
   - Save changes

4. Go to "Variables" tab → Click "New Variable" and add:

```env
APP_NAME=RailynStore
APP_ENV=production
APP_DEBUG=false
APP_KEY=
APP_URL=

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

SESSION_DRIVER=database
SESSION_DOMAIN=.railway.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none

SANCTUM_STATEFUL_DOMAINS=
CORS_ALLOWED_ORIGINS=

LOG_CHANNEL=stderr
CACHE_STORE=file
QUEUE_CONNECTION=sync
BCRYPT_ROUNDS=12
```

5. **Generate APP_KEY locally:**
   ```bash
   cd store
   php artisan key:generate --show
   ```
   Copy the output (e.g., `base64:xxx...`) and paste it as `APP_KEY` value

6. Go to "Settings" → "Networking" → Click "Generate Domain"
   - You'll get: `https://railynstore-production.up.railway.app`
   - **COPY THIS URL**

7. Go back to "Variables" and update:
   ```env
   APP_URL=https://railynstore-production.up.railway.app
   ```

---

### STEP 5: Deploy Frontend (React)

1. Click "+ New" → "GitHub Repo"
2. Select the SAME "Jho-sSircnicko" repository
3. Click on this new service → "Settings" tab:
   - **Service Name**: Change to "frontend" or "react-spa"
   - **Root Directory**: Set to `store-frontend`
   - Save changes

4. Go to "Settings" → "Build" section:
   - Click "Add Build Argument"
   - Key: `VITE_API_URL`
   - Value: `https://railynstore-production.up.railway.app` (your backend URL)

5. Go to "Variables" tab → Add:
   ```env
   VITE_API_URL=https://railynstore-production.up.railway.app
   ```
   (Use your actual backend URL from Step 4.6)

6. Go to "Settings" → "Networking" → Click "Generate Domain"
   - You'll get: `https://railynstore-frontend-production.up.railway.app`
   - **COPY THIS URL**

---

### STEP 6: Update Backend with Frontend URL

1. Go back to the **Backend service** → "Variables" tab
2. Update these variables:
   ```env
   SANCTUM_STATEFUL_DOMAINS=railynstore-frontend-production.up.railway.app
   CORS_ALLOWED_ORIGINS=https://railynstore-frontend-production.up.railway.app
   ```
   
   **IMPORTANT:**
   - `SANCTUM_STATEFUL_DOMAINS` = NO `https://`
   - `CORS_ALLOWED_ORIGINS` = YES with `https://`

3. The backend will automatically redeploy

---

### STEP 7: Seed Database (First Time Only)

1. Click on the **Backend service**
2. Click the "Shell" tab (or three dots → "Shell")
3. Run this command:
   ```bash
   php artisan db:seed --force
   ```
4. Wait for completion - your database now has default data

---

### STEP 8: Test Your Deployment

1. Open your frontend URL in a browser:
   ```
   https://railynstore-frontend-production.up.railway.app
   ```

2. Try logging in with your credentials

3. Check if all features work:
   - Login/logout
   - Navigation
   - Product management
   - POS system
   - Reports

---

## 🔧 Troubleshooting

### Problem: "CORS Error" in browser console
**Fix:**
- Check `CORS_ALLOWED_ORIGINS` in backend variables
- Must include `https://` and match frontend URL exactly
- Example: `https://railynstore-frontend-production.up.railway.app`

### Problem: "419 CSRF Token Mismatch"
**Fix:**
- `SESSION_DOMAIN` must be `.railway.app` (with leading dot)
- `SESSION_SECURE_COOKIE` must be `true`
- `SESSION_SAME_SITE` must be `none`
- `SANCTUM_STATEFUL_DOMAINS` must match frontend domain WITHOUT `https://`

### Problem: "500 Server Error"
**Fix:**
- Check backend logs: Backend service → "Logs" tab
- Verify `APP_KEY` is set
- Verify database credentials are correct
- Try running in Shell: `php artisan config:clear`

### Problem: Login works but API calls fail
**Fix:**
- Check `SANCTUM_STATEFUL_DOMAINS` matches frontend domain
- Check browser Network tab for cookie issues
- Verify `withCredentials: true` in axios config

### Problem: Page refresh shows 404
**Fix:**
- Verify `_redirects` file exists in `store-frontend/public/`
- File should contain: `/*    /index.html   200`

---

## 📊 Railway Environment Variables Summary

### Backend (Laravel)
```
APP_NAME=RailynStore
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... (generated)
APP_URL=https://YOUR-BACKEND.railway.app

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

SESSION_DRIVER=database
SESSION_DOMAIN=.railway.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none

SANCTUM_STATEFUL_DOMAINS=YOUR-FRONTEND.railway.app
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.railway.app

LOG_CHANNEL=stderr
CACHE_STORE=file
QUEUE_CONNECTION=sync
BCRYPT_ROUNDS=12
```

### Frontend (React)
```
VITE_API_URL=https://YOUR-BACKEND.railway.app
```

### Frontend Build Argument
```
VITE_API_URL=https://YOUR-BACKEND.railway.app
```

---

## 🔄 Future Updates

After making code changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Railway will automatically detect the push and redeploy both services.

---

## 💰 Estimated Railway Costs

- **Hobby Plan**: $5/month (includes $5 usage credit)
- **Typical usage**: $5-10/month for this app
- **Free trial**: $5 credit (no credit card needed)

---

## ✨ Features Deployed

Your RailynStore includes:

### Admin Features:
- Dashboard with analytics
- Product management (CRUD)
- Category management
- User management
- Sales monitoring
- Comprehensive reports
- Business settings
- Discount rules
- Activity logs
- Damaged items approval

### Staff Features:
- POS system with discounts
- Sales transactions
- Report damaged items
- View reports
- Profile management

### Security:
- Laravel Sanctum authentication
- Role-based access control
- Activity logging
- CSRF protection
- Secure sessions

---

## 📞 Support

If you encounter issues:
1. Check Railway logs (Backend/Frontend → Logs tab)
2. Check browser console (F12 → Console tab)
3. Verify all environment variables are set correctly
4. Review the troubleshooting section above

---

## 🎉 Deployment Complete!

Your RailynStore is now live on Railway!

**Next Steps:**
1. Test all features thoroughly
2. Update business settings with your information
3. Add your products and categories
4. Train your staff on using the system
5. Consider setting up a custom domain (optional)

Good luck with your store! 🚀
