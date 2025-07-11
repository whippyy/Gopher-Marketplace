using GopherMarketplace.Services;

namespace GopherMarketplace.Middleware
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IFirebaseService _firebaseService;

        public FirebaseAuthMiddleware(RequestDelegate next, IFirebaseService firebaseService)
        {
            _next = next;
            _firebaseService = firebaseService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length);
                
                try
                {
                    var email = await _firebaseService.GetUserEmailAsync(token);
                    if (email != null)
                    {
                        // Add the email to the request context
                        context.Items["UserEmail"] = email;
                        
                        // Also set it in User.Identity.Name for compatibility
                        var claims = new List<System.Security.Claims.Claim>
                        {
                            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, email)
                        };
                        var identity = new System.Security.Claims.ClaimsIdentity(claims, "Firebase");
                        context.User = new System.Security.Claims.ClaimsPrincipal(identity);
                    }
                }
                catch (Exception)
                {
                    // Token validation failed, continue without authentication
                }
            }

            await _next(context);
        }
    }

    public static class FirebaseAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseFirebaseAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<FirebaseAuthMiddleware>();
        }
    }
} 