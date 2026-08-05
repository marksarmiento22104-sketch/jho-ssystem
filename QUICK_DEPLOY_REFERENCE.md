# 🚀 Railway Quick Deploy Reference

## Before You Start

✅ All configuration files have been created
✅ Procfile configured (migrations on deploy)
✅ CORS and Session configs ready
✅ Dockerfiles created (optional)
✅ Frontend routing fixed

---

## 📋 Deployment Order

```
1. MySQL Database
2. Backend (Laravel) - store/
3. Frontend (React) - store-frontend/
```

---

## 🔑 Backend Environment Variables

**Copy-paste this into Railway:**

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

**To generate APP_KEY:**
```bash
cd store
php artisan key:generate --show
```

---

## 🎨 Frontend Environment Variables

**Add in Railway Variables tab:**
```env
VITE_API_URL=https://your-backend.railway.app
```

**Add in Railway Settings → Build → Build Arguments:**
```
VITE_API_URL=https://your-backend.railway.app
```

---

## 🔗 URL Configuration Pattern

After both services are deployed:

### Backend Variables (update these):
```env
APP_URL=https://backend-xyz.railway.app
SANCTUM_STATEFUL_DOMAINS=frontend-xyz.railway.app
CORS_ALLOWED_ORIGINS=https://frontend-xyz.railway.app
```

**Remember:**
- SANCTUM: NO `https://`
- CORS: YES with `https://`
- SESSION_DOMAIN: starts with `.` → `.railway.app`

---

## 🗂️ Railway Settings

### Backend Service
- **Root Directory**: `store`
- **Builder**: Buildpack or Dockerfile (auto-detected)

### Frontend Service  
- **Root Directory**: `store-frontend`
- **Builder**: Buildpack or Dockerfile (auto-detected)

---

## 🌱 First Deploy Commands

Run in Backend Shell after deployment:

```bash
# Seed database (first time only)
php artisan db:seed --force

# Check migrations status
php artisan migrate:status

# Clear all caches
php artisan optimize:clear
```

---

## 🔍 Troubleshooting Commands

### Backend Shell:
```bash
# View config
php artisan config:show

# Clear config cache
php artisan config:clear

# Run migrations manually
php artisan migrate --force

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

### Check Logs:
- Railway Dashboard → Service → "Logs" tab
- Browser Console (F12) for frontend errors

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Login works (test with credentials)
- [ ] API calls successful (check Network tab)
- [ ] Cookies set correctly (check Application tab)
- [ ] Database seeded with initial data
- [ ] All pages load without 404
- [ ] POS system works
- [ ] Reports generate correctly

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check `CORS_ALLOWED_ORIGINS` includes `https://` |
| 419 CSRF | Check `SESSION_DOMAIN=.railway.app` and `SESSION_SAME_SITE=none` |
| 500 error | Check logs, verify `APP_KEY` is set |
| 404 on refresh | Verify `_redirects` file in `store-frontend/public/` |
| Login fails | Check `SANCTUM_STATEFUL_DOMAINS` matches frontend domain |

---

## 📞 Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
npm install -g @railway/cli

railway login
railway link
railway logs
railway shell
```

---

## 💡 Pro Tips

1. **Database Backups**: Railway Pro plan includes automatic backups
2. **Custom Domain**: Add in Settings → Networking → Custom Domain
3. **Environment Groups**: Use Railway's environment variables groups
4. **Monitoring**: Enable Railway's built-in metrics
5. **Logs**: Use `LOG_CHANNEL=stderr` for Railway log aggregation

---

## 🔄 Update Workflow

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push

# Railway auto-deploys both services
# Check deployment status in Railway dashboard
```

---

## 📊 Service URLs Pattern

After deployment, you'll have:

```
Backend:  https://railynstore-production-abc123.up.railway.app
Frontend: https://railynstore-frontend-production-xyz789.up.railway.app
MySQL:    Internal Railway network (not publicly accessible)
```

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Frontend URL loads the login page
✅ Login with credentials works
✅ Dashboard displays after login
✅ API calls visible in Network tab
✅ No CORS errors in console
✅ Products page loads data
✅ POS system can process sales

---

**Need help? Check `RAILWAY_DEPLOYMENT_STEPS.md` for detailed instructions.**
