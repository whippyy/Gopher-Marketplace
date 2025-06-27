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
        // 1. Validate UMN email
        if (!newListing.ContactEmail.EndsWith("@umn.edu", StringComparison.OrdinalIgnoreCase))
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
            ContactEmail = newListing.ContactEmail.Trim().ToLower(),
            CreatedAt = DateTime.UtcNow
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
        // Find the listing
        var listing = _db.Listings.Find(id);
        if (listing == null)
        {
            return NotFound();
        }

        // Validate UMN email if provided
        if (!string.IsNullOrEmpty(updateDto.ContactEmail) && 
            !updateDto.ContactEmail.EndsWith("@umn.edu", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only @umn.edu emails allowed.");
        }

        // Apply updates (only modify provided fields)
        if (!string.IsNullOrWhiteSpace(updateDto.Title))
            listing.Title = updateDto.Title.Trim();

        if (updateDto.Description != null)
            listing.Description = updateDto.Description.Trim();

        if (updateDto.Price > 0)
            listing.Price = updateDto.Price;

        if (!string.IsNullOrEmpty(updateDto.ContactEmail))
            listing.ContactEmail = updateDto.ContactEmail.Trim().ToLower();

        _db.SaveChanges();
        return Ok(listing);
    }

    // DELETE: api/listings/{id}
    [HttpDelete("{id}")]
    public IActionResult DeleteListing(int id)
    {
        var listing = _db.Listings.Find(id);
        if (listing == null)
        {
            return NotFound();
        }

        _db.Listings.Remove(listing);
        _db.SaveChanges();
        return NoContent(); // HTTP 204
    }
}