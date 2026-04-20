using albums_api.Models;
using Microsoft.AspNetCore.Mvc;

namespace albums_api.Controllers
{
    [Route("artists")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        /// <summary>
        /// Returns the available artists that albums can reference by artist_id.
        /// </summary>
        /// <response code="200">The artist lookup collection.</response>
        [HttpGet]
        [ProducesResponseType(typeof(List<Artist>), StatusCodes.Status200OK)]
        public IActionResult Get()
        {
            return Ok(Artist.GetAll());
        }
    }
}