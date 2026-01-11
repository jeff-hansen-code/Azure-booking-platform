# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Storage Account for Table Storage and Function App
resource "azurerm_storage_account" "main" {
  name                     = "${var.project_name}${var.environment}sa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Storage Table for Appointments
resource "azurerm_storage_table" "appointments" {
  name                 = "Appointments"
  storage_account_name = azurerm_storage_account.main.name
}

# Service Plan for Azure Functions
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-${var.environment}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "Y1"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Azure Function App
resource "azurerm_linux_function_app" "main" {
  name                = "${var.project_name}-${var.environment}-func"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id

  site_config {
    application_stack {
      dotnet_version              = "8.0"
      use_dotnet_isolated_runtime = true
    }

    cors {
      # NOTE: Using wildcard (*) for development. 
      # In production, replace with specific Static Web App URL: 
      # allowed_origins = [azurerm_static_web_app.main.default_host_name]
      allowed_origins = ["*"]
    }
  }

  app_settings = {
    "AzureWebJobsStorage"      = azurerm_storage_account.main.primary_connection_string
    "FUNCTIONS_WORKER_RUNTIME" = "dotnet-isolated"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Static Web App for Frontend
resource "azurerm_static_web_app" "main" {
  name                = "${var.project_name}-${var.environment}-web"
  resource_group_name = azurerm_resource_group.main.name
  location            = "eastus2" # Static Web Apps have limited region availability
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
