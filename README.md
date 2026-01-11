# Azure Booking Platform

Full-stack serverless appointment booking system using React, Azure Functions (.NET), Azure Table Storage, Terraform, and GitHub Actions.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Azure Cloud                             │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────┐        │
│  │  Static Web App  │────────▶│  Function App       │        │
│  │  (React/Vite)    │   API   │  (.NET 8 Isolated)  │        │
│  └──────────────────┘         └─────────────────────┘        │
│                                         │                     │
│                                         ▼                     │
│                              ┌─────────────────────┐          │
│                              │  Table Storage      │          │
│                              │  (Appointments)     │          │
│                              └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
├── web/                    # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Page components (Home, Schedule, Book, Contact)
│   │   ├── components/     # Reusable components (Navigation, Footer)
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
│
├── api/                    # Azure Functions .NET 8 backend
│   ├── Functions/          # HTTP-triggered functions
│   ├── Models/             # Data models and DTOs
│   ├── Repositories/       # Data access layer
│   └── api.csproj
│
├── infra/terraform/        # Infrastructure as Code
│   ├── main.tf             # Main resource definitions
│   ├── variables.tf        # Input variables
│   ├── outputs.tf          # Output values
│   └── providers.tf        # Provider configuration
│
└── .github/workflows/      # CI/CD pipelines
    ├── terraform.yml       # Infrastructure deployment
    └── deploy.yml          # Application deployment
```

## 🚀 Features

- **Frontend**:
  - Home page with service offerings
  - Schedule view to see booked appointments
  - Booking form with validation
  - Contact information page
  - Responsive design

- **Backend**:
  - RESTful API with versioned routes (`/api/v1/...`)
  - GET appointments by date range
  - POST to create new appointments
  - Input validation and error handling
  - CORS enabled for local and production

- **Infrastructure**:
  - Azure Static Web App for frontend hosting
  - Azure Functions (Linux, Consumption plan) for API
  - Azure Table Storage for data persistence
  - All resources provisioned via Terraform

- **CI/CD**:
  - Automated Terraform validation and deployment
  - Automated build and deploy for web and API
  - Environment-based configuration

## 🛠️ Local Development

### Prerequisites

- **Node.js** 20+ and npm
- **.NET SDK** 8.0+
- **Azure Functions Core Tools** v4
- **Azurite** (Azure Storage Emulator) or Azure Storage Account
- **Terraform** 1.9+ (for infrastructure)

### Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env to set VITE_API_BASE_URL if needed (default: http://localhost:7071)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the api directory:
   ```bash
   cd api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Configure local settings:
   ```bash
   cp local.settings.json.example local.settings.json
   ```

4. Start Azurite (Azure Storage Emulator):
   ```bash
   # Using npm
   npm install -g azurite
   azurite --silent --location ./azurite --debug ./azurite/debug.log

   # Or using Docker
   docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite
   ```

5. Start the Azure Functions:
   ```bash
   func start
   ```

   The API will be available at `http://localhost:7071`

### Testing the Full Stack

1. Start both the frontend (port 5173) and backend (port 7071)
2. Navigate to `http://localhost:5173`
3. Go to the "Book" page and create an appointment
4. Go to the "Schedule" page to view the created appointment

## 🏗️ Infrastructure Deployment

### Prerequisites

- Azure subscription
- Azure CLI installed and logged in
- Terraform installed

### Initial Setup

1. Create a storage account for Terraform state:
   ```bash
   az group create --name rg-terraform-state --location eastus
   az storage account create --name tfstate<unique> --resource-group rg-terraform-state --location eastus --sku Standard_LRS
   az storage container create --name tfstate --account-name tfstate<unique>
   ```

2. Configure Terraform variables:
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. Initialize and apply Terraform:
   ```bash
   terraform init \
     -backend-config="resource_group_name=rg-terraform-state" \
     -backend-config="storage_account_name=tfstate<unique>" \
     -backend-config="container_name=tfstate" \
     -backend-config="key=terraform.tfstate"

   terraform plan
   terraform apply
   ```

### Manual Deployment

#### Deploy Frontend

```bash
cd web
npm run build

# Deploy to Static Web App
az staticwebapp upload \
  --name <static-web-app-name> \
  --resource-group <resource-group> \
  --app-location dist/
```

#### Deploy Backend

```bash
cd api
dotnet publish --configuration Release --output ./publish

# Deploy to Function App
func azure functionapp publish <function-app-name>
```

## 🔄 CI/CD with GitHub Actions

### Required Secrets

Configure these secrets in your GitHub repository settings:

**For Terraform:**
- `AZURE_CLIENT_ID` - Service principal client ID
- `AZURE_TENANT_ID` - Azure tenant ID
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `TF_BACKEND_RESOURCE_GROUP` - Terraform state resource group
- `TF_BACKEND_STORAGE_ACCOUNT` - Terraform state storage account
- `TF_BACKEND_CONTAINER` - Terraform state container name

**For Deployment:**
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - From Static Web App deployment tokens
- `AZURE_FUNCTION_APP_NAME` - Name of the Function App
- `API_BASE_URL` - Function App URL for frontend configuration

### Workflow Triggers

- **Terraform Workflow**: Runs on PR and push to main when Terraform files change
- **Deploy Workflow**: Runs on push to main when web or api files change

## 📡 API Endpoints

### GET /api/v1/appointments

Retrieve appointments within a date range.

**Query Parameters:**
- `from` (required): Start date in YYYY-MM-DD format
- `to` (required): End date in YYYY-MM-DD format

**Example:**
```bash
curl "http://localhost:7071/api/v1/appointments?from=2025-12-01&to=2025-12-31"
```

### POST /api/v1/appointments

Create a new appointment.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "serviceType": "Deep Clean",
  "startUtc": "2025-12-20T14:00:00Z",
  "endUtc": "2025-12-20T18:00:00Z",
  "notes": "Please bring cleaning supplies"
}
```

**Example:**
```bash
curl -X POST http://localhost:7071/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "serviceType": "Deep Clean",
    "startUtc": "2025-12-20T14:00:00Z",
    "endUtc": "2025-12-20T18:00:00Z"
  }'
```

## 🧪 Development Notes

### Using Real Azure Storage (Alternative to Azurite)

If you prefer to use a real Azure Storage account for local development:

1. Create a storage account in Azure
2. Get the connection string
3. Update `api/local.settings.json`:
   ```json
   {
     "Values": {
       "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
     }
   }
   ```

### Service Types and Durations

- **Standard Cleaning**: 2 hours
- **Deep Clean**: 4 hours
- **Move-Out Cleaning**: 6 hours

The frontend automatically calculates the end time based on the service type selected.

## 🔒 Security Considerations

- All appointments are stored with UTC timestamps
- CORS is configured for both local development and production
- Input validation on both frontend and backend
- Prevents booking appointments in the past
- Connection strings should be stored as secrets in production

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### Frontend can't connect to API
- Ensure the API is running on port 7071
- Check the `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in `api/local.settings.json`

### Azure Functions won't start
- Ensure Azurite is running or Azure Storage connection is valid
- Check that all dependencies are restored: `dotnet restore`
- Verify .NET 8 SDK is installed: `dotnet --version`

### Terraform errors
- Ensure you're logged into Azure CLI: `az login`
- Verify subscription ID is correct
- Check that backend storage account exists and is accessible
