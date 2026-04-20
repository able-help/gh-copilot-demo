using albums_api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace albums_api.Controllers
{
    [Route("albums")]
    [ApiController]
    public class AlbumController : ControllerBase
    {
        public record AlbumRequest(
            [property: JsonPropertyName("title")] string Title,
            [property: JsonPropertyName("artist_id")] int Artist_id,
            [property: JsonPropertyName("release_date")] DateOnly? Release_date,
            [property: JsonPropertyName("price")] double Price,
            [property: JsonPropertyName("image_url")] string Image_url);

        /// <summary>
        /// Returns the full album catalog with joined artist details.
        /// </summary>
        /// <response code="200">The normalized album collection.</response>
        [HttpGet]
        [ProducesResponseType(typeof(List<Album>), StatusCodes.Status200OK)]
        public IActionResult Get()
        {
            var albums = Album.GetAll();

            return Ok(albums);
        }

        /// <summary>
        /// Returns albums sorted by title, artist name, or price.
        /// </summary>
        /// <param name="sortBy">The field to sort by: title, artist, or price.</param>
        /// <param name="order">The sort direction: asc or desc.</param>
        /// <response code="200">The sorted album collection.</response>
        /// <response code="400">The sort field is not supported.</response>
        [HttpGet("sorted")]
        [ProducesResponseType(typeof(List<Album>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
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

        /// <summary>
        /// Returns a single album by identifier.
        /// </summary>
        /// <param name="id">The album identifier.</param>
        /// <response code="200">The matching album.</response>
        /// <response code="404">No album exists with the supplied identifier.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Album), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(int id)
        {
            var album = Album.GetById(id);
            if (album is null)
            {
                return NotFound();
            }

            return Ok(album);
        }

        /// <summary>
        /// Returns albums whose release date falls within the specified calendar year.
        /// </summary>
        /// <param name="year">The release year to match.</param>
        /// <response code="200">The albums released during the requested year.</response>
        /// <response code="400">The supplied year is invalid.</response>
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<Album>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public IActionResult SearchByYear([FromQuery] int year)
        {
            if (year <= 0)
            {
                return BadRequest("Year must be greater than 0.");
            }

            var albums = Album.SearchByYear(year);
            return Ok(albums);
        }

        /// <summary>
        /// Creates a new album linked to an existing artist.
        /// </summary>
        /// <param name="request">The normalized album payload.</param>
        /// <response code="201">The album was created successfully.</response>
        /// <response code="400">The request payload is invalid.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Album), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public IActionResult Create([FromBody] AlbumRequest request)
        {
            var validationError = ValidateRequest(request);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var album = Album.Create(request.Title.Trim(), request.Artist_id, request.Release_date, request.Price, request.Image_url.Trim());
            return CreatedAtAction(nameof(Get), new { id = album.Id }, album);
        }

        /// <summary>
        /// Updates an existing album.
        /// </summary>
        /// <param name="id">The album identifier.</param>
        /// <param name="request">The replacement album payload.</param>
        /// <response code="200">The album was updated successfully.</response>
        /// <response code="400">The request payload is invalid.</response>
        /// <response code="404">No album exists with the supplied identifier.</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Album), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Update(int id, [FromBody] AlbumRequest request)
        {
            var validationError = ValidateRequest(request);
            if (validationError is not null)
            {
                return BadRequest(validationError);
            }

            var updatedAlbum = Album.Update(id, request.Title.Trim(), request.Artist_id, request.Release_date, request.Price, request.Image_url.Trim());
            if (updatedAlbum is null)
            {
                return NotFound();
            }

            return Ok(updatedAlbum);
        }

        /// <summary>
        /// Deletes an album by identifier.
        /// </summary>
        /// <param name="id">The album identifier.</param>
        /// <response code="204">The album was deleted successfully.</response>
        /// <response code="404">No album exists with the supplied identifier.</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

            if (request.Artist_id <= 0)
            {
                return "Artist_id must be greater than 0.";
            }

            if (!Artist.Exists(request.Artist_id))
            {
                return "Artist_id must reference an existing artist.";
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
