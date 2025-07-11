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

1. **Download Firebase Service Account JSON:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Place the JSON file:**
   - Save the downloaded JSON file as `firebase-service-account.json`
   - Place it in the `server/` directory (same level as `Program.cs`)

3. **Update appsettings.json (if needed):**
   - The path is already configured as `"firebase-service-account.json"`
   - If you use a different filename, update the `ServiceAccountPath` in `appsettings.json`

### How It Works:
- Frontend sends Firebase ID tokens in `Authorization: Bearer <token>` headers
- Backend verifies tokens using Firebase Admin SDK
- User email is extracted and used for ownership checks
- All listing operations now require authentication
- User can only edit/delete their own listings

### Next Steps:
Once you have the service account JSON file in place, the backend will be ready. Then we'll update the frontend to send ID tokens with API requests. 