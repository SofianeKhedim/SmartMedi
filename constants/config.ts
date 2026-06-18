// App-wide configuration.
//
// The Gemini API key is read from the EXPO_PUBLIC_GEMINI_API_KEY environment
// variable (see .env / .env.example). It must NOT be hardcoded in source.
// A key entered at runtime in the app (stored in AsyncStorage) takes
// precedence over this one — see ChatbotService.
export const GEMINI_API_KEY: string = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

// Current, generally-available Gemini model. "gemini-pro" was retired.
export const GEMINI_MODEL = 'gemini-2.5-flash';
