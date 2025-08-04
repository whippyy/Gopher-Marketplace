# Firebase Admin SDK Setup

## Backend Setup Complete ✅

The backend has been configured with Firebase Admin SDK authentication. Here's what was implemented:

### What's Done:
1. ✅ Added Firebase Admin SDK package
2. ✅ Created FirebaseService for token verification
3. ✅ Created FirebaseAuthMiddleware to extract user email
4. ✅ Updated Program.cs to use Firebase authentication
5. ✅ Updated controllers to use authenticated user email
6. ✅ Added `/api/listings/my` endpoint for user's listings
7. ✅ Removed old JWT configuration

### What You Need to Do:

#### For Local Development

1.  **Download Firebase Service Account JSON:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2.  **Place the JSON file:**
   - Save the downloaded JSON file as `firebase-service-account.json`
   - Place it in the `server/` directory (same level as `Program.cs`)
    - The path is already configured in `appsettings.Development.json`.

#### For Production (Render, Vercel, Azure, etc.)

Instead of using a file, we will use an environment variable to securely store the credentials.

1.  Go to your hosting provider's dashboard (e.g., Render).
2.  Navigate to the **Environment** settings for your backend service.
3.  Add a new **Environment Variable** (do NOT use a "Secret File").
    -   **Key**: `Firebase__CredentialsJson` (the double underscore `__` is important as it maps to the nested JSON structure in .NET).
    -   **Value**: Open your downloaded `firebase-service-account.json` file, copy its **entire content**, and paste it into the value field.

### How It Works:
- Frontend sends Firebase ID tokens in `Authorization: Bearer <token>` headers
- The backend first tries to load credentials from the `Firebase__CredentialsJson` environment variable. If that's not found, it falls back to using the local `firebase-service-account.json` file for development.
- User email is extracted and used for ownership checks
- All listing operations now require authentication
- User can only edit/delete their own listings

### Next Steps:
Once you have the service account JSON file in place, the backend will be ready. Then we'll update the frontend to send ID tokens with API requests. 