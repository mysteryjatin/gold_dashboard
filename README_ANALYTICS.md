# Analytics Configuration

The Analytics dashboard can fetch page views from an external digital marketing API.

## Configuration

Add the following environment variables to your `.env` file in the `dashboard` directory:

```env
# Digital Marketing API Configuration (for Page Views)
DIGITAL_MARKETING_API_URL=https://your-api-endpoint.com/api/page-views
DIGITAL_MARKETING_API_KEY=your-api-key-here
```

### Environment Variables

- **DIGITAL_MARKETING_API_URL** (Required): The base URL of your digital marketing API endpoint
  - Example: `https://api.example.com/analytics/page-views`
  - The API will be called with query parameters: `?startDate=YYYY-MM-DDTHH:mm:ss.sssZ&endDate=YYYY-MM-DDTHH:mm:ss.sssZ`

- **DIGITAL_MARKETING_API_KEY** (Optional): API key for authentication
  - If provided, it will be sent as `Authorization: Bearer {key}` header
  - Also sent as `X-API-Key: {key}` header for compatibility

## API Response Format

The API should return JSON data with page views. The system supports multiple response formats:

### Supported Response Fields:
- `pageViews` (preferred)
- `totalViews`
- `views`
- `current`
- `count`

**Example Response:**
```json
{
  "pageViews": 124500
}
```

or

```json
{
  "totalViews": 124500
}
```

## API Request Format

The API will receive GET requests with query parameters:

```
GET {DIGITAL_MARKETING_API_URL}?startDate=2026-02-01T00:00:00.000Z&endDate=2026-02-20T23:59:59.999Z
```

### Headers:
- `Content-Type: application/json`
- `Authorization: Bearer {DIGITAL_MARKETING_API_KEY}` (if API key is configured)
- `X-API-Key: {DIGITAL_MARKETING_API_KEY}` (if API key is configured)

## Fallback Behavior

If the external API is:
- Not configured (`DIGITAL_MARKETING_API_URL` is not set)
- Unavailable (network error, timeout, etc.)
- Returns an error response

The system will automatically fall back to an estimated calculation based on:
- Unique customers from orders
- Total number of orders
- Formula: `(unique customers × 3) + (total orders × 2)`

## Timeout

API requests have a 10-second timeout. If the request takes longer, it will abort and fall back to the estimated calculation.

## Testing

To test if your API is working:

1. Set the environment variables in your `.env` file
2. Restart your development server
3. Navigate to the Analytics page in the dashboard
4. Check the browser console for any API errors
5. Verify that page views are showing real data from your API

If you see "Falling back to estimated calculation" in the console, check:
- API URL is correct
- API key is valid (if required)
- API endpoint is accessible from your server
- API returns data in one of the supported formats
