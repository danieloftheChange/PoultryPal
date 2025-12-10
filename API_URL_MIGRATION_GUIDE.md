# API URL Configuration Migration Guide

## Overview
All hardcoded API URLs (`http://92.112.180.180:3000`) have been replaced with environment variable-based configuration, making it easy to switch between development and production environments.

## Changes Made

### 1. Web Application (`Web-App/`)

#### Created New Configuration File
- **File**: `Web-App/src/config/api.ts`
- **Purpose**: Centralized API URL management
- **Exports**:
  - `getApiUrl(endpoint)`: Helper function to construct full API URLs
  - `API_URL`: Full API base URL with `/api/v1`
  - `API_URL_BASE`: Base URL without `/api/v1`
  - `API_VERSION`: API version path

#### Updated Environment Files
- **Files**: `Web-App/.env` and `Web-App/.env.example`
- **Variable**: `VITE_API_BASE_URL`
- **Default**: `http://localhost:3000/api/v1` (development)
- **Production**: `http://92.112.180.180:3000/api/v1`

#### Updated Files (17 files, 49 replacements)
All hardcoded API URLs have been replaced with `getApiUrl()` function:

1. **Authentication Pages**
   - `src/pages/signup.tsx` (1 replacement)
   - `src/pages/login.tsx` (1 replacement)

2. **Main Pages**
   - `src/pages/birds.tsx` (5 replacements)
   - `src/pages/stock.tsx` (7 replacements)
   - `src/pages/staff.tsx` (4 replacements)
   - `src/pages/settings.tsx` (3 replacements)
   - `src/pages/production.tsx` (6 replacements)
   - `src/pages/immunization.tsx` (2 replacements)
   - `src/pages/dashBoard.tsx` (4 replacements)

3. **House Management**
   - `src/pages/houses/houses.tsx` (5 replacements)
   - `src/pages/houses/houseDetails.tsx` (10 replacements)

4. **Diagnosis**
   - `src/pages/diagnosis/diagnosis.tsx` (3 replacements)
   - `src/pages/diagnosis/diagnosisDetails.tsx` (2 replacements)

5. **Feed Formula**
   - `src/pages/feed-formula/index.tsx` (3 replacements)
   - `src/components/feed-formula/FormulaForm.tsx` (1 replacement)

6. **Components**
   - `src/components/birdCountUpdateDialog.tsx` (1 replacement)

### 2. Backend API (`API/`)

#### Updated Configuration
- **File**: `API/config/swagger.js`
- **Change**: Replaced hardcoded URL with environment variable
- **Variable**: `SWAGGER_SERVER_URL`
- **Default**: `http://localhost:3000/api/v1`

#### Updated Environment Files
- **File**: `API/.env.example`
- **Added Variable**: `SWAGGER_SERVER_URL`

## How to Use

### For Development (Local)

1. **Web Application**:
   ```bash
   cd Web-App
   # Make sure .env file exists (copy from .env.example if needed)
   # Ensure VITE_API_BASE_URL is set to:
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

2. **Backend API**:
   ```bash
   cd API
   # Make sure .env file exists (copy from .env.example if needed)
   # Ensure SWAGGER_SERVER_URL is set to:
   SWAGGER_SERVER_URL=http://localhost:3000/api/v1
   ```

3. **Start the backend server**:
   ```bash
   cd API
   npm run dev
   ```

4. **Start the frontend**:
   ```bash
   cd Web-App
   npm run dev
   ```

### For Production

1. **Web Application**:
   ```bash
   # Update .env file:
   VITE_API_BASE_URL=http://92.112.180.180:3000/api/v1
   ```

2. **Backend API**:
   ```bash
   # Update .env file:
   SWAGGER_SERVER_URL=http://92.112.180.180:3000/api/v1
   ```

3. **Rebuild and deploy**:
   ```bash
   cd Web-App
   npm run build
   # Deploy the dist/ folder
   ```

## Benefits

1. **Easy Environment Switching**: Change between development and production by updating a single environment variable
2. **No Code Changes Required**: Switch environments without modifying source code
3. **Centralized Configuration**: All API URLs managed in one place
4. **Better Maintenance**: Future API URL changes only require updating the config file
5. **Team Collaboration**: Team members can use different API endpoints without conflicts

## Migration Verification

All hardcoded API URLs have been successfully replaced. The only remaining occurrences of `92.112.180.180` are:
- Documentation comments in `.env` files (intentional)
- One commented-out line in `diagnosis.tsx` (inactive code)

## Code Examples

### Before Migration
```typescript
await axios.post('http://92.112.180.180:3000/api/v1/user/signup', data);
const response = await fetch('http://92.112.180.180:3000/api/v1/batch');
```

### After Migration
```typescript
import { getApiUrl } from '@/config/api';

await axios.post(getApiUrl('user/signup'), data);
const response = await fetch(getApiUrl('batch'));
```

### With Dynamic IDs
```typescript
// Before
await fetch(`http://92.112.180.180:3000/api/v1/batch/${id}`);

// After
import { getApiUrl } from '@/config/api';
await fetch(getApiUrl(`batch/${id}`));
```

## Troubleshooting

### Issue: "Cannot connect to server"
**Solution**:
1. Check that backend server is running on the configured port
2. Verify `VITE_API_BASE_URL` in Web-App/.env matches your backend server address
3. Ensure CORS is properly configured in the backend

### Issue: API calls going to wrong URL
**Solution**:
1. Check the `.env` file has the correct `VITE_API_BASE_URL` value
2. Restart the development server after changing `.env` files
3. Clear browser cache and rebuild the application

### Issue: Swagger documentation not loading
**Solution**:
1. Check `SWAGGER_SERVER_URL` in API/.env
2. Restart the backend server after changing `.env` files

## Next Steps

1. **Test the application thoroughly** in both development and production environments
2. **Update deployment scripts** to use appropriate environment variables
3. **Document the setup process** for new team members
4. **Consider adding** additional environments (staging, testing, etc.)

## Notes

- The frontend uses Vite, so all environment variables must be prefixed with `VITE_`
- Changes to `.env` files require restarting the development server
- Never commit actual `.env` files to version control - only `.env.example` files
- Production environment variables should be set in your deployment platform (Vercel, Netlify, etc.)
