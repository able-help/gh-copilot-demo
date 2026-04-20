using UnsecureApp.Controllers;
using Xunit;
using albums_api.Tests.Mocks;
using System.Text;

namespace albums_api.Tests;

public class MyControllerTests
{
    private static string AllowedBaseDirectory => Path.GetFullPath(Directory.GetCurrentDirectory());

    [Fact]
    public void ReadFile_WhenFileExists_ReturnsFileContentPrefix()
    {
        const string expectedContent = "hello-albums";
        var controller = new MyController(
            fileStreamFactory: _ => new MockFileStream(Encoding.UTF8.GetBytes(expectedContent)),
            allowedBaseDirectory: AllowedBaseDirectory);

        var result = controller.ReadFile(Path.Combine(AllowedBaseDirectory, "ignored-by-mock.txt"));

        Assert.NotNull(result);
        Assert.Equal(expectedContent, result);
    }

    [Fact]
    public async Task ReadFileAsync_WhenFileExists_ReturnsFileContentPrefix()
    {
        const string expectedContent = "hello-albums-async";
        var controller = new MyController(
            fileStreamFactory: _ => new MockFileStream(Encoding.UTF8.GetBytes(expectedContent)),
            allowedBaseDirectory: AllowedBaseDirectory);

        var result = await controller.ReadFileAsync(Path.Combine(AllowedBaseDirectory, "ignored-by-mock-async.txt"));

        Assert.NotNull(result);
        Assert.Equal(expectedContent, result);
    }

    [Fact]
    public void ReadFile_WhenFileDoesNotExist_ThrowsFileNotFoundException()
    {
        var controller = new MyController(
            fileStreamFactory: _ => throw new FileNotFoundException("Mocked missing file."),
            allowedBaseDirectory: AllowedBaseDirectory);

        Assert.Throws<FileNotFoundException>(() =>
            controller.ReadFile(Path.Combine(AllowedBaseDirectory, "missing.txt")));
    }

    [Fact]
    public void ReadFile_WhenPathIsOutsideAllowedBase_ThrowsUnauthorizedAccessException()
    {
        var controller = new MyController(
            fileStreamFactory: _ => new MockFileStream(Encoding.UTF8.GetBytes("not-used")),
            allowedBaseDirectory: AllowedBaseDirectory);

        var outsidePath = Path.Combine(Path.GetTempPath(), "outside.txt");

        Assert.Throws<UnauthorizedAccessException>(() => controller.ReadFile(outsidePath));
    }

    [Fact]
    public void GetObject_DoesNotThrow()
    {
        var controller = new MyController();

        var exception = Record.Exception(() => controller.GetObject());

        Assert.Null(exception);
    }

    [Fact]
    public void GetProduct_WhenConnectionIsNotInitialized_ThrowsInvalidOperationException()
    {
        var controller = new MyController();

        Assert.Throws<InvalidOperationException>(() => controller.GetProduct("Sample Product"));
    }

    [Fact]
    public async Task GetProductAsync_WhenConnectionIsNotInitialized_ThrowsInvalidOperationException()
    {
        var controller = new MyController();

        await Assert.ThrowsAsync<InvalidOperationException>(() => controller.GetProductAsync("Sample Product"));
    }
}
