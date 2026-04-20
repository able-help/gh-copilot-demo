namespace albums_api.Models
{
    public record MusicStyle(int Id, string Name)
    {
        private static readonly object SyncLock = new();
        private static readonly List<MusicStyle> MusicStyles =
        [
            new MusicStyle(1, "Rock"),
            new MusicStyle(2, "Jazz"),
            new MusicStyle(3, "Hip-Hop"),
            new MusicStyle(4, "Electronic"),
            new MusicStyle(5, "Classical"),
            new MusicStyle(6, "Pop")
        ];

        public static List<MusicStyle> GetAll()
        {
            lock (SyncLock)
            {
                return [.. MusicStyles];
            }
        }
    }
}