# Quick Start Guide

This guide helps you get the Azure Booking Platform running quickly.

## 🚀 Quick Local Setup (5 minutes)

### Prerequisites Check

Make sure you have:
- ✅ Node.js 20+ (`node --version`)
- ✅ .NET SDK 8.0+ (`dotnet --version`)
- ✅ Git

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/jeff-hansen-code/Azure-booking-platform.git
cd Azure-booking-platform
```

### Step 2: Start Frontend

```bash
cd web
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Step 3: Start Backend (New Terminal)

For local development, you have two options:

**Option A: Using Azurite (Recommended for development)**

```bash
# Install and start Azurite
npm install -g azurite
azurite --silent &

# Start API
cd api
dotnet restore
dotnet run
```

**Option B: Using Azure Storage Account**

```bash
cd api
cp local.settings.json.example local.settings.json
# Edit local.settings.json and add your Azure Storage connection string

dotnet restore
dotnet run
```

API will be available at: **http://localhost:7071**

### Step 4: Test the Application

1. Open browser to http://localhost:5173
2. Click "Book Appointment"
3. Fill out the form and submit
4. Click "Schedule" to see your appointment

✅ **You're done!** The full stack is running locally.

---

## 🌩️ Quick Azure Deployment (30 minutes)

### Prerequisites

- Azure subscription
- Azure CLI installed (`az --version`)
- Terraform installed (`terraform --version`)

### Step 1: Login to Azure

```bash
az login
az account set --subscription "<your-subscription-id>"
```

### Step 2: Create Terraform Backend

```bash
# Create storage for Terraform state
az group create --name rg-terraform-state --location eastus

STORAGE_ACCOUNT="tfstate$(openssl rand -hex 4)"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group rg-terraform-state \
  --location eastus \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name $STORAGE_ACCOUNT

echo "Terraform backend storage account: $STORAGE_ACCOUNT"
```

### Step 3: Configure Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your subscription ID
# subscription_id = "your-subscription-id-here"
```

### Step 4: Deploy Infrastructure

```bash
terraform init \
  -backend-config="resource_group_name=rg-terraform-state" \
  -backend-config="storage_account_name=$STORAGE_ACCOUNT" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=terraform.tfstate"

terraform plan
terraform apply -auto-approve
```

### Step 5: Get Deployment Outputs

```bash
# Save these values - you'll need them!
terraform output static_web_app_url
terraform output function_app_url
terraform output -raw static_web_app_api_key > ../../../deploy-token.txt
```

### Step 6: Deploy Frontend

```bash
cd ../../web
npm install
npm run build

# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy (replace with your token from step 5)
swa deploy ./dist --deployment-token $(cat ../deploy-token.txt) --app-location ./dist
```

### Step 7: Deploy Backend

```bash
cd ../api
dotnet publish --configuration Release --output ./publish

# Get function app name from Terraform
FUNC_APP=$(cd ../infra/terraform && terraform output -raw function_app_name)

# Deploy to Azure
# Note: If you don't have func CLI, deploy via Azure Portal or GitHub Actions
func azure functionapp publish $FUNC_APP
```

### Step 8: Test Production

```bash
# Get your production URLs
cd ../infra/terraform
echo "Frontend: $(terraform output -raw static_web_app_url)"
echo "API: $(terraform output -raw function_app_url)"
```

Visit the frontend URL and test the booking flow!

---

## 📋 Troubleshooting

### Frontend Issues

**Problem:** Frontend can't connect to API
```bash
# Check your .env file in /web directory
cat web/.env
# Should have: VITE_API_BASE_URL=http://localhost:7071
```

**Problem:** Build errors
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Issues

**Problem:** Azure Functions won't start
```bash
# Ensure Azurite is running
ps aux | grep azurite

# Or restart it
pkill azurite
azurite --silent &
```

**Problem:** Connection errors to storage
```bash
# Check your connection string
cd api
cat local.settings.json
# For Azurite, should have: "AzureWebJobsStorage": "UseDevelopmentStorage=true"
```

### Terraform Issues

**Problem:** Provider errors
```bash
cd infra/terraform
rm -rf .terraform .terraform.lock.hcl
terraform init
```

**Problem:** State lock errors
```bash
# If state is locked, you can force unlock (use carefully!)
terraform force-unlock <lock-id>
```

---

## 🎯 Next Steps

### For Development
- [ ] Review [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] Check [API Documentation](../docs/API.md)
- [ ] Add authentication (see README for suggestions)
- [ ] Add notification system

### For Production
- [ ] Set up GitHub Actions (see `.github/workflows/`)
- [ ] Configure monitoring in Azure Portal
- [ ] Restrict CORS to your domain
- [ ] Add authentication
- [ ] Set up alerts and monitoring

### Resources
- [Full README](../README.md)
- [API Documentation](../docs/API.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

## 💡 Helpful Commands

### Development
```bash
# Frontend
cd web && npm run dev        # Start dev server
cd web && npm run build      # Build for production
cd web && npm run lint       # Run linter

# Backend
cd api && dotnet run         # Start API
cd api && dotnet build       # Build API
cd api && dotnet test        # Run tests (if any)

# Infrastructure
cd infra/terraform && terraform plan    # Preview changes
cd infra/terraform && terraform apply   # Apply changes
cd infra/terraform && terraform destroy # Remove all resources
```

### Cleanup
```bash
# Stop local services
pkill azurite
# Ctrl+C in terminal running frontend
# Ctrl+C in terminal running backend

# Remove Azure resources
cd infra/terraform
terraform destroy -auto-approve

# Remove Terraform backend
az group delete --name rg-terraform-state --yes
```

---

**Need help?** Open an issue on GitHub!
