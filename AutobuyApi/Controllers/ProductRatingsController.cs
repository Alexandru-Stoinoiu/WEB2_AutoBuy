using Microsoft.AspNetCore.Mvc;
using AutobuyApi.ContextModels;
using AutobuyApi.Models;
using System.Linq;
using System.Net.Mime;

namespace AutobuyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductRatingsController : ControllerBase
    {
        private readonly AutobuyContext _context;
        public ProductRatingsController(AutobuyContext context)
        {
            _context = context;
        }

        // GET: api/ProductRatings/{productId}/median
        [HttpGet("{productId}/median")]
        public ActionResult<double> GetMedian(int productId)
        {
            var ratings = _context.ProductRatings
                .Where(r => r.ProductId == productId)
                .Select(r => r.Rating)
                .OrderBy(r => r)
                .ToList();           

            if (!ratings.Any()) return 0;

            int count = ratings.Count;
            double median;
            if (count % 2 == 1)
                median = ratings[count / 2];
            else
                median = (ratings[count / 2 - 1] + ratings[count / 2]) / 2.0;

            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product != null)
            {
                product.Rating = median;
                _context.SaveChanges();
            }

            return median;  
        }

        // GET: api/ProductRatings/{productId}/user/{userId}
        [HttpGet("{productId}/user/{userId}")]
        public ActionResult<double> GetUserRating(int productId, int userId)
        {
            var rating = _context.ProductRatings
                .FirstOrDefault(r => r.ProductId == productId && r.UserId == userId);
            return rating?.Rating ?? 0;
        }

        // POST: api/ProductRatings
        [HttpPost]
        public IActionResult SetRating([FromBody] ProductRating rating)
        {
            if (rating.Rating < 1 || rating.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var existing = _context.ProductRatings
                .FirstOrDefault(r => r.ProductId == rating.ProductId && r.UserId == rating.UserId);

            if (existing != null)
                existing.Rating = rating.Rating;
            else
                _context.ProductRatings.Add(rating);

            _context.SaveChanges();            
            
            return Ok();
        }
    }
}