using Microsoft.EntityFrameworkCore;
using GopherMarketplace.Models;
using server.models;

namespace GopherMarketplace.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
}