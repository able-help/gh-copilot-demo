using System.Text.Json.Serialization;

namespace albums_api.Models
{
    public record Artist(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("genre")] string? Genre,
        [property: JsonPropertyName("created_at")] DateTime Created_at)
    {
        private static readonly object SyncLock = new();
        private static readonly List<Artist> Artists =
        [
            new Artist(1, "Daprize", "Cloud Native Pop", new DateTime(2024, 1, 12, 0, 0, 0, DateTimeKind.Utc)),
            new Artist(2, "The Blue-Green Stripes", "Deployment Rock", new DateTime(2024, 2, 15, 0, 0, 0, DateTimeKind.Utc)),
            new Artist(3, "KEDA Club", "Autoscaling Electronica", new DateTime(2024, 3, 20, 0, 0, 0, DateTimeKind.Utc)),
            new Artist(4, "MegaDNS", "Distributed Ambient", new DateTime(2024, 4, 18, 0, 0, 0, DateTimeKind.Utc)),
            new Artist(5, "V is for VNET", "Network Ballads", new DateTime(2024, 5, 10, 0, 0, 0, DateTimeKind.Utc)),
            new Artist(6, "Guns N Probeses", "Container Metal", new DateTime(2024, 6, 5, 0, 0, 0, DateTimeKind.Utc))
        ];

        public static List<Artist> GetAll()
        {
            lock (SyncLock)
            {
                return [.. Artists];
            }
        }

        public static Artist? GetById(int id)
        {
            lock (SyncLock)
            {
                return Artists.FirstOrDefault(artist => artist.Id == id);
            }
        }

        public static bool Exists(int id)
        {
            lock (SyncLock)
            {
                return Artists.Any(artist => artist.Id == id);
            }
        }
    }
}