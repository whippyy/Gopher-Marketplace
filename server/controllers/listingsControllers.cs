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
}