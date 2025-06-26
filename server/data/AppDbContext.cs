using Microsoft.EntityFrameworkCore;
using GopherMarketplace.Models;

namespace GopherMarketplace.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Listing> Listings => Set<Listing>();
}