/**
 * Helper function to check if an origin is allowed for CORS
 * This matches the logic in server.ts CORS configuration
 */
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) {
    return true; // Allow requests with no origin
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // In development, allow any localhost port
  if (!isProduction) {
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('https://localhost:')
    ) {
      return true;
    }
  }

  // In production, check against allowed origins
  if (isProduction) {
    // Get allowed origins from environment variable (comma-separated)
    const frontendUrl = process.env.FRONTEND_URL || '';
    const allowedOrigins = frontendUrl
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // Default production origins
    const defaultOrigins = [
      'https://www.speeup.com',
      'https://speeup.com',
    ];

    const allAllowedOrigins = allowedOrigins.length > 0
      ? [...allowedOrigins, ...defaultOrigins]
      : defaultOrigins;

    // Check if origin matches any allowed origin
    return allAllowedOrigins.some((allowedOrigin) => {
      // Exact match
      if (origin === allowedOrigin) return true;
      // Support for www and non-www variants
      if (allowedOrigin.includes('www.')) {
        const nonWww = allowedOrigin.replace('www.', '');
        if (origin === nonWww) return true;
      } else {
        const withWww = allowedOrigin.replace(/^(https?:\/\/)/, '$1www.');
        if (origin === withWww) return true;
      }
      return false;
    });
  }

  return false;
};

/**
 * Helper function to set CORS headers on a response
 */
export const setCorsHeaders = (res: any, origin: string | undefined): void => {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
};

