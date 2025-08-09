using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Firebase.Storage;

namespace GopherMarketplace.Services
{
    public interface IFirebaseStorageService
    {
        Task<string> UploadImageAsync(Stream imageStream, string fileName, string userId);
        Task DeleteImageAsync(string imageUrl);
    }

    public class FirebaseStorageService : IFirebaseStorageService
    {
        private readonly string _storageBucket;
        private readonly FirebaseStorage _storage;

        public FirebaseStorageService(IConfiguration configuration)
        {
            // Get the storage bucket from configuration
            _storageBucket = configuration["Firebase:StorageBucket"] ?? 
                throw new InvalidOperationException("Firebase Storage Bucket not configured. Set Firebase:StorageBucket in configuration.");

            // Initialize Firebase Storage client
            var firebaseApp = FirebaseApp.DefaultInstance ?? 
                throw new InvalidOperationException("Firebase Admin SDK not initialized. Initialize FirebaseService first.");

            _storage = new FirebaseStorage(_storageBucket);
        }

        public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string userId)
        {
            try
            {
                // Create a unique file name to prevent conflicts
                var uniqueFileName = $"{userId}/{Guid.NewGuid()}_{fileName}";

                // Upload the file to Firebase Storage
                var imageUrl = await _storage
                    .Child("listings")
                    .Child(uniqueFileName)
                    .PutAsync(imageStream);

                return imageUrl;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to upload image: {ex.Message}", ex);
            }
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            try
            {
                // Extract the file path from the URL
                if (string.IsNullOrEmpty(imageUrl)) return;

                // Remove the base URL to get the file path
                var basePath = $"https://firebasestorage.googleapis.com/v0/b/{_storageBucket}/o/";
                if (imageUrl.StartsWith(basePath))
                {
                    var filePath = Uri.UnescapeDataString(imageUrl.Substring(basePath.Length));
                    
                    // Remove query parameters
                    var queryIndex = filePath.IndexOf('?');
                    if (queryIndex > 0)
                    {
                        filePath = filePath.Substring(0, queryIndex);
                    }

                    await _storage
                        .Child(filePath)
                        .DeleteAsync();
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - deletion failures shouldn't break the app
                Console.WriteLine($"Failed to delete image: {ex.Message}");
            }
        }
    }
}