# 🚀 CrisisChain AI MVP

Intelligent Water Crisis Management powered by Gemini & Firebase.

## 🛠️ Quick Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment (`.env`)**:
   Create a `.env` file in the root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

3. **Firebase Configuration**:
   Update `src/config/firebase.js` with your project credentials from the Firebase Console.

4. **Run Application**:
   ```bash
   npm run dev
   ```

## 🧩 Features
- **Citizen Portal (`/`)**: Quick report with image upload and geolocation. No login required.
- **Admin Console (`/admin`)**: Command center with AI confidence metrics and tanker dispatching.
- **AI-Guard**: Gemini 1.5 Flash validates reports for authenticity and severity.
- **Live Sync**: Real-time updates via Firestore.

---
*Developed for rapid urban crisis response.*
