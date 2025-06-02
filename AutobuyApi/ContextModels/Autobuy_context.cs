using Microsoft.EntityFrameworkCore;
using AutobuyApi.Models;

namespace AutobuyApi.ContextModels
{
    public class AutobuyContext : DbContext
    {
        public AutobuyContext(DbContextOptions<AutobuyContext> options) : base(options) { }
        public DbSet<Product> Products { get; set; }
    }
}