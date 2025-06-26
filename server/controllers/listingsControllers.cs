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

    [HttpGet]
    public ActionResult<List<Listing>> GetListings()
    {
        return _db.Listings.OrderByDescending(l => l.CreatedAt).ToList();
    }
}