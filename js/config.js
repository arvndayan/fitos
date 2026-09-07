// Set this to your deployed backend URL when available.
// Example: https://api.your-fitos-domain.com
export const FITOS_API_BASE =
  window.FITOS_API_BASE ||
  localStorage.getItem('fitos-api-base') ||
  '';
