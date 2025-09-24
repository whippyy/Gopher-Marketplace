using Microsoft.AspNetCore.Mvc;
using GopherMarketplace.Data;
using GopherMarketplace.Models;

namespace GopherMarketplace.Controllers
{
    [ApiController]
    [Route("api/profiles")]
    public class ProfilesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProfilesController(AppDbContext db) => _db = db;

        [HttpGet("me")]
        public async Task<ActionResult<UserProfile>> GetMyProfile()
        {
            var userEmail = HttpContext.Items["UserEmail"] as string;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Authentication required");
            }

            var profile = await _db.UserProfiles.FindAsync(userEmail);
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        [HttpPut("me")]
        public async Task<ActionResult<UserProfile>> UpdateProfile([FromBody] UserProfile update)
        {
            var userEmail = HttpContext.Items["UserEmail"] as string;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Authentication required");
            }

            var profile = await _db.UserProfiles.FindAsync(userEmail);
            if (profile == null) return NotFound();
            profile.DisplayName = update.DisplayName?.Trim();
            profile.PhoneNumber = update.PhoneNumber?.Trim();
            await _db.SaveChangesAsync();
            return Ok(profile);
        }

        [HttpPost("me")]
        public async Task<ActionResult<UserProfile>> CreateProfile([FromBody] UserProfile newProfile)
        {
            var userEmail = HttpContext.Items["UserEmail"] as string;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Authentication required");
            }

            var exists = await _db.UserProfiles.FindAsync(userEmail);
            if (exists != null) return Conflict();
            
            var profile = new UserProfile
            {
                Id = userEmail,
                Email = userEmail,
                DisplayName = newProfile.DisplayName,
                PhoneNumber = newProfile.PhoneNumber
            };
            _db.UserProfiles.Add(profile);
            await _db.SaveChangesAsync();
            return Ok(profile);
        }
    }
} 