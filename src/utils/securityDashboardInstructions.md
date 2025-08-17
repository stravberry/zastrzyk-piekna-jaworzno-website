# Security Dashboard Configuration Instructions

## Critical Supabase Settings to Configure Manually

### 1. Enable Leaked Password Protection (High Priority)
**Location:** Supabase Dashboard → Authentication → Settings → Password Settings
**Action:** Enable "Password breach detection"
**Impact:** Prevents users from setting commonly breached passwords
**Estimated Time:** 2 minutes

### 2. Optimize OTP Expiry Settings (Medium Priority)
**Location:** Supabase Dashboard → Authentication → Settings → Email Auth
**Current Setting:** Default expiry (likely 24 hours)
**Recommended Setting:** 10 minutes
**Impact:** Reduces window for OTP interception
**Estimated Time:** 1 minute

### 3. Configure Rate Limiting (Medium Priority)
**Location:** Supabase Dashboard → Authentication → Settings → Rate Limiting
**Recommended Settings:**
- Sign up: 5 requests per hour per IP
- Sign in: 10 requests per hour per IP
- Password reset: 3 requests per hour per IP
**Impact:** Prevents brute force attacks
**Estimated Time:** 3 minutes

### 4. Review Email Templates (Low Priority)
**Location:** Supabase Dashboard → Authentication → Email Templates
**Action:** Ensure all templates use HTTPS links and contain security warnings
**Impact:** Better user security awareness
**Estimated Time:** 5 minutes

### 5. Database Extension Review (Optional)
**Location:** Supabase Dashboard → SQL Editor
**Action:** Review extensions in public schema and move to dedicated schemas
**Query to check:** `SELECT * FROM pg_extension WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');`
**Impact:** Better database organization, no security risk
**Estimated Time:** 10 minutes

## Configuration Checklist

- [ ] Leaked password protection enabled
- [ ] OTP expiry set to 10 minutes
- [ ] Rate limiting configured
- [ ] Email templates reviewed
- [ ] Database extensions reviewed (optional)

## Additional Security Recommendations

### URL Configuration
- Ensure Site URL matches your production domain
- Add all valid redirect URLs (production, staging, localhost)
- Remove any unused redirect URLs

### SMTP Configuration
- Use authenticated SMTP for email delivery
- Enable SMTP authentication logs
- Configure SPF/DKIM records for email domain

### API Settings
- Review API rate limits
- Enable request logging for audit purposes
- Configure CORS settings appropriately

## Security Monitoring Setup

After completing the above configurations, monitor these metrics:
1. Failed login attempts per hour
2. Password reset requests per day  
3. OTP generation/validation rates
4. Unusual authentication patterns

## Emergency Procedures

If you detect suspicious activity:
1. Temporarily reduce rate limits
2. Enable additional logging
3. Review recent authentication logs
4. Consider temporarily disabling sign-ups if under attack

---

**Note:** These settings complement the code-level security optimizations that have been automatically implemented. Both layers are essential for comprehensive security.