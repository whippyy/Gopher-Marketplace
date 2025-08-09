using Microsoft.AspNetCore.Mvc;
using GopherMarketplace.Data;
using GopherMarketplace.Models;
using GopherMarketplace.Services;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace GopherMarketplace.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IFirebaseStorageService _storageService;

    public ListingsController(AppDbContext db, IFirebaseStorageService storageService)
    {
        _db = db;
        _storageService = storageService;
    }

    // GET: api/listings
    [HttpGet]
    public ActionResult<List<Listing>> GetListings()
    {
        return _db.Listings.OrderByDescending(l => l.CreatedAt).ToList();
    }

    // POST: api/listings
    [HttpPost]
    public async Task<ActionResult<Listing>> CreateListing([FromForm] string? listingData, [FromForm] List<IFormFile>? images)
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

        // 2. Deserialize listing data
        if (string.IsNullOrEmpty(listingData))
        {
            return BadRequest("Listing data is required.");
        }

        ListingDto newListing;
        try
        {
            newListing = System.Text.Json.JsonSerializer.Deserialize<ListingDto>(listingData)
                ?? throw new InvalidOperationException("Invalid listing data format.");
        }
        catch (Exception)
        {
            return BadRequest("Invalid listing data format.");
        }

        // 3. Validate price
        if (newListing.Price <= 0)
        {
            return BadRequest("Price must be greater than $0.");
        }

        // 4. Validate title
        if (string.IsNullOrWhiteSpace(newListing.Title))
        {
            return BadRequest("Title is required.");
        }

        // 5. Process images if provided
        var imageUrls = new List<string>();
        if (images != null && images.Count > 0)
        {
            foreach (var image in images.Take(5)) // Limit to 5 images
            {
                if (image.Length > 0)
                {
                    try
                    {
                        var imageUrl = await _storageService.UploadImageAsync(image.OpenReadStream(), image.FileName, userEmail);
                        imageUrls.Add(imageUrl);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest($"Failed to upload image {image.FileName}: {ex.Message}");
                    }
                }
            }
        }

        // 6. Create the listing
        var listing = new Listing
        {
            Title = newListing.Title.Trim(),
            Description = newListing.Description?.Trim(),
            Price = newListing.Price,
            ContactEmail = userEmail,
            CreatedAt = DateTime.UtcNow,
            OwnerId = userEmail,
            ImageUrls = imageUrls
        };

        _db.Listings.Add(listing);
        _db.SaveChanges();
        
        // 7. Return 201 Created with the new listing
        return CreatedAtAction(
            actionName: nameof(GetListings),
            value: listing);
    }

    // PATCH: api/listings/{id}
    [HttpPatch("{id}")]
    public async Task<ActionResult<Listing>> UpdateListing(int id, [FromForm] string? listingData, [FromForm] List<IFormFile>? newImages, [FromForm] List<string>? deleteImageUrls)
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

        // Deserialize listing data if provided
        if (!string.IsNullOrEmpty(listingData))
        {
            try
            {
                var updateDto = System.Text.Json.JsonSerializer.Deserialize<ListingDto>(listingData);
                if (updateDto != null)
                {
                    // Apply updates (only modify provided fields)
                    if (!string.IsNullOrWhiteSpace(updateDto.Title))
                        listing.Title = updateDto.Title.Trim();

                    if (updateDto.Description != null)
                        listing.Description = updateDto.Description.Trim();

                    if (updateDto.Price > 0)
                        listing.Price = updateDto.Price;

                    if (updateDto.ImageUrls != null)
                        listing.ImageUrls = updateDto.ImageUrls;
                }
            }
            catch (Exception)
            {
                return BadRequest("Invalid listing data format.");
            }
        }

        // Process new images if provided
        if (newImages != null && newImages.Count > 0)
        {
            foreach (var image in newImages.Take(5)) // Limit to 5 images
            {
                if (image.Length > 0)
                {
                    try
                    {
                        var imageUrl = await _storageService.UploadImageAsync(image.OpenReadStream(), image.FileName, userEmail);
                        listing.ImageUrls.Add(imageUrl);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest($"Failed to upload image {image.FileName}: {ex.Message}");
                    }
                }
            }
        }

        // Delete images if requested
        if (deleteImageUrls != null && deleteImageUrls.Count > 0)
        {
            foreach (var imageUrl in deleteImageUrls)
            {
                if (listing.ImageUrls.Contains(imageUrl))
                {
                    try
                    {
                        await _storageService.DeleteImageAsync(imageUrl);
                        listing.ImageUrls.Remove(imageUrl);
                    }
                    catch (Exception ex)
                    {
                        // Log the error but continue with other deletions
                        Console.WriteLine($"Failed to delete image {imageUrl}: {ex.Message}");
                    }
                }
            }
        }

        _db.SaveChanges();
        return Ok(listing);
    }

    // DELETE: api/listings/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteListing(int id)
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

        // Delete associated images from Firebase Storage
        if (listing.ImageUrls != null && listing.ImageUrls.Count > 0)
        {
            foreach (var imageUrl in listing.ImageUrls)
            {
                try
                {
                    await _storageService.DeleteImageAsync(imageUrl);
                }
                catch (Exception ex)
                {
                    // Log the error but continue with other deletions
                    Console.WriteLine($"Failed to delete image {imageUrl}: {ex.Message}");
                }
            }
        }

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