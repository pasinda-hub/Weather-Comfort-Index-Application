# Auth0 Configuration Guide

Complete step-by-step guide to configure Auth0 for this application.

## Step 1: Create Auth0 Account

1. Go to https://auth0.com
2. Sign up for free account
3. Create a new tenant (e.g., `fidenz-weather`)

## Step 2: Create API

1. Navigate to **Applications** → **APIs**
2. Click **Create API**
3. Fill in details:
   - **Name**: Weather Comfort API
   - **Identifier**: `https://weather-comfort-api` (use this exact format)
   - **Signing Algorithm**: RS256
4. Click **Create**
5. Go to **Settings** tab:
   - Enable **Allow Offline Access** (for refresh tokens)
   - Enable **RBAC** and **Add Permissions in Access Token**
6. Save changes

## Step 3: Create Application

1. Navigate to **Applications** → **Applications**
2. Click **Create Application**
3. Fill in details:
   - **Name**: Weather Comfort Dashboard
   - **Type**: Single Page Application
4. Click **Create**
5. Go to **Settings** tab:
   - Note your **Domain** (e.g., `dev-xyz.us.auth0.com`)
   - Note your **Client ID**
   - Add **Allowed Callback URLs**: 
     ```
     http://localhost:3000, http://localhost:3000/callback
     ```
   - Add **Allowed Logout URLs**: 
     ```
     http://localhost:3000
     ```
   - Add **Allowed Web Origins**: 
     ```
     http://localhost:3000
     ```
   - Add **Allowed Origins (CORS)**: 
     ```
     http://localhost:3000
     ```
6. Click **Save Changes**

## Step 4: Configure Database Connection

1. Navigate to **Authentication** → **Database**
2. Select your database (default: `Username-Password-Authentication`)
3. Click **Settings** tab:
   - **Disable Sign Ups**: Check this box
   - This ensures only invited users can access
4. Click **Save**

## Step 5: Create Test User

1. Navigate to **User Management** → **Users**
2. Click **Create User**
3. Fill in:
   - **Email**: careers@fidenz.com
   - **Password**: Pass#fidenz
   - **Connection**: Username-Password-Authentication
4. Click **Create**
5. Click on the user
6. Go to **Permissions** tab
7. Assign necessary permissions

## Step 6: Enable Multi-Factor Authentication (MFA)

### Enable Email MFA:

1. Navigate to **Security** → **Multi-factor Auth**
2. Click on **Email** provider
3. Toggle **Enable Email Factor**
4. Configure settings:
   - **From**: Your email or Auth0 default
   - **Subject**: Verification Code for Weather Comfort
   - **Template**: Use default or customize
5. Save changes

### Create MFA Policy:

1. Stay in **Multi-factor Auth** section
2. Click **Policies** tab
3. Create new policy:
   - **Name**: Require MFA for All Users
   - **Policy Definition**:
   ```javascript
   function (user, context, callback) {
     // Require MFA for all users
     context.multifactor = {
       provider: 'any',
       allowRememberBrowser: false
     };
     
     callback(null, user, context);
   }
   ```
4. Save policy

## Step 7: Implement User Whitelist

1. Navigate to **Auth Pipeline** → **Rules**
2. Click **Create Rule**
3. Choose **Empty Rule** template
4. Name it: `Whitelist Specific Users`
5. Add this code:

```javascript
function (user, context, callback) {
  // Whitelist of allowed emails
  const whitelist = [
    'careers@fidenz.com'
    // Add more emails here as needed
  ];
  
  // Check if user email is in whitelist
  const userHasAccess = whitelist.some(
    email => email.toLowerCase() === user.email.toLowerCase()
  );
  
  if (!userHasAccess) {
    return callback(
      new UnauthorizedError('Access denied. Your email is not whitelisted.')
    );
  }
  
  return callback(null, user, context);
}
```

6. Click **Save Changes**

## Step 8: Configure Environment Variables

Update your `.env` file with Auth0 credentials:

```bash
# Auth0 Configuration
AUTH0_ISSUER_BASE_URL=https://your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://weather-comfort-api
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
```

