namespace GopherMarketplace.Models;

public class ListingDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public required string ContactEmail { get; set; }
}