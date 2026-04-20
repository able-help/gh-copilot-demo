namespace albums_api.Models
{
    public record Album(int Id, string Title, Artist Artist, int Year, double Price, string Image_url)
    {
        private static readonly object SyncLock = new();
        private static readonly List<Album> Albums =
        [
            new Album(1, "You, Me and an App Id", new Artist("Daprize", new DateOnly(1998, 4, 12), "Seattle, USA"), 2026, 10.99, "https://aka.ms/albums-daprlogo"),
            new Album(2, "Seven Revision Army", new Artist("The Blue-Green Stripes", new DateOnly(1996, 9, 8), "Austin, USA"), 2025, 13.99, "https://aka.ms/albums-containerappslogo"),
            new Album(3, "Scale It Up", new Artist("KEDA Club", new DateOnly(1994, 1, 21), "London, UK"), 2024, 13.99, "https://aka.ms/albums-kedalogo"),
            new Album(4, "Lost in Translation", new Artist("MegaDNS", new DateOnly(1992, 7, 17), "Dublin, Ireland"), 2023, 12.99, "https://aka.ms/albums-envoylogo"),
            new Album(5, "Lock Down Your Love", new Artist("V is for VNET", new DateOnly(1990, 3, 2), "Toronto, Canada"), 2022, 12.99, "https://aka.ms/albums-vnetlogo"),
            new Album(6, "Sweet Container O' Mine", new Artist("Guns N Probeses", new DateOnly(1989, 11, 30), "Berlin, Germany"), 2021, 14.99, "https://aka.ms/albums-containerappslogo")
        ];

        public static List<Album> GetAll()
        {
            lock (SyncLock)
            {
                return [.. Albums];
            }
        }

        public static Album? GetById(int id)
        {
            lock (SyncLock)
            {
                return Albums.FirstOrDefault(a => a.Id == id);
            }
        }

        public static List<Album> SearchByYear(int year)
        {
            lock (SyncLock)
            {
                return Albums.Where(a => a.Year == year).ToList();
            }
        }

        public static Album Create(string title, Artist artist, int year, double price, string imageUrl)
        {
            lock (SyncLock)
            {
                var nextId = Albums.Count == 0 ? 1 : Albums.Max(a => a.Id) + 1;
                var newAlbum = new Album(nextId, title, artist, year, price, imageUrl);
                Albums.Add(newAlbum);
                return newAlbum;
            }
        }

        public static Album? Update(int id, string title, Artist artist, int year, double price, string imageUrl)
        {
            lock (SyncLock)
            {
                var index = Albums.FindIndex(a => a.Id == id);
                if (index == -1)
                {
                    return null;
                }

                var updatedAlbum = new Album(id, title, artist, year, price, imageUrl);
                Albums[index] = updatedAlbum;
                return updatedAlbum;
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
