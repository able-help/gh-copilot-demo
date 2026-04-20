using System.Text.Json.Serialization;

namespace albums_api.Models
{
    public record Album(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("title")] string Title,
        [property: JsonPropertyName("artist_id")] int Artist_id,
        [property: JsonPropertyName("artist")] Artist Artist,
        [property: JsonPropertyName("price")] double Price,
        [property: JsonPropertyName("image_url")] string Image_url,
        [property: JsonPropertyName("release_date")] DateOnly? Release_date,
        [property: JsonPropertyName("created_at")] DateTime Created_at)
    {
        private sealed record AlbumRecord(int Id, string Title, int Artist_id, double Price, string Image_url, DateOnly? Release_date, DateTime Created_at);

        private static readonly object SyncLock = new();
        private static readonly List<AlbumRecord> Albums =
        [
            new AlbumRecord(1, "You, Me and an App Id", 1, 10.99, "https://aka.ms/albums-daprlogo", new DateOnly(2026, 1, 12), new DateTime(2026, 1, 13, 0, 0, 0, DateTimeKind.Utc)),
            new AlbumRecord(2, "Seven Revision Army", 2, 13.99, "https://aka.ms/albums-containerappslogo", new DateOnly(2025, 2, 14), new DateTime(2025, 2, 15, 0, 0, 0, DateTimeKind.Utc)),
            new AlbumRecord(3, "Scale It Up", 3, 13.99, "https://aka.ms/albums-kedalogo", new DateOnly(2024, 3, 18), new DateTime(2024, 3, 19, 0, 0, 0, DateTimeKind.Utc)),
            new AlbumRecord(4, "Lost in Translation", 4, 12.99, "https://aka.ms/albums-envoylogo", new DateOnly(2023, 4, 9), new DateTime(2023, 4, 10, 0, 0, 0, DateTimeKind.Utc)),
            new AlbumRecord(5, "Lock Down Your Love", 5, 12.99, "https://aka.ms/albums-vnetlogo", new DateOnly(2022, 5, 6), new DateTime(2022, 5, 7, 0, 0, 0, DateTimeKind.Utc)),
            new AlbumRecord(6, "Sweet Container O' Mine", 6, 14.99, "https://aka.ms/albums-containerappslogo", new DateOnly(2021, 6, 11), new DateTime(2021, 6, 12, 0, 0, 0, DateTimeKind.Utc))
        ];

        [JsonPropertyName("year")]
        public int? Year => Release_date?.Year;

        private static Album JoinAlbum(AlbumRecord album)
        {
            var artist = Artist.GetById(album.Artist_id);
            if (artist is null)
            {
                throw new InvalidOperationException($"Album {album.Id} references missing artist {album.Artist_id}.");
            }

            return new Album(album.Id, album.Title, album.Artist_id, artist, album.Price, album.Image_url, album.Release_date, album.Created_at);
        }

        public static List<Album> GetAll()
        {
            lock (SyncLock)
            {
                return Albums.Select(JoinAlbum).ToList();
            }
        }

        public static Album? GetById(int id)
        {
            lock (SyncLock)
            {
                var album = Albums.FirstOrDefault(a => a.Id == id);
                return album is null ? null : JoinAlbum(album);
            }
        }

        public static List<Album> SearchByYear(int year)
        {
            lock (SyncLock)
            {
                return Albums.Where(a => a.Release_date?.Year == year).Select(JoinAlbum).ToList();
            }
        }

        public static Album Create(string title, int artistId, DateOnly? releaseDate, double price, string imageUrl)
        {
            lock (SyncLock)
            {
                var nextId = Albums.Count == 0 ? 1 : Albums.Max(a => a.Id) + 1;
                var newAlbum = new AlbumRecord(nextId, title, artistId, price, imageUrl, releaseDate, DateTime.UtcNow);
                Albums.Add(newAlbum);
                return JoinAlbum(newAlbum);
            }
        }

        public static Album? Update(int id, string title, int artistId, DateOnly? releaseDate, double price, string imageUrl)
        {
            lock (SyncLock)
            {
                var index = Albums.FindIndex(a => a.Id == id);
                if (index == -1)
                {
                    return null;
                }

                var updatedAlbum = new AlbumRecord(id, title, artistId, price, imageUrl, releaseDate, Albums[index].Created_at);
                Albums[index] = updatedAlbum;
                return JoinAlbum(updatedAlbum);
            }
        }

        public static bool Delete(int id)
        {
            lock (SyncLock)
            {
                var album = Albums.FirstOrDefault(a => a.Id == id);
                if (album is null)
                {
                    return false;
                }

                Albums.Remove(album);
                return true;
            }
        }
    }
}
