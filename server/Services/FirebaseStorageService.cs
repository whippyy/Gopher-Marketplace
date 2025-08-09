using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Google.Cloud.Storage.V1;
using System.IO;

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
        private readonly StorageClient _storage;

        public FirebaseStorageService(IConfiguration configuration)
        {
            // Get the storage bucket from configuration
            _storageBucket = configuration["Firebase:StorageBucket"] ??
                throw new InvalidOperationException("Firebase Storage Bucket not configured. Set Firebase:StorageBucket in configuration.");

            // Initialize Google Cloud Storage client
            var firebaseApp = FirebaseApp.DefaultInstance ??
                throw new InvalidOperationException("Firebase Admin SDK not initialized. Initialize FirebaseService first.");

            _storage = StorageClient.Create();
        }

        public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string userId)
        {
            try
            {
                // Create a unique file name to prevent conflicts
                var uniqueFileName = $"{userId}/{Guid.NewGuid()}_{fileName}";

                // Set the object name in Firebase Storage
                var storageObjectName = $"listings/{uniqueFileName}";

                // Upload the file to Firebase Storage
                var storageObject = await _storage.UploadObjectAsync(
                    _storageBucket,
                    storageObjectName,
                    null, // auto-detect content type
                    imageStream);

                // Return the public URL for the uploaded image
                return $"https://firebasestorage.googleapis.com/v0/b/{_storageBucket}/o/{storageObjectName.Replace("/", "%2F")}?alt=media";
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

                    await _storage.DeleteObjectAsync(_storageBucket, filePath);
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