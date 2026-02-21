# 🐕 Waggle - Dog Breeding Platform

A modern, full-featured dog breeding matching platform built with React, TypeScript, Firebase, and Tailwind CSS.

![Waggle Banner](https://via.placeholder.com/1200x300/d97706/ffffff?text=Waggle+-+Dog+Breeding+Platform)

## 🌟 Features

### Core Features

- 🔐 **Multi-Provider Authentication**
  - Email/Password with email verification
  - Google OAuth
  - Facebook Login
  - Microsoft Login
  - Password reset functionality

- 🐶 **Dog Profile Management**
  - Create and manage dog profiles
  - Upload multiple photos
  - Detailed breed information from The Kennel Club
  - Health verification system
  - Admin approval workflow

- 🔍 **Advanced Search & Filtering**
  - Search by breed, location, gender
  - Filter by availability status
  - Real-time search results
  - Breed encyclopedia with 200+ breeds

- 💬 **Real-time Messaging**
  - Direct messaging between users
  - Real-time notifications
  - Conversation history
  - Read receipts

- ⭐ **Favorites System**
  - Save favorite dog profiles
  - Quick access to saved dogs
  - Remove from favorites

- 🌓 **Dark Mode**
  - System preference detection
  - Manual toggle
  - Persistent theme preference

- 📱 **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop enhancement

### Admin Features

- 👨‍💼 **Admin Dashboard**
  - Dog profile approval/rejection
  - User management
  - Analytics overview
  - Breed data management

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Hot Toast** - Toast notifications

### Backend & Services

- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - Image and file storage
- **Firebase Hosting** - Static site hosting

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Sentry** - Error tracking and monitoring
- **Git** - Version control

### Data Sources

- **The Kennel Club** - Official breed information and images

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase account**
- **Firebase CLI** (`npm install -g firebase-tools`)

## 🚀 Getting Started

1. Clone the Repository

```bash
git clone https://github.com/yourusername/waggle.git
cd waggle
```

2. Install Dependencies

```bash
npm install
```

3. Firebase Setup

### Create a Firebase Project

- Go to Firebase Console  
- Click "Add project"  
- Follow the setup wizard  
- Enable the following services:  
- Authentication  
- Cloud Firestore  
- Storage  
- Hosting  
- Configure Authentication Providers  
- Email/Password:  

### Go to Authentication → Sign-in method

- Enable Email/Password  
- Enable email verification  
- Google:  

### Enable Google provider

- Configure OAuth consent screen in Google Cloud Console  
- Facebook:  

### Create a Facebook App

- Add Facebook Login product  
- Copy App ID and App Secret to Firebase  
- Add OAuth redirect URI from Firebase to Facebook App  

### Microsoft

- Create an Azure App Registration  
- Copy Application (client) ID and create client secret  
- Add credentials to Firebase  
- Add OAuth redirect URI from Firebase to Azure  
- Set Up Firestore  
- Create database in production mode  
- Deploy security rules:  

```bash
firebase deploy --only firestore:rules
```

Or manually add these rules in Firebase Console:

```bash
javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    match /breeds/{breedId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /dogs/{dogId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && 
                      request.resource.data.ownerId == request.auth.uid;
      allow update: if isSignedIn() && 
                      (isOwner(resource.data.ownerId) || isAdmin());
      allow delete: if isSignedIn() && isOwner(resource.data.ownerId);
    }
    
    match /conversations/{conversationId} {
      allow read: if isSignedIn() && 
                    request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() && 
                      request.auth.uid in request.resource.data.participants;
      allow update: if isSignedIn() && 
                      request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if isSignedIn() && 
                      request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if isSignedIn() && 
                        request.resource.data.fromUserId == request.auth.uid;
      }
    }
    
    match /favorites/{favoriteId} {
      allow read, write: if isSignedIn() && 
                           request.auth.uid == resource.data.userId;
    }
  }
}
```

### Set Up Storage

### Deploy storage rules

```bash

firebase deploy --only storage
```

### Storage Rules

```bash
javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024 &&
             request.resource.contentType.matches('image/.*');
    }
    
    match /dogs/{userId}/{filename} {
      allow read: if true;
      allow write: if isSignedIn() && isOwner(userId) && isValidImage();
      allow delete: if isSignedIn() && isOwner(userId);
    }
    
    match /user_photos/{userId}/{filename} {
      allow read: if true;
      allow write: if isSignedIn() && isOwner(userId) && isValidImage();
      allow delete: if isSignedIn() && isOwner(userId);
    }
  }
}
```

### 4. Environment Configuration

Create a .env file in the root directory:

```bash
env
```

### Firebase Configuration

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Sentry (Optional - for error tracking)

```bash
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ENVIRONMENT=development
```

### Admin Email (for making yourself admin)

The project includes breed data from The Kennel Club. To import:

```bash
# Run the Python scraper (optional - data already included)
python scripts/scrape_kennel_club.py


# Import breeds to Firestore
npm run import-breeds
```

This will populate your database with 200+ dog breeds with official information.

## 6. Create Admin User

### After registering your first account

- Go to Firestore in Firebase Console
- Create a new collection: admins
- Add a document with your user ID:

```text
Document ID: your-user-uid
Fields:
  - role: "admin" (string)
  - email: "your@email.com" (string)
  - createdAt: [Current timestamp]
💻 Development
Run Development Server
```

```bash
npm run dev
```

Visit <http://localhost:5173>

## Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize hosting (first time only)
firebase init hosting

# Build and deploy
npm run deploy
```

Your site will be live at:

- [https://your-project.web.app](https://your-project.web.app)
- [https://your-project.firebaseapp.com](https://your-project.firebaseapp.com)

## Custom Domain Setup

- Go to Firebase Console → Hosting  
- Click "Add custom domain"  
- Follow DNS configuration instructions  
- Update OAuth redirect URIs in:  
- Firebase Console  
- Facebook App Settings  
- Azure App Registration  
- Google Cloud Console  
- Post-Deployment Checklist  
- Update authorized domains in Firebase Authentication  
- Update OAuth redirect URIs for all providers  
- Test all authentication methods  
- Test image uploads  
- Test messaging system  
- Verify admin functionality  
- Check mobile responsiveness  
- Test dark mode  
- Monitor Firebase usage quotas  

## 📁 Project Structure

```text
waggle/
├── public/                 # Static assets
├── scripts/               # Utility scripts
│   ├── scrape_kennel_club.py    # Breed data scraper
│   ├── importBreeds.ts           # Import breeds to Firestore
│   ├── deleteBreeds.ts           # Delete breed data
│   └── firebase-admin.ts         # Firebase Admin SDK setup
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dog/          # Dog-related components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── AuthProvider.tsx
│   │   └── useAuth.ts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   │   └── sentry.ts     # Error tracking
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Dogs.tsx
│   │   ├── DogProfile.tsx
│   │   ├── AddDog.tsx
│   │   ├── EditDog.tsx
│   │   ├── BreedDirectory.tsx
│   │   ├── BreedProfile.tsx
│   │   ├── Messages.tsx
│   │   ├── Favorites.tsx
│   │   ├── Profile.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   └── NotFound.tsx
│   ├── types/            # TypeScript type definitions
│   │   ├── breed.ts
│   │   ├── dog.ts
│   │   └── user.ts
│   ├── config/           # Configuration files
│   │   └── routes.ts
│   ├── firebase.ts       # Firebase configuration
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules         # Storage security rules
├── firebase.json         # Firebase configuration
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

### 🔑 Key Features Explained

## Authentication Flow

- User registers with email/password or OAuth provider  
- Email verification required for email/password signup  
- User profile automatically created in Firestore  
- Profile synced with authentication provider data  
- Dog Profile Workflow  
- User creates dog profile with details and photos  
- Profile status set to "pending"  
- Admin reviews and approves/rejects  
- Approved dogs appear in search results  
- Owners can edit/delete their dogs  
- Messaging System  
- Users can message dog owners  
- Conversations created on first message  
- Real-time updates using Firestore listeners  
- Read receipts tracked  
- Conversation list shows unread count  
- Admin System  
- Admins manually added to admins collection  
- Admin role checked in security rules  
- Admin dashboard shows pending dogs  
- Approve/reject functionality with feedback  
- View all users and system stats  

## 🔒 Security

- Authentication Security  
- Email verification required  
- Secure password requirements  
- OAuth tokens handled by Firebase  
- Session management  
- Data Security  
- Firestore security rules enforce access control  
- Users can only modify their own data  
- Admins have elevated permissions  
- Storage rules prevent unauthorized uploads  
- Privacy  
- GDPR-compliant data deletion  
- Privacy policy included  
- User data deletion functionality  
- Minimal data collection  

## 🐛 Troubleshooting

### Common Issues

Build Errors:

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Firebase Authentication Issues

## Verify all redirect URIs are correct

- Check that email verification is enabled  
- Ensure authorized domains include your domain  
- Image Upload Failures:  

## Check storage rules

- Verify file size limits (5MB max)  
- Check storage quota in Firebase Console  
- Messaging Not Working:  

## Verify Firestore rules for conversations

- Check that indexes are deployed  
- Look for errors in browser console  
- Breed Data Missing:  

## Run import script: npm run import-breeds

- Check Firestore for breeds collection  
- Verify admin permissions for import  

### 📊 Firebase Usage Limits

## Free Tier (Spark Plan)

- Authentication: 50,000 phone/month  
- Firestore: 50K reads, 20K writes, 20K deletes per day  
- Storage: 5GB storage, 1GB/day downloads  
- Hosting: 10GB storage, 360MB/day bandwidth  
- Monitor usage in Firebase Console to avoid overages.  

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files  
- Follow existing naming conventions  
- Add comments  
