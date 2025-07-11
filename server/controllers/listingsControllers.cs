using Microsoft.AspNetCore.Mvc;
using GopherMarketplace.Data;
using GopherMarketplace.Models;

namespace GopherMarketplace.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ListingsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/listings
    [HttpGet]
    public ActionResult<List<Listing>> GetListings()
    {
        return _db.Listings.OrderByDescending(l => l.CreatedAt).ToList();
    }

    // POST: api/listings
    [HttpPost]
    public ActionResult<Listing> CreateListing([FromBody] ListingDto newListing)
    {
        // Get authenticated user email from middleware
        var userEmail = HttpContext.Items["UserEmail"]?.ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized("Authentication required");
        }

        // 1. Validate UMN email
        if (!userEmail.EndsWith("@umn.edu", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only @umn.edu emails are allowed.");
        }

        // 2. Validate price
        if (newListing.Price <= 0)
        {
            return BadRequest("Price must be greater than $0.");
        }

        // 3. Validate title
        if (string.IsNullOrWhiteSpace(newListing.Title))
        {
            return BadRequest("Title is required.");
        }

        // 4. Create the listing
        var listing = new Listing
        {
            Title = newListing.Title.Trim(),
            Description = newListing.Description?.Trim(),
            Price = newListing.Price,
            ContactEmail = userEmail,
            CreatedAt = DateTime.UtcNow,
            OwnerId = userEmail
        };

        _db.Listings.Add(listing);
        _db.SaveChanges();
        
        // 5. Return 201 Created with the new listing
        return CreatedAtAction(
            actionName: nameof(GetListings),
            value: listing);
    }

    // PATCH: api/listings/{id}
    [HttpPatch("{id}")]
    public ActionResult<Listing> UpdateListing(int id, [FromBody] ListingDto updateDto)
    {
        // Get authenticated user email from middleware
        var userEmail = HttpContext.Items["UserEmail"]?.ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized("Authentication required");
        }

        // Find the listing
        var listing = _db.Listings.Find(id);
        if (listing == null)
        {
            return NotFound();
        }

        // Verify ownership
        if (!string.Equals(listing.OwnerId, userEmail, StringComparison.OrdinalIgnoreCase))
            return Forbid(); // HTTP 403

        // Apply updates (only modify provided fields)
        if (!string.IsNullOrWhiteSpace(updateDto.Title))
            listing.Title = updateDto.Title.Trim();

        if (updateDto.Description != null)
            listing.Description = updateDto.Description.Trim();

        if (updateDto.Price > 0)
            listing.Price = updateDto.Price;

        _db.SaveChanges();
        return Ok(listing);
    }

    // DELETE: api/listings/{id}
    [HttpDelete("{id}")]
    public IActionResult DeleteListing(int id)
    {
        // Get authenticated user email from middleware
        var userEmail = HttpContext.Items["UserEmail"]?.ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized("Authentication required");
        }

        var listing = _db.Listings.Find(id);
        if (listing == null)
        {
            return NotFound();
        }

        // Verify ownership
        if (!string.Equals(listing.OwnerId, userEmail, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        _db.Listings.Remove(listing);
        _db.SaveChanges();
        return NoContent(); // HTTP 204
    }
    
    // GET: api/listings/{id}
    [HttpGet("{id}")]
    public ActionResult<Listing> GetListing(int id)
    {
        var listing = _db.Listings.Find(id);
        return listing != null ? Ok(listing) : NotFound();
    }

    // GET: api/listings/my
    [HttpGet("my")]
    public ActionResult<List<Listing>> GetMyListings()
    {
        // Get authenticated user email from middleware
        var userEmail = HttpContext.Items["UserEmail"]?.ToString();
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized("Authentication required");
        }

        var listings = _db.Listings
            .Where(l => l.OwnerId == userEmail)
            .OrderByDescending(l => l.CreatedAt)
            .ToList();

        return Ok(listings);
    }
}