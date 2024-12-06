# FablaRdsNodeApi

## Table of Contents
- [Description](#description)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the API](#running-the-api)
- [Project Structure](#project-structure)

## Description
This API is connected to the Retool researcher dashboard for study creation. It serves as a backend for the Fabla app, allowing studies created within the Retool dashboard to be securely shared, managed, and synchronized with the app. The API enables researchers to create and update study protocols while maintaining a streamlined data flow between the Retool dashboard and Fabla app.

## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/en/download/package-manager)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/api-evangelist/images/folder/z0bvv75/downloads)
- [Git](https://git-scm.com/downloads)

### Installation
1. Clone the repo
```bash
git clone https://github.com/AppHatchery/FablaRdsNodeApi.git
cd FablaRDSNodeApi
```

2. Install dependencies
```bash
npm install
```

### Configuration
- Create a `.env` file in the root directory with the following variables
- Actual variable values are in the `FablaRDSNodeApi` lambda function in AWS
```env
API_KEY_1 = value
API_KEY_2 = value
API_KEY_3 = value

DB_HOST = db_url
DB_USERNAME = username
DB_DBNAME = db name
DB_PASSWORD = password

SECRETS_URL = url

API_KEY = key
  ```

## Running the API
### Dev
Start the server in development mode using of the two:
```bash
nodemon index.mjs
node index.mjs
```
## Project Structure

```
project-root/
│
├── auth/
│   ├── apiAuthMiddleware.mjs       # Middleware for handling API authentication
│   └── keymanager.mjs               # Key management for secure access and token handling
│
├── controller/
│   ├── protocol.controller.mjs      # Controller for handling protocol-related logic and endpoints
│   └── researcher.controller.mjs    # Controller for managing researcher-related actions and endpoints
│
├── database/
│   └── index.mjs                    
│
├── helper/
│   ├── processDiaries.mjs           # Functions for processing and managing diary data
│   ├── queries.mjs                  # Database queries for retrieving or updating data
│   ├── secrets.mjs                  # Handles sensitive information and secure storage
│   └── timeutils.mjs                # Utilities for managing time calculations and formatting
│
├── routes/
│   ├── protocol.router.mjs          # Router to manage protocol-related routes
│   └── researcher.router.mjs        # Router for researcher-related endpoints
│
└──
```

