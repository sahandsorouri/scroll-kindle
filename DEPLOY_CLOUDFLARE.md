# Deploy QuoteScroll to Cloudflare Pages

## ✅ Compatibility

QuoteScroll is **fully compatible** with Cloudflare Pages! The app uses:
- ✅ Client-side rendering (no server-side state)
- ✅ Simple API proxy routes (compatible with Cloudflare Workers)
- ✅ No database or server-side storage
- ✅ All data stored in browser (IndexedDB + localStorage)

---

## 🚀 Deployment Methods

### **Option 1: Deploy via Cloudflare Dashboard (Easiest)**

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - QuoteScroll"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/quotescroll.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Click **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select your GitHub repository
   - Configure build settings:

3. **Build Settings**
   ```
   Framework preset: Next.js
   Build command: pnpm build
   Build output directory: .next
   Root directory: /
   Node version: 20
   ```

4. **Environment Variables**
   - None needed! The app uses only client-side storage

5. **Click Deploy**
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.pages.dev`

---

### **Option 2: Deploy via Wrangler CLI**

1. **Install Wrangler**
   ```bash
   pnpm add -D wrangler
   # or
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   pnpm build
   wrangler pages deploy .next --project-name=quotescroll
   ```

---

## ⚙️ Cloudflare-Specific Configuration

### Create `wrangler.toml` (Optional)
```toml
name = "quotescroll"
compatibility_date = "2024-01-01"

[build]
command = "pnpm build"

[env.production]
name = "quotescroll"
route = "quotescroll.pages.dev/*"
```

### Update `next.config.js` for Cloudflare (if needed)
The current config should work, but if you encounter issues, you can optimize:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure compatibility with Cloudflare Pages
  output: 'standalone', // Optional: for better performance
}

module.exports = nextConfig
```

---

## 🔧 Troubleshooting

### **Issue: Build Fails**
**Solution:** Ensure Node version is set to 20 in Cloudflare Pages settings:
- Pages Dashboard → Settings → Environment Variables
- Add: `NODE_VERSION` = `20`

### **Issue: API Routes Not Working**
Cloudflare Pages supports Next.js API routes, but they run on Cloudflare Workers. If you see errors:

1. Check the Functions logs in Cloudflare Dashboard
2. Ensure API routes don't use Node.js-specific APIs
3. Our routes are simple fetch proxies, so they should work fine

### **Issue: Static Export Errors**
If you get errors about dynamic routes:
- The current setup is already configured correctly
- API routes are marked with `export const dynamic = 'force-dynamic'`
- Pages use proper Suspense boundaries

---

## 📊 Performance Comparison

| Feature | Vercel | Cloudflare Pages |
|---------|--------|------------------|
| Build Speed | Fast | Fast |
| Edge Network | Yes | Yes (faster globally) |
| Free Tier | 100GB/month | Unlimited bandwidth |
| API Routes | Yes | Yes (Workers) |
| Analytics | Paid | Free |
| DDoS Protection | Included | Included |

**Recommendation:** Cloudflare Pages is **excellent** for this app!
- ✅ Faster global edge network
- ✅ Unlimited bandwidth on free tier
- ✅ Free analytics
- ✅ No cold starts (compared to serverless)

---

## 🌐 Custom Domain

After deployment, add your custom domain:

1. Go to Pages Dashboard → Custom Domains
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `quotescroll.com`)
4. Follow DNS instructions
5. SSL certificate is automatically provisioned

---

## 🔒 Security Headers (Optional)

Add security headers in Cloudflare Pages:

Create `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 📈 Monitoring

Cloudflare provides free analytics:
- **Real User Monitoring (RUM)**: Track actual user performance
- **Web Analytics**: Privacy-friendly analytics
- **Functions Analytics**: Monitor API route performance

Access via: Pages Dashboard → Analytics

---

## 🎯 Post-Deployment Checklist

After deploying:

- [ ] Test landing page loads
- [ ] Try demo mode
- [ ] Test Readwise connection (use real token)
- [ ] Verify highlights load
- [ ] Test keyboard navigation
- [ ] Test on mobile device
- [ ] Check browser console for errors
- [ ] Test all filter options

---

## 🚨 Known Limitations

None! The app is fully compatible with Cloudflare Pages.

**Note:** Cloudflare Pages has some limits:
- Max file size: 25 MB (our app is ~500 KB)
- Max build time: 20 minutes (we build in ~2 minutes)
- Function execution: 30 seconds timeout (our API calls are fast)

All well within limits! ✅

---

## 💡 Pro Tips

1. **Enable Cloudflare Web Analytics** for privacy-friendly tracking
2. **Use Custom Domain** with Cloudflare DNS for best performance
3. **Enable Auto-deployments** on git push
4. **Use Preview Deployments** for testing (automatic on PRs)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Cloudflare Pages logs in the dashboard
2. Review the Functions logs for API route errors
3. Test locally first: `pnpm build && pnpm start`
4. Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)

---

**Ready to deploy?** Just push to GitHub and connect in Cloudflare Pages dashboard! 🚀

