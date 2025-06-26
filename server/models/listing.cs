namespace GopherMarketplace.Models;

public class Listing
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public required string ContactEmail { get; set; }  // Will validate @umn.edu later
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}