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
    public ActionResult<Listing> CreateListing([FromBody] ListingDto listingDto)
    {
        if (!listingDto.ContactEmail.EndsWith("@umn.edu"))
            return BadRequest("Only UMN emails allowed.");

        var listing = new Listing
        {
            Title = listingDto.Title,
            Description = listingDto.Description,
            Price = listingDto.Price,
            ContactEmail = listingDto.ContactEmail,
            CreatedAt = DateTime.UtcNow
        };

        _db.Listings.Add(listing);
        _db.SaveChanges();

        return CreatedAtAction(nameof(GetListings), listing);
    }
}