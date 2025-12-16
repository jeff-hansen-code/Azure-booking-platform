terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    # Backend configuration should be provided via backend config file or CLI
    # Example: terraform init -backend-config="backend.tfvars"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
