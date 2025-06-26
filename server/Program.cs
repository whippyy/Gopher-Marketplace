using Microsoft.EntityFrameworkCore;
using GopherMarketplace.Data;
using GopherMarketplace.Models;

var builder = WebApplication.CreateBuilder(args);

// Add SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
var app = builder.Build();

// Initialize DB (creates DB if it doesn't exist)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.MapControllers();

// Seed sample listings if DB is empty
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Listings.Any())
    {
        db.Listings.AddRange(new List<Listing>
        {
            new() { Title = "Calculus Textbook", Price = 25.99m, ContactEmail = "user1@umn.edu" },
            new() { Title = "Bike", Price = 120.50m, ContactEmail = "user2@umn.edu" }
        });
        db.SaveChanges();
    }
}

app.Run();