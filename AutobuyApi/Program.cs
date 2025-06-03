using AutobuyApi.ContextModels;
using AutobuyApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.IO;

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

app.MapGet("/api/products", async (AutobuyContext db) =>
    await db.Products.ToListAsync()
);

app.MapPost("/api/users/register", async (AutobuyContext db, UserDto user) =>
{
    if (await db.Users.AnyAsync(u => u.Username == user.Username))
        return Results.BadRequest("Username already exists");

    var newUser = new User
    {
        Name = user.Name,
        Username = user.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password),
        Role = "user"
    };
    db.Users.Add(newUser);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapPost("/api/users/login", async (AutobuyContext db, UserDto user) =>
{
    var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
    if (dbUser == null)
        return Results.BadRequest("Utilizator inexistent");

    if (!BCrypt.Net.BCrypt.Verify(user.Password, dbUser.PasswordHash))
        return Results.BadRequest("Parolă greșită");

    // Return user info including role (never return password hash!)
    return Results.Ok(new { dbUser.Id, dbUser.Name, dbUser.Username, dbUser.Role });
});

// BUY ENDPOINT WITH QUANTITY SUPPORT
app.MapPost("/api/buy", async (AutobuyContext db, HttpRequest request) =>
{
    try
    {
        var body = await new StreamReader(request.Body).ReadToEndAsync();
        Console.WriteLine("Received cart: " + body); // <--- LOG THE CART
        var data = System.Text.Json.JsonDocument.Parse(body);
        var cart = data.RootElement.GetProperty("cart");

        foreach (var item in cart.EnumerateArray())
        {
            int id = item.GetProperty("id").GetInt32();
            int quantity = 1;
            if (item.TryGetProperty("quantity", out var q))
                quantity = q.GetInt32();

            var product = await db.Products.FindAsync(id);
            if (product == null)
            {
                Console.WriteLine($"Product with id {id} not found");
                return Results.BadRequest($"Product with id {id} not found");
            }

            if (product.Stock < quantity)
            {
                Console.WriteLine($"Not enough stock for {product.Name}");
                return Results.BadRequest($"Not enough stock for {product.Name}");
            }

            product.Stock -= quantity;
            Console.WriteLine($"Updated {product.Name} stock to {product.Stock}");
        }

        await db.SaveChangesAsync();
        Console.WriteLine("Stock updated and saved.");
        return Results.Ok(new { success = true });
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error in /api/buy: " + ex.Message);
        return Results.BadRequest("Invalid cart data");
    }
});

// Get product by id
app.MapGet("/api/products/{id}", async (AutobuyContext db, int id) =>
{
    var product = await db.Products.FindAsync(id);
    return product is not null ? Results.Ok(product) : Results.NotFound();
});

// Add new product
app.MapPost("/api/products", async (AutobuyContext db, Product product) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Ok(product);
});

// Update product
app.MapPut("/api/products/{id}", async (AutobuyContext db, int id, Product updated) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    product.Name = updated.Name;
    product.Description = updated.Description;
    product.Price = updated.Price;
    product.Stock = updated.Stock;
    product.ImageUrl = updated.ImageUrl;
    await db.SaveChangesAsync();
    return Results.Ok(product);
});

// Delete product
app.MapDelete("/api/products/{id}", async (AutobuyContext db, int id) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.Ok();
});
app.Run();