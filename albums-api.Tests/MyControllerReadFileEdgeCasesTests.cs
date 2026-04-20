using UnsecureApp.Controllers;
using Xunit;
using albums_api.Tests.Mocks;
using System.Text;

namespace albums_api.Tests;

public class MyControllerReadFileEdgeCasesTests
{
    private static string AllowedBaseDirectory => Path.GetFullPath(Directory.GetCurrentDirectory());

    [Fact]
    public void ReadFile_WhenFileIsEmpty_ReturnsNull()
    {
        var controller = new MyController(
            fileStreamFactory: _ => new MockFileStream(Array.Empty<byte>()),
            allowedBaseDirectory: AllowedBaseDirectory);

        var result = controller.ReadFile(Path.Combine(AllowedBaseDirectory, "ignored-by-mock.txt"));

        Assert.Null(result);
    }

    [Fact]
    public void ReadFile_WhenFileIsLargerThanBuffer_ReturnsFirstBufferChunk()
    {
        var largeContent = new string('A', 2048);
        var controller = new MyController(
            fileStreamFactory: _ => new MockFileStream(Encoding.UTF8.GetBytes(largeContent)),
            allowedBaseDirectory: AllowedBaseDirectory);

        var result = controller.ReadFile(Path.Combine(AllowedBaseDirectory, "ignored-by-mock-large.txt"));

        Assert.NotNull(result);
        Assert.Equal(1024, result.Length);
        Assert.Equal(new string('A', 1024), result);
    }

    [Fact]
    public void ReadFile_WhenPathHasInvalidCharacters_ThrowsArgumentException()
    {
        var controller = new MyController(
            fileStreamFactory: _ => throw new ArgumentException("Invalid path."),
            allowedBaseDirectory: AllowedBaseDirectory);

        Assert.ThrowsAny<ArgumentException>(() => controller.ReadFile("bad\0path.txt"));
    }
}
