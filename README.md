# TRAB Case Repository Frontend

A modern Vue.js frontend application for the Tax Revenue Appeals Board (TRAB) Case Repository. This application provides advanced search capabilities, OCR management, and integration with the TRAIS system.

## Features

- **Hybrid Search**: Combines full-text and semantic search for optimal results
- **Advanced Filtering**: Search by case type, status, date ranges, and more
- **OCR Management**: Monitor and manage document OCR processing with real-time queue statistics
- **TRAIS Integration**: Sync case metadata and documents from TRAIS API
- **Case Details**: View comprehensive case information including parties, board members, and financial details
- **Responsive Design**: Built with Tailwind CSS and PrimeVue for a modern, responsive UI

## Technology Stack

- **Framework**: Vue 3.4+
- **Build Tool**: Vite 5.3+
- **UI Library**: PrimeVue 4.0+ with Aura theme
- **Styling**: Tailwind CSS 3.4+
- **HTTP Client**: Axios 1.7+
- **Router**: Vue Router 4.4+
- **Charts**: Chart.js 3.3+

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- TRAB Case Repository Backend API running on `http://localhost:3000`

## Installation

1. **Clone the repository**
   ```bash
   cd /Users/mwendavano/trab/case-repository-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   Edit `src/utils/Config.js`:
   ```javascript
   export const Config = {
       API_BASE_URL: 'http://localhost:3000/api/v1',
   };
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── assets/              # Static assets (images, styles)
├── components/          # Reusable Vue components
├── layout/             # Layout components (AppLayout, AppMenu, etc.)
├── router/             # Vue Router configuration
├── service/            # API service layer
│   ├── SearchService.js    # Search API endpoints
│   ├── OcrService.js       # OCR API endpoints
│   └── SyncService.js      # TRAIS sync endpoints
├── utils/              # Utility functions and config
│   └── Config.js       # API configuration
└── views/              # Page components
    ├── SearchCases.vue        # Main search interface
    ├── CaseDetails.vue        # Case details view
    ├── OcrManagement.vue      # OCR dashboard
    └── SyncManagement.vue     # TRAIS sync interface
```

## Key Features

### 1. Search Cases (`/search`)

The search interface provides three search modes:
- **Hybrid Search** (Recommended): Combines full-text and semantic search with configurable weights
- **Full-Text Search**: Fast keyword matching
- **Semantic Search**: Meaning-based search for natural language queries

**Features:**
- Adjustable search weights for hybrid mode
- Real-time search results
- Case metadata display (case number, parties, amounts, outcomes)
- Direct link to case details
- Execution time metrics

### 2. OCR Management (`/ocr`)

Monitor and manage OCR processing:
- Real-time queue statistics (waiting, active, completed, failed)
- Document processing statistics
- Job history with progress tracking
- Reprocess failed documents
- Auto-refresh every 5 seconds

### 3. TRAIS Sync (`/sync`)

Sync cases from TRAIS:
- Sync individual appeals by ID
- Sync history tracking
- Success/failure notifications

### 4. Case Details (`/case/:id`)

Comprehensive case information:
- Case metadata (number, type, status, outcome)
- Party information (appellant, respondent)
- Important dates (filing, hearing, decision)
- Board members and chairperson
- Financial details (tax amount disputed)

## API Integration

The application integrates with the TRAB Case Repository API. See the [API Documentation](API_DOCUMENTATION.md) for endpoint details.

### Service Layer

All API calls are abstracted through service classes:

**SearchService.js**
```javascript
SearchService.hybridSearch(query, limit, ftWeight, semWeight)
SearchService.fullTextSearch(query, limit)
SearchService.semanticSearch(query, limit)
```

**OcrService.js**
```javascript
OcrService.processPendingDocuments()
OcrService.processDocument(documentId)
OcrService.reprocessDocument(documentId)
OcrService.getQueueStats()
OcrService.getDocumentStats()
```

**SyncService.js**
```javascript
SyncService.syncAppeal(appealId)
```

## Configuration

### API Base URL

Update `src/utils/Config.js`:
```javascript
export const Config = {
    API_BASE_URL: 'http://localhost:3000/api/v1',
    // For production:
    // API_BASE_URL: 'https://your-production-url.com/api/v1',
};
```

### Theme Customization

The application uses PrimeVue Aura theme with Tailwind CSS. Customize in:
- `tailwind.config.js` - Tailwind configuration
- `src/main.js` - PrimeVue theme settings

## Performance Features

- **Code Splitting**: Routes are lazy-loaded for optimal performance
- **Auto-refresh**: OCR dashboard auto-refreshes queue stats
- **Optimized Search**: Debounced search input to reduce API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

**Issue: API connection errors**
- Ensure the backend API is running on `http://localhost:3000`
- Check CORS configuration on the backend
- Verify API_BASE_URL in `src/utils/Config.js`

**Issue: OCR stats not updating**
- Check network tab for failed requests
- Verify OCR service is running
- Check browser console for errors

**Issue: Search returns no results**
- Verify documents are indexed in the database
- Check search query syntax
- Try different search modes (hybrid vs full-text)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

See LICENSE.md for details.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## Changelog

### Version 1.0.0 (2026-01-21)
- Initial release
- Hybrid search implementation
- OCR management dashboard
- TRAIS sync integration
- Case details view
- Responsive design with PrimeVue + Tailwind

---

**Project**: TRAB Case Repository Frontend
**Version**: 1.0.0
**Framework**: Vue.js 3.4+ with Vite
**Last Updated**: January 21, 2026
# trab-case-repository-frontend
