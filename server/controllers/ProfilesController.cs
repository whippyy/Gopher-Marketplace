using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.data;
using server.models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace server.controllers
{
    [ApiController]
    [Route("api/profiles")]
    [Authorize]
    public class ProfilesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProfilesController(AppDbContext db) => _db = db;

        [HttpGet("me")]
        public async Task<ActionResult<UserProfile>> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var profile = await _db.UserProfiles.FindAsync(userId);
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        [HttpPut("me")]
        public async Task<ActionResult<UserProfile>> UpdateProfile([FromBody] UserProfile update)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var profile = await _db.UserProfiles.FindAsync(userId);
            if (profile == null) return NotFound();
            profile.DisplayName = update.DisplayName?.Trim();
            profile.PhoneNumber = update.PhoneNumber?.Trim();
            await _db.SaveChangesAsync();
            return Ok(profile);
        }

        [HttpPost("me")]
        public async Task<ActionResult<UserProfile>> CreateProfile([FromBody] UserProfile newProfile)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();
            var exists = await _db.UserProfiles.FindAsync(userId);
            if (exists != null) return Conflict();
            var profile = new UserProfile
            {
                Id = userId,
                Email = newProfile.Email,
                DisplayName = newProfile.DisplayName,
                PhoneNumber = newProfile.PhoneNumber
            };
            _db.UserProfiles.Add(profile);
            await _db.SaveChangesAsync();
            return Ok(profile);
        }
    }
} 