# CATT - College Attendance Tracking Tool

## Environment Setup

This project uses environment variables to secure sensitive configuration like API URLs.

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set your actual API URL:
   ```
   VITE_API_BASE_URL=https://your-actual-api-url.com
   ```

### Environment Variables

- `VITE_API_BASE_URL`: The base URL for your API endpoints

### Security Notes

- The `.env` file is automatically ignored by Git to prevent sensitive data from being committed
- Never commit your actual `.env` file to version control
- Use `.env.example` as a template for other developers