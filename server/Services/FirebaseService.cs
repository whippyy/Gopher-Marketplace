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
                var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
                if (string.IsNullOrEmpty(serviceAccountPath))
                {
                    throw new InvalidOperationException("Firebase service account path not configured");
                }

                FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromFile(serviceAccountPath)
                });
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