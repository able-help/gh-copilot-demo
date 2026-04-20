using albums_api.Controllers;
using albums_api.Models;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace albums_api.Swagger
{
    public class AlbumApiSchemaExamples : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(AlbumController.AlbumRequest))
            {
                schema.Example = new OpenApiObject
                {
                    ["title"] = new OpenApiString("Deployment Daydreams"),
                    ["artist_id"] = new OpenApiInteger(2),
                    ["release_date"] = new OpenApiString("2030-07-01"),
                    ["price"] = new OpenApiDouble(19.99),
                    ["image_url"] = new OpenApiString("https://example.com/deployment-daydreams.png")
                };
                return;
            }

            if (context.Type == typeof(Artist))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiInteger(2),
                    ["name"] = new OpenApiString("The Blue-Green Stripes"),
                    ["genre"] = new OpenApiString("Deployment Rock"),
                    ["created_at"] = new OpenApiString("2024-02-15T00:00:00Z")
                };
                return;
            }

            if (context.Type == typeof(Album))
            {
                schema.Example = new OpenApiObject
                {
                    ["id"] = new OpenApiInteger(2),
                    ["title"] = new OpenApiString("Seven Revision Army"),
                    ["artist_id"] = new OpenApiInteger(2),
                    ["artist"] = new OpenApiObject
                    {
                        ["id"] = new OpenApiInteger(2),
                        ["name"] = new OpenApiString("The Blue-Green Stripes"),
                        ["genre"] = new OpenApiString("Deployment Rock"),
                        ["created_at"] = new OpenApiString("2024-02-15T00:00:00Z")
                    },
                    ["price"] = new OpenApiDouble(13.99),
                    ["image_url"] = new OpenApiString("https://aka.ms/albums-containerappslogo"),
                    ["release_date"] = new OpenApiString("2025-02-14"),
                    ["created_at"] = new OpenApiString("2025-02-15T00:00:00Z"),
                    ["year"] = new OpenApiInteger(2025)
                };
            }
        }
    }
}