**Where to find these:**
- **ISSUER_BASE_URL**: Applications → Your App → Settings → Domain (add `https://`)
- **AUDIENCE**: APIs → Weather Comfort API → Identifier
- **CLIENT_ID**: Applications → Your App → Settings → Client ID
- **CLIENT_SECRET**: Applications → Your App → Settings → Client Secret

## Step 9: Test Authentication

### Test Login:

1. Start your backend: `npm run dev`
2. Visit: `http://localhost:3000`
3. Click **Sign In**
4. Enter: `careers@fidenz.com` / `Pass#fidenz`
5. Check email for MFA code
6. Enter code to complete login
7. Should redirect to dashboard

### Test Unauthorized Access:

1. Try to access API directly:
   ```bash
   curl http://localhost:3001/api/weather
   ```
2. Should receive: `401 Unauthorized`

### Test with Token:

1. Login via UI to get token
2. Copy JWT from browser (check localStorage or network tab)
3. Test API:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/weather
   ```
4. Should receive weather data

## Step 10: Additional Security (Optional)

### Enable Anomaly Detection:

1. Navigate to **Security** → **Attack Protection**
2. Enable **Brute Force Protection**
3. Enable **Suspicious IP Throttling**
4. Enable **Breached Password Detection**

### Add Rate Limiting:

1. Navigate to **Auth Pipeline** → **Rules**
2. Create rule for rate limiting:

```javascript
function (user, context, callback) {
  const MAX_LOGINS_PER_HOUR = 5;
  
  // Use Auth0's rate limiting
  if (context.stats.loginsCount > MAX_LOGINS_PER_HOUR) {
    return callback(
      new UnauthorizedError('Rate limit exceeded. Try again later.')
    );
  }
  
  callback(null, user, context);
}
```

### Configure Session Management:

1. Navigate to **Applications** → Your App → **Settings**
2. Scroll to **Advanced Settings** → **OAuth**
3. Configure:
   - **JWT Expiration**: 36000 seconds (10 hours)
   - **Use Auth0 instead of the IdP**: Enable
   - **Inactivity timeout**: 3600 seconds (1 hour)

## Troubleshooting

### Issue: "Invalid token" error

**Solution:**
- Verify `AUTH0_AUDIENCE` matches API identifier
- Check `AUTH0_ISSUER_BASE_URL` includes `https://`
- Ensure token hasn't expired

### Issue: MFA not triggering

**Solution:**
- Check MFA policy is active
- Verify email provider is enabled
- Check user has verified email address

### Issue: User can't login despite being whitelisted

**Solution:**
- Check whitelist rule is active (not disabled)
- Verify email spelling matches exactly
- Check rule order (whitelist should be before other restrictive rules)

### Issue: CORS errors in browser

**Solution:**
- Add frontend URL to **Allowed Origins** in Auth0 app settings
- Verify backend CORS configuration includes frontend URL
- Clear browser cache

## Production Considerations

When deploying to production:

1. **Update Callback URLs**:
   - Add production domain to all URL fields
   - Remove localhost URLs

2. **Secure Client Secret**:
   - Never commit to Git
   - Use environment variables
   - Rotate periodically

3. **Enable Social Logins** (optional):
   - Navigate to **Authentication** → **Social**
   - Enable Google, GitHub, etc.
   - Configure OAuth apps

4. **Add Custom Domain**:
   - Navigate to **Branding** → **Custom Domains**
   - Configure your domain
   - Update `AUTH0_ISSUER_BASE_URL`

5. **Configure Email Templates**:
   - Navigate to **Branding** → **Email Templates**
   - Customize verification, MFA, and password reset emails

## Testing Checklist

- [ ] User can register (if enabled)
- [ ] Whitelisted user can login
- [ ] Non-whitelisted user is rejected
- [ ] MFA code is sent via email
- [ ] MFA code validation works
- [ ] JWT token is issued after MFA
- [ ] API validates JWT correctly
- [ ] API rejects invalid/expired tokens
- [ ] User can logout
- [ ] Session expires after timeout
- [ ] Refresh token works (if enabled)

## Support

For Auth0 issues:
- Documentation: https://auth0.com/docs
- Community: https://community.auth0.com
- Support: https://support.auth0.com

---

**Last Updated**:28 December 2025