using albums_api.Controllers;
using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace albums_api.Tests;

public class ArtistsControllerTests
{
    [Fact]
    public void Get_ReturnsSeededArtists()
    {
        var controller = new ArtistsController();

        var result = controller.Get();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var artists = Assert.IsAssignableFrom<List<Artist>>(okResult.Value);
        Assert.NotEmpty(artists);
        Assert.Equal("Daprize", artists[0].Name);
        Assert.Equal("Cloud Native Pop", artists[0].Genre);
    }
}