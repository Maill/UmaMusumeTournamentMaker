using Microsoft.Extensions.FileProviders;
using System.IO.Compression;

namespace UmaMusumeTournamentMaker.API.Middleware;

public class PrecompressedStaticFileMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<PrecompressedStaticFileMiddleware> _logger;

    public PrecompressedStaticFileMiddleware(
        RequestDelegate next,
        IWebHostEnvironment environment,
        ILogger<PrecompressedStaticFileMiddleware> logger)
    {
        _next = next;
        _environment = environment;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        
        // Only handle static file requests
        if (path?.StartsWith("/") == true && !path.StartsWith("/api/") && !path.StartsWith("/tournamentHub"))
        {
            var acceptEncoding = context.Request.Headers.AcceptEncoding.ToString();
            var wwwrootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
            var requestedFilePath = Path.Combine(wwwrootPath, path.TrimStart('/'));

            // Normalize path separators for cross-platform compatibility
            requestedFilePath = requestedFilePath.Replace('/', Path.DirectorySeparatorChar);

            // Check if the original file exists
            if (File.Exists(requestedFilePath))
            {
                string? compressedFilePath = null;
                string? contentEncoding = null;

                // Check for Brotli compression first (better compression)
                if (acceptEncoding.Contains("br") && File.Exists(requestedFilePath + ".br"))
                {
                    compressedFilePath = requestedFilePath + ".br";
                    contentEncoding = "br";
                }
                // Fallback to Gzip
                else if (acceptEncoding.Contains("gzip") && File.Exists(requestedFilePath + ".gz"))
                {
                    compressedFilePath = requestedFilePath + ".gz";
                    contentEncoding = "gzip";
                }

                // Serve compressed file if available
                if (compressedFilePath != null && contentEncoding != null)
                {
                    _logger.LogDebug("Serving pre-compressed file: {CompressedFile}", compressedFilePath);
                    
                    context.Response.Headers.ContentEncoding = contentEncoding;
                    context.Response.Headers.CacheControl = "public, max-age=86400"; // 1 day
                    
                    // Set appropriate content type
                    var contentType = GetContentType(path);
                    if (!string.IsNullOrEmpty(contentType))
                    {
                        context.Response.ContentType = contentType;
                    }

                    await context.Response.SendFileAsync(compressedFilePath);
                    return;
                }
            }
        }

        // Continue to next middleware if no compressed file was served
        await _next(context);
    }

    private static string GetContentType(string path)
    {
        return Path.GetExtension(path.ToLowerInvariant()) switch
        {
            ".js" => "application/javascript",
            ".css" => "text/css",
            ".html" => "text/html",
            ".json" => "application/json",
            ".svg" => "image/svg+xml",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".ico" => "image/x-icon",
            ".woff" => "font/woff",
            ".woff2" => "font/woff2",
            _ => "application/octet-stream"
        };
    }
}