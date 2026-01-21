# TRAB Case Repository Frontend - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd /Users/mwendavano/trab/case-repository-frontend
npm install
```

### Step 2: Configure API
The API is already configured to connect to `http://localhost:3000/api/v1`. If your backend is running on a different port, update `src/utils/Config.js`.

### Step 3: Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## What You Can Do

### 1. Search Cases
Navigate to **Search Cases** in the sidebar or go to `/search`:
- Try searching for "customs excise" or "limitation period"
- Switch between Hybrid, Full-Text, and Semantic search
- Adjust search weights for hybrid mode
- View detailed case information

### 2. Manage OCR Processing
Navigate to **OCR Management** or go to `/ocr`:
- View queue statistics (waiting, active, completed, failed)
- Monitor document processing status
- Process all pending documents
- Reprocess failed documents
- View job details and progress

### 3. Sync from TRAIS
Navigate to **Sync from TRAIS** or go to `/sync`:
- Enter a TRAIS Appeal ID (e.g., 46575)
- Click "Sync Appeal" to import case data
- View sync history

### 4. View Case Details
Click "View Full Case Details" on any search result to see:
- Complete case metadata
- Party information
- Important dates
- Board members
- Financial details

## Default Routes

- `/` - Redirects to Search
- `/search` - Main search interface
- `/ocr` - OCR management dashboard
- `/sync` - TRAIS sync interface
- `/case/:id` - Case details view
- `/dashboard` - Original dashboard

## API Requirements

Make sure the TRAB Case Repository Backend API is running:
```bash
# In your backend directory
npm run start:dev
```

The API should be accessible at `http://localhost:3000/api/v1`

## Testing the Application

### Test Search Functionality
1. Go to `/search`
2. Enter a search query (e.g., "tax revenue")
3. Try different search types
4. Adjust weights for hybrid search
5. Click on a result to view details

### Test OCR Management
1. Go to `/ocr`
2. View current queue statistics
3. Click "Process All Pending" if there are pending documents
4. Monitor progress in the jobs table
5. Watch auto-refresh update stats every 5 seconds

### Test TRAIS Sync
1. Go to `/sync`
2. Enter an appeal ID (e.g., 46575)
3. Click "Sync Appeal"
4. Check sync history for status

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and fix code
npm run lint
```

## Troubleshooting

**Cannot connect to API**
- Check if backend is running on port 3000
- Verify `src/utils/Config.js` has correct API_BASE_URL
- Check browser console for CORS errors

**OCR stats not updating**
- Ensure OCR service is running in backend
- Check network tab for failed requests

**No search results**
- Verify documents are indexed in database
- Try different search modes
- Check API response in network tab

## Next Steps

1. **Customize the UI**: Edit PrimeVue theme in `src/main.js`
2. **Add Authentication**: Integrate with your auth system
3. **Extend Functionality**: Add more features like:
   - Advanced filters (date range, case type)
   - Export functionality (PDF, CSV)
   - Analytics dashboard
   - Document preview

## Project Structure Overview

```
src/
├── views/
│   ├── SearchCases.vue       # Main search interface
│   ├── OcrManagement.vue     # OCR dashboard
│   ├── SyncManagement.vue    # TRAIS sync
│   └── CaseDetails.vue       # Case details
├── service/
│   ├── SearchService.js      # Search API
│   ├── OcrService.js         # OCR API
│   └── SyncService.js        # Sync API
└── utils/
    └── Config.js             # API configuration
```

## Support

For detailed documentation, see [README.md](README.md)

For API documentation, refer to the backend API documentation.

---

**Happy Coding!**
