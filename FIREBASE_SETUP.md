## 🔧 Setting up Firebase

To configure Firebase for development:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Enable Storage (if needed for future features)
5. Navigate to Project settings > General > Your apps > Web app
6. Register a new web app and get your Firebase config
7. Create a `.env.local` file in the project root with your Firebase config:

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

8. Deploy Firestore security rules:

```bash
firebase login
firebase deploy --only firestore:rules
```
