using AspNetCoreRateLimit;
using GopherMarketplace.Data;
using GopherMarketplace.Middleware;
using Microsoft.EntityFrameworkCore;

namespace GopherMarketplace.Services
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddGopherMarketplaceServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure rate limiting
            services.AddMemoryCache();
            services.Configure<IpRateLimitOptions>(configuration.GetSection("IpRateLimiting"));
            services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
            services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
            services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
            services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

            // Add SQLite DbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

            // Add Firebase Authentication service (NOT Storage)
            services.AddSingleton<IFirebaseService, FirebaseService>();

            return services;
        }

        public static IApplicationBuilder UseGopherMarketplaceMiddleware(this IApplicationBuilder app)
        {
            app.UseIpRateLimiting();
            app.UseFirebaseAuth();
            return app;
        }
    }
}
