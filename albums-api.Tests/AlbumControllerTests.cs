using albums_api.Controllers;
using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace albums_api.Tests;

public class AlbumControllerTests
{
    private static AlbumController.AlbumRequest ValidRequest() =>
        new(
            $"Valid Album {Guid.NewGuid()}",
            2,
            new DateOnly(2030, 7, 1),
            19.99,
            "https://example.com/cover.png");

    [Fact]
    public void GetSorted_WhenSortByIsInvalid_ReturnsBadRequest()
    {
        var controller = new AlbumController();

        var result = controller.GetSorted("invalid-field", "asc");

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Invalid sortBy value. Use: title, artist, or price.", badRequest.Value);
    }

    [Fact]
    public void GetSorted_WhenOrderIsDesc_SortsByPriceDescending()
    {
        var controller = new AlbumController();

        var result = controller.GetSorted("price", "desc");

        var okResult = Assert.IsType<OkObjectResult>(result);
        var albums = Assert.IsAssignableFrom<List<Album>>(okResult.Value);
        Assert.NotEmpty(albums);

        for (var i = 1; i < albums.Count; i++)
        {
            Assert.True(albums[i - 1].Price >= albums[i].Price);
        }
    }

    [Fact]
    public void SearchByYear_WhenYearIsInvalid_ReturnsBadRequest()
    {
        var controller = new AlbumController();

        var result = controller.SearchByYear(0);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void SearchByYear_WhenYearExists_ReturnsOnlyMatchingAlbums()
    {
        var controller = new AlbumController();

        var result = controller.SearchByYear(2024);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var albums = Assert.IsAssignableFrom<List<Album>>(okResult.Value);
        Assert.NotEmpty(albums);
        Assert.All(albums, album => Assert.Equal(2024, album.Year));
    }

    [Fact]
    public void Create_ThenGet_ReturnsCreatedAlbum()
    {
        var controller = new AlbumController();
        var request = new AlbumController.AlbumRequest(
            $"Test Album {Guid.NewGuid()}",
            2,
            new DateOnly(2030, 7, 1),
            19.99,
            "https://example.com/cover.png");

        var createResult = controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(createResult);
        var createdAlbum = Assert.IsType<Album>(createdResult.Value);

        var getResult = controller.Get(createdAlbum.Id);

        var okResult = Assert.IsType<OkObjectResult>(getResult);
        var retrievedAlbum = Assert.IsType<Album>(okResult.Value);
        Assert.Equal(request.Title, retrievedAlbum.Title);
        Assert.Equal(request.Artist_id, retrievedAlbum.Artist_id);
        Assert.Equal(request.Release_date?.Year, retrievedAlbum.Year);

        controller.Delete(createdAlbum.Id);
    }

    [Fact]
    public void Create_WhenTitleIsMissing_ReturnsBadRequest()
    {
        var controller = new AlbumController();
        var request = new AlbumController.AlbumRequest(
            "   ",
            2,
            new DateOnly(2030, 7, 1),
            19.99,
            "https://example.com/cover.png");

        var result = controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Title is required.", badRequest.Value);
    }

    [Theory]
    [InlineData("artist-id", "Artist_id must be greater than 0.")]
    [InlineData("missing-artist", "Artist_id must reference an existing artist.")]
    [InlineData("price", "Price cannot be negative.")]
    [InlineData("image", "Image_url is required.")]
    public void Create_WhenRequestIsInvalid_ReturnsBadRequestWithExpectedMessage(string invalidField, string expectedMessage)
    {
        var controller = new AlbumController();
        var request = invalidField switch
        {
            "artist-id" => ValidRequest() with { Artist_id = 0 },
            "missing-artist" => ValidRequest() with { Artist_id = int.MaxValue },
            "price" => ValidRequest() with { Price = -0.01 },
            "image" => ValidRequest() with { Image_url = "   " },
            _ => throw new ArgumentOutOfRangeException(nameof(invalidField), invalidField, null)
        };

        var result = controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(expectedMessage, badRequest.Value);
    }

    [Fact]
    public void Update_WhenAlbumExists_UpdatesAlbum()
    {
        var controller = new AlbumController();
        var createRequest = new AlbumController.AlbumRequest(
            $"Album To Update {Guid.NewGuid()}",
            2,
            new DateOnly(2031, 2, 2),
            11.50,
            "https://example.com/original.png");

        var createdResult = Assert.IsType<CreatedAtActionResult>(controller.Create(createRequest));
        var createdAlbum = Assert.IsType<Album>(createdResult.Value);

        var updateRequest = new AlbumController.AlbumRequest(
            "Updated Album",
            3,
            new DateOnly(2032, 3, 3),
            12.75,
            "https://example.com/updated.png");

        var updateResult = controller.Update(createdAlbum.Id, updateRequest);

        var okResult = Assert.IsType<OkObjectResult>(updateResult);
        var updatedAlbum = Assert.IsType<Album>(okResult.Value);
        Assert.Equal(updateRequest.Title, updatedAlbum.Title);
        Assert.Equal(updateRequest.Release_date?.Year, updatedAlbum.Year);
        Assert.Equal("KEDA Club", updatedAlbum.Artist.Name);

        controller.Delete(createdAlbum.Id);
    }

    [Fact]
    public void Update_WhenAlbumDoesNotExist_ReturnsNotFound()
    {
        var controller = new AlbumController();
        var request = new AlbumController.AlbumRequest(
            "Non Existing Album",
            2,
            new DateOnly(2034, 5, 5),
            10.00,
            "https://example.com/non-existing.png");

        var result = controller.Update(int.MaxValue, request);

        Assert.IsType<NotFoundResult>(result);
    }

    [Theory]
    [InlineData("artist-id", "Artist_id must be greater than 0.")]
    [InlineData("missing-artist", "Artist_id must reference an existing artist.")]
    [InlineData("price", "Price cannot be negative.")]
    [InlineData("image", "Image_url is required.")]
    public void Update_WhenRequestIsInvalid_ReturnsBadRequestWithExpectedMessage(string invalidField, string expectedMessage)
    {
        var controller = new AlbumController();
        var request = invalidField switch
        {
            "artist-id" => ValidRequest() with { Artist_id = 0 },
            "missing-artist" => ValidRequest() with { Artist_id = int.MaxValue },
            "price" => ValidRequest() with { Price = -0.01 },
            "image" => ValidRequest() with { Image_url = "   " },
            _ => throw new ArgumentOutOfRangeException(nameof(invalidField), invalidField, null)
        };

        var result = controller.Update(1, request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(expectedMessage, badRequest.Value);
    }

    [Fact]
    public void Delete_WhenAlbumExists_ReturnsNoContentAndRemovesAlbum()
    {
        var controller = new AlbumController();
        var createRequest = new AlbumController.AlbumRequest(
            $"Album To Delete {Guid.NewGuid()}",
            2,
            new DateOnly(2033, 4, 4),
            9.99,
            "https://example.com/delete.png");

        var createdResult = Assert.IsType<CreatedAtActionResult>(controller.Create(createRequest));
        var createdAlbum = Assert.IsType<Album>(createdResult.Value);

        var deleteResult = controller.Delete(createdAlbum.Id);

        Assert.IsType<NoContentResult>(deleteResult);

        var getResult = controller.Get(createdAlbum.Id);
        Assert.IsType<NotFoundResult>(getResult);
    }

    [Fact]
    public void Delete_WhenAlbumDoesNotExist_ReturnsNotFound()
    {
        var controller = new AlbumController();

        var result = controller.Delete(int.MaxValue);

        Assert.IsType<NotFoundResult>(result);
    }
}
