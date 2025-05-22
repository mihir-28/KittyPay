[![Netlify Status](https://api.netlify.com/api/v1/badges/f7d2c417-eab4-4db0-8cce-e4821643f431/deploy-status)](https://app.netlify.com/projects/kittypay/deploys)

# KittyPay - The Modern Desi Way to Split Expenses

<p align="center">
  <img src="public/logo.svg" alt="KittyPay" width="350"/>
</p>

KittyPay is a sleek and smart expense-splitting app designed for groups of friends, flatmates, and families who love to hang out but hate the awkward math afterward. Inspired by the classic kitty party concept and built for the modern Indian user, KittyPay makes sharing expenses simple, fair, and even fun.

## 📱 Live Demo

Check out the live version at: [https://kittypay.netlify.app](https://kittypay.netlify.app)

## ✨ Key Features

### 💰 Expense Management
- **Smart Groups (Kitties)** - Create dedicated spaces for trips, flatmates, events, or regular hangouts
- **Flexible Splitting** - Split bills equally, by percentages, or custom amounts
- **Smart Settlements** - Minimize transactions with our optimized settlement algorithm
- **Multi-Currency Support** - Perfect for international trips and foreign expenses
- **Date Editing** - Retroactively adjust expense dates for accurate budgeting and tracking
- **Categories with Emojis** - Visual categorization making expense tracking more intuitive
- **Notes & Details** - Add context to expenses with detailed notes

### 🧮 Financial Tools
- **Balance Dashboard** - Visual representation of your spending patterns
- **Monthly Trends** - Track spending increases/decreases over time
- **Category Breakdown** - See where your money is going with detailed charts
- **Top Spenders** - Identify who's contributing most to group expenses
- **Settlement Plans** - Optimized pathways to settle all debts with minimal transactions

### 👥 Social Features
- **Activity Timeline** - Keep track of all group activity
- **In-app Reminders** - Gentle nudges for pending settlements
- **Multi-Member Support** - Add as many people as needed to your kitties
- **Owner Controls** - Designated kitty owner with management privileges

### 🎨 User Experience
- **Beautiful UI** - Clean, intuitive interface with smooth animations
- **Dark & Light Modes** - Easy on the eyes, day or night
- **Responsive Design** - Works flawlessly on all devices from mobile to desktop
- **PWA Support** - Install as a native app on your device

## 🔥 Firebase Integration

KittyPay seamlessly integrates with Firebase to provide a robust and scalable backend:

- **Authentication** - Secure user authentication with email/password and Google sign-in
- **Firestore Database** - Real-time data synchronization for kitties, expenses, and user profiles
- **Security Rules** - Fine-grained access control for protecting user data
- **Cloud Storage** - Store receipt images and profile pictures
- **Cloud Functions** - For advanced business logic like expense notifications (coming soon)

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18+
  - Tailwind CSS for styling
  - Framer Motion for animations
  - React Icons for UI elements
  - Recharts for data visualization
- **Build Tool**: Vite for fast development
- **Routing**: React Router v6 with protected routes
- **State Management**: React Context API & Hooks
- **Authentication**: Firebase Auth with multiple login options
- **Database**: Firebase Firestore
- **Styling**: CSS Variables for theming, Tailwind for utilities
- **Deployment**: Netlify CI/CD pipeline

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn
- Firebase account (free tier works fine)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/kittypay.git

# Navigate to project directory
cd kittypay

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Then edit .env with your Firebase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

### 🔥 Firebase Configuration

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Add your Firebase configuration to `.env`
5. Deploy Firestore security rules (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

For detailed instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Netlify (if Netlify CLI is installed)
netlify deploy
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e
```

## 📱 Progressive Web App Features

KittyPay is a Progressive Web App (PWA) which means you can:

- Install it on your home screen for a native app-like experience
- Use it offline
- Receive push notifications (coming soon)
- Enjoy fast loading times with service worker caching

## 🗺️ Roadmap

- **Q3 2023**
  - Receipt scanning with OCR
  - Recurring expense automation
  - Mobile number-based user tagging
  
- **Q4 2023**
  - UPI integration for direct payments
  - Expense analytics and budget insights
  - WhatsApp integration for sharing expenses
  
- **2024**
  - Voice input for expense entry
  - Group chat functionality
  - Expense reminders and notifications
  - Advanced reporting and tax categories

## 🐛 Bug Reporting

If you find a bug, please open an issue with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Device and browser information

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Follow the existing code structure
- Use functional components with hooks
- Add appropriate comments for complex logic
- Include PropTypes for all components

## 📄 License

This project is licensed - see the [LICENSE.MD](./LICENSE.md) file for details.

## 🙏 Acknowledgments

- Inspired by the traditional Indian concept of "kitty parties"
- Built with 💖 for friends who always argue about bills
- Special thanks to our early testers for their valuable feedback
- Icons provided by [React Icons](https://react-icons.github.io/react-icons/)
- Charts powered by [Recharts](https://recharts.org/)

---

<p align="center">Made with ❤️ in India</p>