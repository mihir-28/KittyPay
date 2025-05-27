## 🔧 Setting up Firebase

To configure Firebase for development:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Enable Storage (if needed for future features)
5. Enable Google Analytics for your Firebase project
   - During project creation, check "Enable Google Analytics for this project"
   - Or add it later in Project Settings > Integrations > Google Analytics
   - Select or create a Google Analytics account
   - Configure data collection as needed
6. Navigate to Project settings > General > Your apps > Web app
7. Register a new web app and get your Firebase config
8. Create a `.env.local` file in the project root with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_APP_DOMAIN=http://localhost:5173
```

9. Deploy Firestore security rules:

```bash
firebase login
firebase deploy --only firestore:rules
```

## 📊 Setting up Google Analytics Events

KittyPay tracks the following events:

1. **Authentication Events**
   - User signups (`sign_up`)
   - User logins (`login`)
   - Password resets

2. **Feature Usage**
   - Kitty creation (`kitty_created`)
   - Expense additions (`expense_added`)
   - Member additions (`member_added`)
   - Settlements (`settlement_completed`)

3. **Page Navigation**
   - Page views (`page_view`)

4. **User Engagement**
   - Session duration
   - Screen time

To view analytics:
1. Go to the Firebase console
2. Select your project
3. Click on "Analytics" in the left sidebar
4. Explore the dashboard and events
5. Use BigQuery export for advanced analysis (Blaze plan required)

You can customize event tracking by modifying the `src/firebase/analytics.js` file.

## 📊 Troubleshooting Google Analytics

### Localhost Testing Issues

When testing on localhost, you may see console errors like:
```
Tracking Prevention blocked access to storage for https://apis.google.com/js/api.js
POST https://www.google-analytics.com/g/collect?... net::ERR_BLOCKED_BY_CLIENT
```

These errors occur because:
1. Modern browsers block tracking scripts on localhost by default
2. Browser privacy features (like Edge's Tracking Prevention) block Google Analytics requests
3. Analytics is primarily designed for production environments

**Solutions:**

1. **Ignore the errors during development**
   - These errors don't affect your app's functionality
   - Analytics will work correctly when deployed to production

2. **Force enable analytics for local testing**
   - Add `VITE_ENABLE_ANALYTICS=true` to your `.env.local` file
   - Temporarily disable your browser's tracking prevention

3. **Use debug mode**
   - Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
   - Use the Firebase debug console to verify events

### Privacy Compliance

When deploying to production, ensure your app complies with privacy regulations:

1. Update your privacy policy to disclose analytics usage
2. Implement consent mechanisms where required by GDPR, CCPA, etc.
3. Consider adding opt-out functionality for users

For comprehensive privacy compliance, consult with a legal professional familiar with data protection regulations in your target markets.
