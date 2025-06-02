using AutobuyApi.ContextModels;
using AutobuyApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Autobuy API", Version = "v1" });
});
builder.Services.AddDbContext<AutobuyContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Autobuy")));

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Minimal API endpoint for products
app.MapGet("/api/products", async (AutobuyContext db) =>
    await db.Products.ToListAsync()
);


app.Run();