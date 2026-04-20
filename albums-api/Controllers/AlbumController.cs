using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;
using System.Text;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace albums_api.Controllers
{
    [Route("albums")]
    [ApiController]
    public class AlbumController : ControllerBase
    {
        // GET: api/album
        [HttpGet]
        public IActionResult Get()
        {
            var albums = Album.GetAll();

            // Return the albums as JSON
            return Ok(albums);
        }

        // GET: /albums/sorted?sortBy=title|artist|price&order=asc|desc
        [HttpGet("sorted")]
        public IActionResult GetSorted([FromQuery] string sortBy = "title", [FromQuery] string order = "asc")
        {
            var albums = Album.GetAll();
            var normalizedSortBy = sortBy.Trim().ToLowerInvariant();
            var descending = order.Trim().Equals("desc", StringComparison.OrdinalIgnoreCase);

            var sortedAlbums = normalizedSortBy switch
            {
                "title" => descending ? albums.OrderByDescending(a => a.Title) : albums.OrderBy(a => a.Title),
                "artist" => descending ? albums.OrderByDescending(a => a.Artist) : albums.OrderBy(a => a.Artist),
                "price" => descending ? albums.OrderByDescending(a => a.Price) : albums.OrderBy(a => a.Price),
                _ => null
            };

            if (sortedAlbums == null)
            {
                return BadRequest("Invalid sortBy value. Use: title, artist, or price.");
            }

            return Ok(sortedAlbums.ToList());
        }

        // GET api/<AlbumController>/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            return Ok();
        }

    }
}
