// API Configuration
// IMPORTANT: Replace with your actual OpenAI API key
// For production, consider using expo-secure-store or environment variables

export const API_CONFIG = {
  // Get your API key from: https://platform.openai.com/api-keys
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  // Optional: Change the model (gpt-3.5-turbo is faster and cheaper)
  OPENAI_MODEL: 'gpt-5', // or 'gpt-4' for better quality
  
  // API endpoints
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
};

// Validation helper
export const validateApiConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!API_CONFIG.OPENAI_API_KEY || API_CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
    errors.push('OpenAI API key is not configured');
  }
  
  if (!API_CONFIG.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OpenAI API key format is invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
