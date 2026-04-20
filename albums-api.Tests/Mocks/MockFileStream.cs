namespace albums_api.Tests.Mocks;

public sealed class MockFileStream : FileStream
{
    private readonly byte[] _payload;
    private int _position;

    public MockFileStream(byte[] payload)
        : base(CreateTempFile(), FileMode.Open, FileAccess.Read, FileShare.ReadWrite, 4096, FileOptions.DeleteOnClose)
    {
        _payload = payload;
        _position = 0;
    }

    public override int Read(byte[] array, int offset, int count)
    {
        var remaining = _payload.Length - _position;
        if (remaining <= 0)
        {
            return 0;
        }

        var toCopy = Math.Min(count, remaining);
        Array.Copy(_payload, _position, array, offset, toCopy);
        _position += toCopy;
        return toCopy;
    }

    public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
    {
        return Task.FromResult(Read(buffer, offset, count));
    }

    public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
    {
        var remaining = _payload.Length - _position;
        if (remaining <= 0)
        {
            return ValueTask.FromResult(0);
        }

        var toCopy = Math.Min(buffer.Length, remaining);
        _payload.AsMemory(_position, toCopy).CopyTo(buffer);
        _position += toCopy;
        return ValueTask.FromResult(toCopy);
    }

    private static string CreateTempFile()
    {
        return Path.GetTempFileName();
    }
}
