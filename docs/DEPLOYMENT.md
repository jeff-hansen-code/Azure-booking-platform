# Deployment Guide

This guide covers deploying the Azure Booking Platform to Azure.

## Prerequisites

- Azure subscription
- Azure CLI installed (`az`)
- Terraform installed (v1.9.0+)
- Node.js 20+ and npm
- .NET SDK 8.0+
- Git

## Initial Azure Setup

### 1. Login to Azure

```bash
az login
```

### 2. Set Your Subscription

```bash
az account set --subscription "<your-subscription-id>"
```

### 3. Create Service Principal for GitHub Actions (OIDC)

```bash
# Create a resource group for GitHub Actions
az group create --name rg-github-actions --location eastus

# Create the service principal with OIDC
az ad sp create-for-rbac \
  --name "sp-booking-platform-github" \
  --role contributor \
  --scopes /subscriptions/<subscription-id> \
  --sdk-auth
```

Save the output - you'll need these values for GitHub secrets.

### 4. Create Terraform State Storage

```bash
# Create resource group for Terraform state
az group create --name rg-terraform-state --location eastus

# Create storage account (name must be globally unique)
az storage account create \
  --name tfstate$(uuidgen | cut -c1-8) \
  --resource-group rg-terraform-state \
  --location eastus \
  --sku Standard_LRS

# Get the storage account name
STORAGE_ACCOUNT=$(az storage account list -g rg-terraform-state --query "[0].name" -o tsv)

# Create blob container
az storage container create \
  --name tfstate \
  --account-name $STORAGE_ACCOUNT
```

## Infrastructure Deployment

### 1. Configure Terraform Variables

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and add your values:

```hcl
subscription_id       = "your-subscription-id"
resource_group_name   = "rg-booking-platform"
location              = "eastus"
environment           = "dev"
project_name          = "booking"
```

### 2. Initialize Terraform

```bash
terraform init \
  -backend-config="resource_group_name=rg-terraform-state" \
  -backend-config="storage_account_name=$STORAGE_ACCOUNT" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=terraform.tfstate"
```

### 3. Review and Apply

```bash
# Review the plan
terraform plan

# Apply the infrastructure
terraform apply
```

### 4. Save Outputs

```bash
# Get important outputs
terraform output -json > outputs.json

# Get specific values
terraform output static_web_app_url
terraform output function_app_url
terraform output static_web_app_api_key
```

## Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

### Terraform Secrets
- `AZURE_CLIENT_ID` - From service principal creation
- `AZURE_TENANT_ID` - From service principal creation
- `AZURE_SUBSCRIPTION_ID` - Your subscription ID
- `TF_BACKEND_RESOURCE_GROUP` - `rg-terraform-state`
- `TF_BACKEND_STORAGE_ACCOUNT` - Storage account name from step 4
- `TF_BACKEND_CONTAINER` - `tfstate`

### Deployment Secrets
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - From `terraform output static_web_app_api_key`
- `AZURE_FUNCTION_APP_NAME` - From `terraform output function_app_name`
- `API_BASE_URL` - From `terraform output function_app_url`

## Manual Deployment

If you need to deploy manually without GitHub Actions:

### Deploy Frontend

```bash
cd web

# Install dependencies
npm install

# Build
VITE_API_BASE_URL=<your-function-app-url> npm run build

# Deploy using Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli
swa deploy ./dist \
  --deployment-token <your-static-web-app-token> \
  --app-location ./dist
```

### Deploy Backend

```bash
cd api

# Restore and build
dotnet restore
dotnet build --configuration Release

# Publish
dotnet publish --configuration Release --output ./publish

# Deploy to Azure Functions
# Install Azure Functions Core Tools if not already installed
func azure functionapp publish <your-function-app-name>
```

## Post-Deployment Configuration

### 1. Configure Function App Settings

```bash
FUNCTION_APP_NAME=$(terraform output -raw function_app_name)

# Ensure connection string is set
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group rg-booking-platform \
  --settings "AzureWebJobsStorage=<storage-connection-string>"
```

### 2. Enable CORS on Function App

```bash
az functionapp cors add \
  --name $FUNCTION_APP_NAME \
  --resource-group rg-booking-platform \
  --allowed-origins "*"
```

For production, replace `*` with your Static Web App URL.

### 3. Configure Static Web App

The Static Web App should automatically be configured through Terraform, but you can verify:

```bash
STATIC_WEB_APP_NAME=$(terraform output -raw static_web_app_name)

az staticwebapp show \
  --name $STATIC_WEB_APP_NAME \
  --resource-group rg-booking-platform
```

## Verify Deployment

### 1. Test API

```bash
FUNCTION_URL=$(terraform output -raw function_app_url)

# Test health (should get a 404 or CORS response, which means it's running)
curl "$FUNCTION_URL/api/v1/appointments?from=2025-12-01&to=2025-12-31"
```

### 2. Test Web App

```bash
WEBAPP_URL=$(terraform output -raw static_web_app_url)
echo "Visit: $WEBAPP_URL"
```

Open the URL in your browser and:
1. Navigate to the Home page
2. Go to Book Appointment and create a test booking
3. Go to Schedule to see your booking

## Monitoring and Logs

### View Function App Logs

```bash
# Stream logs
az webapp log tail \
  --name $FUNCTION_APP_NAME \
  --resource-group rg-booking-platform

# Or view in Azure Portal
echo "https://portal.azure.com/#@/resource/subscriptions/<sub-id>/resourceGroups/rg-booking-platform/providers/Microsoft.Web/sites/$FUNCTION_APP_NAME/logStream"
```

### View Application Insights

Application Insights is automatically configured. View telemetry in the Azure Portal.

## Troubleshooting

### Function App Not Starting

1. Check that the storage connection string is correct
2. Verify the .NET version is set to 8.0
3. Check logs in Azure Portal

### CORS Errors

1. Verify CORS is enabled on the Function App
2. Check that the Static Web App URL is allowed
3. Ensure the API URL in the frontend env is correct

### Static Web App Not Updating

1. Check GitHub Actions workflow status
2. Verify the deployment token is correct
3. Ensure the build output is in the correct location (`dist/`)

## Production Considerations

### Security
- [ ] Enable authentication on Function App
- [ ] Restrict CORS to specific origins
- [ ] Use Managed Identity for storage access
- [ ] Enable HTTPS only
- [ ] Set up API key authentication

### Performance
- [ ] Enable Application Insights
- [ ] Set up alerts for errors and performance
- [ ] Consider Azure Front Door for global distribution
- [ ] Implement caching where appropriate

### Reliability
- [ ] Set up availability tests
- [ ] Configure auto-scaling for Function App
- [ ] Implement proper error handling and retries
- [ ] Set up backup for Table Storage

### Cost Optimization
- [ ] Monitor usage with Azure Cost Management
- [ ] Consider reserved capacity for predictable workloads
- [ ] Use consumption plan for variable workloads
- [ ] Clean up unused resources

## Cleanup

To remove all resources:

```bash
cd infra/terraform
terraform destroy

# Also clean up the Terraform state storage
az group delete --name rg-terraform-state --yes
az group delete --name rg-github-actions --yes
```
