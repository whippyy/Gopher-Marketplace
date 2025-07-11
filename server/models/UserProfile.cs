using System;

namespace GopherMarketplace.Models
{
    public class UserProfile
    {
        public string Id { get; set; } // Firebase UID
        public required string Email { get; set; }
        public string? DisplayName { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 