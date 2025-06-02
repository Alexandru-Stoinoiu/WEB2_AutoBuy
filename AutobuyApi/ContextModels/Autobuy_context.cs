using AutobuyApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AutobuyApi.ContextModels
{
    public class AutobuyContext : DbContext
    {
        public AutobuyContext(DbContextOptions<AutobuyContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; } 
    }
}