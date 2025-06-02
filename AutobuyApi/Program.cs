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
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password)
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

    // Optionally, return user info/role (never return password hash!)
    return Results.Ok(new { dbUser.Id, dbUser.Name, dbUser.Username });
});

app.Run();