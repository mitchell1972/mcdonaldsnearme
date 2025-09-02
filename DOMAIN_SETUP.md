# Domain Configuration for McDonald's Near Me

## Domain Details
- **Primary Domain**: mcdonaldsnearme.store
- **WWW Subdomain**: www.mcdonaldsnearme.store
- **Vercel Project**: mcdonalds-directory

## Configuration Status ✅

### Completed Setup Steps:
1. ✅ Updated `vercel.json` with domain aliases
2. ✅ Deployed project to Vercel production
3. ✅ Configured primary domain (mcdonaldsnearme.store)
4. ✅ Configured www subdomain (www.mcdonaldsnearme.store)
5. ✅ Verified both domains are accessible (HTTP 200)

### Domain Verification:
- **Primary Domain**: https://mcdonaldsnearme.store - ✅ Working
- **WWW Subdomain**: https://www.mcdonaldsnearme.store - ✅ Working

### DNS Configuration:
- Nameservers: Vercel DNS (ns1.vercel-dns.com, ns2.vercel-dns.com)
- SSL: Automatic via Vercel
- HSTS: Enabled (max-age=63072000)

### Deployment Details:
- Latest Production URL: https://mcdonalds-directory-4ol9u4bq9-mitchells-projects-99699068.vercel.app
- Both domain aliases point to this production deployment

## Future Deployments
Any future deployments to production will automatically update both domain aliases. Simply run:
```bash
npx vercel --prod
```

## Domain Management
To manage domains and aliases:
```bash
# List all aliases
npx vercel alias ls

# View domain details
npx vercel domains inspect mcdonaldsnearme.store

# Add new aliases
npx vercel alias set <deployment-url> <alias>
```

---
*Last Updated: September 2, 2025*
