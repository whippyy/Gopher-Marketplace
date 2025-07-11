using Microsoft.EntityFrameworkCore;
using GopherMarketplace.Data;
using GopherMarketplace.Models;
using AspNetCoreRateLimit;
using GopherMarketplace.Services;
using GopherMarketplace.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure rate limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<AspNetCoreRateLimit.IProcessingStrategy, AspNetCoreRateLimit.AsyncKeyLockProcessingStrategy>();

// Add SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Firebase service
builder.Services.AddScoped<IFirebaseService, FirebaseService>();

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
            new() { Title = "Calculus Textbook", Price = 25.99m, ContactEmail = "user1@umn.edu", OwnerId = "seed-user1" },
            new() { Title = "Bike", Price = 120.50m, ContactEmail = "user2@umn.edu", OwnerId = "seed-user2" },
            new() { Title = "Coffee Table", Price = 45.00m, ContactEmail = "user3@umn.edu", OwnerId = "seed-user3" },
            new() { Title = "Laptop Stand", Price = 15.99m, ContactEmail = "user4@umn.edu", OwnerId = "seed-user4" },
            new() { Title = "Desk Chair", Price = 75.00m, ContactEmail = "user5@umn.edu", OwnerId = "seed-user5" }
        });
        db.SaveChanges();
    }
}

app.UseCors("AllowFrontend");
app.UseIpRateLimiting();
app.UseFirebaseAuth();
app.UseAuthentication();
app.UseAuthorization();
app.Run();