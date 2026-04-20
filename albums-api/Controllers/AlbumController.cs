using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace albums_api.Controllers
{
    [Route("albums")]
    [ApiController]

    public class AlbumController : ControllerBase
    {
        public record ArtistRequest(string Name, DateOnly Birthdate, string BirthPlace);

        public record AlbumRequest(string Title, ArtistRequest Artist, int Year, double Price, string Image_url);

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
                "artist" => descending ? albums.OrderByDescending(a => a.Artist.Name) : albums.OrderBy(a => a.Artist.Name),
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
            var album = Album.GetById(id);
            if (album is null)
            {
                return NotFound();
            }

            return Ok(album);
        }

        // GET: /albums/search?year=2025
        [HttpGet("search")]
        public IActionResult SearchByYear([FromQuery] int year)
        {
            if (year <= 0)
            {
                return BadRequest("Year must be greater than 0.");
            }

            var albums = Album.SearchByYear(year);
            return Ok(albums);
        }

        // POST: /albums
        [HttpPost]
        public IActionResult Create([FromBody] AlbumRequest request)
        {
            var validationError = ValidateRequest(request);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var artist = new Artist(request.Artist.Name.Trim(), request.Artist.Birthdate, request.Artist.BirthPlace.Trim());
            var album = Album.Create(request.Title.Trim(), artist, request.Year, request.Price, request.Image_url.Trim());
            return CreatedAtAction(nameof(Get), new { id = album.Id }, album);
        }

        // PUT: /albums/{id}
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] AlbumRequest request)
        {
            var validationError = ValidateRequest(request);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var artist = new Artist(request.Artist.Name.Trim(), request.Artist.Birthdate, request.Artist.BirthPlace.Trim());
            var updatedAlbum = Album.Update(id, request.Title.Trim(), artist, request.Year, request.Price, request.Image_url.Trim());
            if (updatedAlbum is null)
            {
                return NotFound();
            }

            return Ok(updatedAlbum);
        }

        // DELETE: /albums/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var removed = Album.Delete(id);
            if (!removed)
            {
                return NotFound();
            }

            return NoContent();
        }

        private static string? ValidateRequest(AlbumRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return "Title is required.";
            }

            if (request.Artist is null)
            {
                return "Artist is required.";
            }

            if (string.IsNullOrWhiteSpace(request.Artist.Name))
            {
                return "Artist.Name is required.";
            }

            if (request.Artist.Birthdate == default)
            {
                return "Artist.Birthdate is required.";
            }

            if (string.IsNullOrWhiteSpace(request.Artist.BirthPlace))
            {
                return "Artist.BirthPlace is required.";
            }

            if (request.Year <= 0)
            {
                return "Year must be greater than 0.";
            }

            if (request.Price < 0)
            {
                return "Price cannot be negative.";
            }

            if (string.IsNullOrWhiteSpace(request.Image_url))
            {
                return "Image_url is required.";
            }

            return null;
        }
    }
}
