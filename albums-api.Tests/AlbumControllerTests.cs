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
            new AlbumController.ArtistRequest("Valid Artist", new DateOnly(1990, 1, 1), "Valid City"),
            2030,
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
            new AlbumController.ArtistRequest("Test Artist", new DateOnly(1990, 1, 1), "Test City"),
            2030,
            19.99,
            "https://example.com/cover.png");

        var createResult = controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(createResult);
        var createdAlbum = Assert.IsType<Album>(createdResult.Value);

        var getResult = controller.Get(createdAlbum.Id);

        var okResult = Assert.IsType<OkObjectResult>(getResult);
        var retrievedAlbum = Assert.IsType<Album>(okResult.Value);
        Assert.Equal(request.Title, retrievedAlbum.Title);

        controller.Delete(createdAlbum.Id);
    }

    [Fact]
    public void Create_WhenTitleIsMissing_ReturnsBadRequest()
    {
        var controller = new AlbumController();
        var request = new AlbumController.AlbumRequest(
            "   ",
            new AlbumController.ArtistRequest("Test Artist", new DateOnly(1990, 1, 1), "Test City"),
            2030,
            19.99,
            "https://example.com/cover.png");

        var result = controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Title is required.", badRequest.Value);
    }

    [Theory]
    [InlineData("artist-name", "Artist.Name is required.")]
    [InlineData("artist-birthdate", "Artist.Birthdate is required.")]
    [InlineData("artist-birthplace", "Artist.BirthPlace is required.")]
    [InlineData("year", "Year must be greater than 0.")]
    [InlineData("price", "Price cannot be negative.")]
    [InlineData("image", "Image_url is required.")]
    public void Create_WhenRequestIsInvalid_ReturnsBadRequestWithExpectedMessage(string invalidField, string expectedMessage)
    {
        var controller = new AlbumController();
        var request = invalidField switch
        {
            "artist-name" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("   ", new DateOnly(1990, 1, 1), "City") },
            "artist-birthdate" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("Artist", default, "City") },
            "artist-birthplace" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("Artist", new DateOnly(1990, 1, 1), "   ") },
            "year" => ValidRequest() with { Year = 0 },
            "price" => ValidRequest() with { Price = -0.01 },
            "image" => ValidRequest() with { Image_url = "   " },
            _ => throw new ArgumentOutOfRangeException(nameof(invalidField), invalidField, null)
        };

        var result = controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(expectedMessage, badRequest.Value);
    }

    [Fact]
    public void Create_WhenArtistIsNull_ReturnsBadRequest()
    {
        var controller = new AlbumController();
        var request = ValidRequest() with { Artist = null! };

        var result = controller.Create(request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Artist is required.", badRequest.Value);
    }

    [Fact]
    public void Update_WhenAlbumExists_UpdatesAlbum()
    {
        var controller = new AlbumController();
        var createRequest = new AlbumController.AlbumRequest(
            $"Album To Update {Guid.NewGuid()}",
            new AlbumController.ArtistRequest("Original Artist", new DateOnly(1992, 2, 2), "Original City"),
            2031,
            11.50,
            "https://example.com/original.png");

        var createdResult = Assert.IsType<CreatedAtActionResult>(controller.Create(createRequest));
        var createdAlbum = Assert.IsType<Album>(createdResult.Value);

        var updateRequest = new AlbumController.AlbumRequest(
            "Updated Album",
            new AlbumController.ArtistRequest("Updated Artist", new DateOnly(1993, 3, 3), "Updated City"),
            2032,
            12.75,
            "https://example.com/updated.png");

        var updateResult = controller.Update(createdAlbum.Id, updateRequest);

        var okResult = Assert.IsType<OkObjectResult>(updateResult);
        var updatedAlbum = Assert.IsType<Album>(okResult.Value);
        Assert.Equal(updateRequest.Title, updatedAlbum.Title);
        Assert.Equal(updateRequest.Year, updatedAlbum.Year);

        controller.Delete(createdAlbum.Id);
    }

    [Fact]
    public void Update_WhenAlbumDoesNotExist_ReturnsNotFound()
    {
        var controller = new AlbumController();
        var request = new AlbumController.AlbumRequest(
            "Non Existing Album",
            new AlbumController.ArtistRequest("Ghost Artist", new DateOnly(1991, 5, 5), "Nowhere"),
            2034,
            10.00,
            "https://example.com/non-existing.png");

        var result = controller.Update(int.MaxValue, request);

        Assert.IsType<NotFoundResult>(result);
    }

    [Theory]
    [InlineData("artist-name", "Artist.Name is required.")]
    [InlineData("artist-birthdate", "Artist.Birthdate is required.")]
    [InlineData("artist-birthplace", "Artist.BirthPlace is required.")]
    [InlineData("year", "Year must be greater than 0.")]
    [InlineData("price", "Price cannot be negative.")]
    [InlineData("image", "Image_url is required.")]
    public void Update_WhenRequestIsInvalid_ReturnsBadRequestWithExpectedMessage(string invalidField, string expectedMessage)
    {
        var controller = new AlbumController();
        var request = invalidField switch
        {
            "artist-name" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("   ", new DateOnly(1990, 1, 1), "City") },
            "artist-birthdate" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("Artist", default, "City") },
            "artist-birthplace" => ValidRequest() with { Artist = new AlbumController.ArtistRequest("Artist", new DateOnly(1990, 1, 1), "   ") },
            "year" => ValidRequest() with { Year = 0 },
            "price" => ValidRequest() with { Price = -0.01 },
            "image" => ValidRequest() with { Image_url = "   " },
            _ => throw new ArgumentOutOfRangeException(nameof(invalidField), invalidField, null)
        };

        var result = controller.Update(1, request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(expectedMessage, badRequest.Value);
    }

    [Fact]
    public void Update_WhenArtistIsNull_ReturnsBadRequest()
    {
        var controller = new AlbumController();
        var request = ValidRequest() with { Artist = null! };

        var result = controller.Update(1, request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Artist is required.", badRequest.Value);
    }

    [Fact]
    public void Delete_WhenAlbumExists_ReturnsNoContentAndRemovesAlbum()
    {
        var controller = new AlbumController();
        var createRequest = new AlbumController.AlbumRequest(
            $"Album To Delete {Guid.NewGuid()}",
            new AlbumController.ArtistRequest("Delete Artist", new DateOnly(1994, 4, 4), "Delete City"),
            2033,
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
