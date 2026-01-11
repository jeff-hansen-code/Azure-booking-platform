using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using api.Repositories;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Get storage connection string from environment or use development storage
var storageConnectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage") 
    ?? "UseDevelopmentStorage=true";

// Register TableClient for Appointments table
builder.Services.AddSingleton(sp =>
{
    var tableClient = new TableClient(storageConnectionString, "Appointments");
    tableClient.CreateIfNotExists();
    return tableClient;
});

// Register repositories
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Build().Run();
