using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;

namespace GopherMarketplace.Services
{
    public interface IFirebaseService
    {
        Task<string?> GetUserEmailAsync(string idToken);
        Task<bool> ValidateTokenAsync(string idToken);
    }

    public class FirebaseService : IFirebaseService
    {
        private readonly FirebaseAuth _firebaseAuth;

        public FirebaseService(IConfiguration configuration)
        {
            // Initialize Firebase Admin SDK if not already initialized
            if (FirebaseApp.DefaultInstance == null)
            {
                // Production: Use environment variable with JSON content for services like Render/Vercel/Azure
                var firebaseCredentialsJson = configuration["Firebase:CredentialsJson"];
                if (!string.IsNullOrEmpty(firebaseCredentialsJson))
                {
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromJson(firebaseCredentialsJson)
                    });
                }
                // Development: Fallback to service account file path for local development
                else
                {
                    var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
                    if (string.IsNullOrEmpty(serviceAccountPath))
                    {
                        throw new InvalidOperationException("Firebase credentials not configured. Set either Firebase:CredentialsJson (for production) or Firebase:ServiceAccountPath (for development).");
                    }

                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile(serviceAccountPath)
                    });
                }
            }

            _firebaseAuth = FirebaseAuth.DefaultInstance;
        }

        public async Task<string?> GetUserEmailAsync(string idToken)
        {
            try
            {
                var decodedToken = await _firebaseAuth.VerifyIdTokenAsync(idToken);
                return decodedToken.Claims.GetValueOrDefault("email")?.ToString();
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> ValidateTokenAsync(string idToken)
        {
            try
            {
                await _firebaseAuth.VerifyIdTokenAsync(idToken);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
} 
