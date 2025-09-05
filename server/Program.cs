using Microsoft.EntityFrameworkCore;
using GopherMarketplace.Data;
using GopherMarketplace.Models;
using AspNetCoreRateLimit;
using GopherMarketplace.Services;
using GopherMarketplace.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Read allowed origins from configuration for CORS
var allowedOrigins = builder.Configuration.GetValue<string>("Cors:AllowedOrigins")?.Split(',') 
    ?? new[] { "http://localhost:3000", "http://localhost:3001" };

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://gophermarketplace-frontend.onrender.com",
            "http://localhost:3000",
            "http://localhost:3001"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Add application services from the extension method
builder.Services.AddGopherMarketplaceServices(builder.Configuration);

builder.Services.AddControllers();
var app = builder.Build();

// Initialize DB (creates DB if it doesn't exist)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Seed sample listings if DB is empty
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Listings.Any())
    {
        db.Listings.AddRange(new List<Listing>
        {
            new() { Title = "Calculus Textbook", Price = 25.99m, ContactEmail = "user1@umn.edu", OwnerId = "seed-user1" },
            new() { Title = "Bike", Price = 120.50m, ContactEmail = "user2@umn.edu", OwnerId = "seed-user2" },
            new() { Title = "Coffee Table", Price = 45.00m, ContactEmail = "user3@umn.edu", OwnerId = "seed-user3" },
            new() { Title = "Laptop Stand", Price = 15.99m, ContactEmail = "user4@umn.edu", OwnerId = "seed-user4" },
            new() { Title = "Desk Chair", Price = 75.00m, ContactEmail = "user5@umn.edu", OwnerId = "seed-user5" }
        });
        db.SaveChanges();
    }
}

// Apply the named CORS policy globally (MUST be before auth middlewares)
app.UseCors("AllowFrontend");

// Use custom middleware
app.UseGopherMarketplaceMiddleware();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();