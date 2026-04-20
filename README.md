# Github Copilot demo 

## Demo Scenarios

### To start discovering Github Copilot jump to [`The Ultimate GitHub Copilot Tutorial on MOAW`](https://aka.ms/github-copilot-hol)
<br/>


## Solution Overview


This repository has been inspired by the [Azure Container Apps: Dapr Albums Sample](https://github.com/Azure-Samples/containerapps-dapralbums)

It's used as a code base to demonstrate Github Copilot capabilities.

The solution is composed of a frontend plus backend services: the .NET album API, the TypeScript `album-api-v2` rewrite, and the NodeJS album viewer.


### Album API V2 (`album-api-v2`)

The [`album-api-v2`](./album-api-v2) is the primary local backend. It is a Node.js + TypeScript rewrite of the albums API, keeps the album collection in memory, starts on `http://localhost:3000` by default, and preserves the routes used by the Vue frontend: `GET /albums`, `GET /albums/{id}`, `POST /albums`, `PUT /albums/{id}`, `DELETE /albums/{id}`, plus `GET /albums/search` and `GET /albums/sorted`.

### Legacy Album API (`album-api`)

The [`album-api`](./album-api) is the original .NET 8 implementation kept in the repo for comparison and migration demos.

### Album Viewer (`album-viewer`)

The [`album-viewer`](./album-viewer) is a modern Vue.js 3 application built with TypeScript through which the albums retrieved by the API are surfaced. The application uses the Vue 3 Composition API with full TypeScript support for enhanced developer experience and type safety. In order to display the repository of albums, the album viewer contacts the backend album API.

## Getting Started

There are multiple ways to run this solution locally. Choose the method that best fits your development workflow.

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [TypeScript](https://www.typescriptlang.org/) (automatically installed with project dependencies)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

### Install .NET 8 Without Admin Rights

If you cannot install system-wide packages, use the local installer script:

```bash
./scripts/install-dotnet8-local.sh
```

This installs .NET to `~/.dotnet` and prints the `DOTNET_ROOT` and `PATH` lines to add to your shell profile.

### Option 1: Using VS Code Debug Panel (Recommended)

This is the easiest way to run the solution with full debugging capabilities.

1. Open the solution in Visual Studio Code
2. Open the Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
3. Select **"All services"** from the dropdown
4. Click the green play button or press F5

This will automatically:
- Start `album-api-v2` on `http://localhost:3000`
- Start the Vue.js TypeScript app on `http://localhost:3001`
- Open both services in your default browser

You can also run individual services:
- **"Node.js: Album API V2 Debug"** - Runs the TypeScript backend
- **"Node.js: Album Viewer Debug"** - Runs only the Vue.js TypeScript frontend
- **"All services (.NET)"** - Uses the legacy .NET backend instead of `album-api-v2`

### Option 2: Command Line

#### Starting the Album API V2 (Node.js + TypeScript, recommended)

```powershell
# Navigate to the API directory
cd album-api-v2

# Restore dependencies (first time only)
npm install

# Run the API in watch mode
npm run dev

# Or build and run the compiled output
npm run build
npm run start
```

The API starts on `http://localhost:3000` by default.

#### Smoke test the frontend-backend flow

With `album-api-v2` running on port `3000` and the Vue dev server running on port `3001`, run:

```bash
node scripts/smoke-album-app.mjs
```

This checks that the Vue dev server is serving HTML and that `http://localhost:3001/albums` proxies through to the backend successfully.

#### Starting the Album API (.NET legacy)

```powershell
# Navigate to the API directory
cd albums-api

# Restore dependencies (first time only)
dotnet restore

# Run the API
dotnet run
```

The API will start on `http://localhost:3000` and you can access the Swagger documentation at `http://localhost:3000/swagger`.

#### Starting the Album Viewer (Vue.js + TypeScript)

```powershell
# Navigate to the viewer directory
cd album-viewer

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# Optional: Run TypeScript type checking
npm run type-check
```

The Vue.js TypeScript app will start on `http://localhost:3001` and automatically open in your browser.

#### Running Both Services

You can run both services simultaneously using separate terminal windows:

```powershell
# Terminal 1 - Start the API
cd albums-api
dotnet run

# Terminal 2 - Start the Vue TypeScript app
cd album-viewer
npm run dev
```

### Environment Configuration

The solution uses the following default configuration:

- **Album API V2**: Runs on `http://localhost:3000`
- **Album Viewer**: Runs on `http://localhost:3001` (TypeScript + Vue 3)
- **API Endpoint**: The Vue app is configured to call the API at `localhost:3000`

If you need to change these settings, you can modify:
- API port for `album-api-v2`: `album-api-v2/src/server.ts` or the `PORT` environment variable
- Legacy .NET API port: `albums-api/Properties/launchSettings.json`
- Vue app configuration: Environment variables in `.vscode/launch.json` or set `VITE_ALBUM_API_HOST` environment variable

### Alternative: GitHub Codespaces

The easiest way is to open this solution in a GitHub Codespace, or run it locally in a devcontainer. The development environment will be automatically configured for you.

## Deploy To Azure

Use the Bicep template in [iac/bicep/main.bicep](iac/bicep/main.bicep) to deploy both services to Azure Container Apps.

### Prerequisites

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- An Azure subscription where you can create resources

### 1. Sign in and choose a subscription

```bash
az login
az account set --subscription "<your-subscription-id-or-name>"
```

### 2. Set deployment variables

```bash
RESOURCE_GROUP="rg-albums-demo"
LOCATION="eastus"
ACR_NAME="acr$(openssl rand -hex 4)"
API_IMAGE_NAME="albums-api"
VIEWER_IMAGE_NAME="album-viewer"
IMAGE_TAG="$(date +%Y%m%d%H%M%S)"
```

### 3. Create resource group and Azure Container Registry

```bash
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

az acr create \
	--resource-group "$RESOURCE_GROUP" \
	--name "$ACR_NAME" \
	--sku Standard \
	--admin-enabled true
```

### 4. Build and push both images to ACR (no local Docker required)

```bash
az acr build \
	--registry "$ACR_NAME" \
	--image "$API_IMAGE_NAME:$IMAGE_TAG" \
	--file albums-api/Dockerfile \
	albums-api

az acr build \
	--registry "$ACR_NAME" \
	--image "$VIEWER_IMAGE_NAME:$IMAGE_TAG" \
	--file album-viewer/Dockerfile \
	album-viewer
```

### 5. Deploy Azure Container Apps with Bicep

```bash
ACR_SERVER="$(az acr show -n "$ACR_NAME" -g "$RESOURCE_GROUP" --query loginServer -o tsv)"
ACR_USERNAME="$(az acr credential show -n "$ACR_NAME" --query username -o tsv)"
ACR_PASSWORD="$(az acr credential show -n "$ACR_NAME" --query passwords[0].value -o tsv)"

az deployment group create \
	--resource-group "$RESOURCE_GROUP" \
	--template-file iac/bicep/main.bicep \
	--parameters \
		registryName="$ACR_SERVER" \
		registryUsername="$ACR_USERNAME" \
		registryPassword="$ACR_PASSWORD" \
		apiImage="$ACR_SERVER/$API_IMAGE_NAME:$IMAGE_TAG" \
		viewerImage="$ACR_SERVER/$VIEWER_IMAGE_NAME:$IMAGE_TAG"
```

### 6. Get application URLs

```bash
az containerapp show -g "$RESOURCE_GROUP" -n album-api --query properties.configuration.ingress.fqdn -o tsv
az containerapp show -g "$RESOURCE_GROUP" -n album-viewer --query properties.configuration.ingress.fqdn -o tsv
```

Use the returned host names with `https://` in your browser.

### Troubleshooting

If deployment fails, check the following common issues.

#### 1. ACR authentication or image pull failures

- Ensure ACR admin credentials are enabled:

```bash
az acr update --name "$ACR_NAME" --admin-enabled true
```

- Re-read credentials before deployment:

```bash
ACR_USERNAME="$(az acr credential show -n "$ACR_NAME" --query username -o tsv)"
ACR_PASSWORD="$(az acr credential show -n "$ACR_NAME" --query passwords[0].value -o tsv)"
```

- Confirm images exist in ACR:

```bash
az acr repository list --name "$ACR_NAME" -o table
az acr repository show-tags --name "$ACR_NAME" --repository "$API_IMAGE_NAME" -o table
```

#### 2. Resource naming or regional availability issues

- ACR names must be globally unique and use only lowercase letters and numbers.
- If a region is capacity-constrained, retry with another location such as `westeurope` or `westus2`.

#### 3. Missing provider registration

If this is a new subscription, register required providers:

```bash
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.Storage
```

#### 4. Inspect deployment and Container App status

```bash
az deployment group list -g "$RESOURCE_GROUP" -o table
az deployment group show -g "$RESOURCE_GROUP" -n <deployment-name>

az containerapp revision list -g "$RESOURCE_GROUP" -n album-api -o table
az containerapp logs show -g "$RESOURCE_GROUP" -n album-api --follow
```

### Cleanup

When you are done with the environment, remove the deployed Azure resources to avoid ongoing costs.

```bash
az group delete --name "$RESOURCE_GROUP" --yes --no-wait
```

Optional: monitor deletion status.

```bash
az group exists --name "$RESOURCE_GROUP"
```

If you created additional resource groups for this demo, repeat the same command for each group.