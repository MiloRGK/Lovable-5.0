// Robust JSON parsing utility for GPT-5 responses

export function parseJsonSafely(text: string, fallback: any = {}): any {
  if (!text || text.trim() === '') {
    return fallback;
  }

  try {
    // First attempt: direct parsing
    return JSON.parse(text);
  } catch (error) {
    console.log('[JSON Parser] Direct parse failed, attempting to clean and extract JSON...');
    
    try {
      // Second attempt: extract JSON between braces
      let cleanText = text.trim();
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        
        // Try direct parse of extracted JSON
        try {
          return JSON.parse(cleanText);
        } catch (innerError) {
          // Third attempt: clean common JSON issues
          cleanText = cleanJson(cleanText);
          return JSON.parse(cleanText);
        }
      } else {
        console.log('[JSON Parser] No valid JSON structure found');
        return fallback;
      }
    } catch (secondError) {
      console.log('[JSON Parser] All parsing attempts failed:', secondError);
      return fallback;
    }
  }
}

function cleanJson(text: string): string {
  // Fix common JSON issues
  return text
    // Fix unescaped quotes in strings (basic approach)
    .replace(/([^\\])"([^":\],}]*)"([^:\],}])/g, '$1\\"$2\\"$3')
    // Fix unescaped newlines and tabs in strings
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix single quotes (convert to double quotes, basic approach)
    .replace(/'/g, '"')
    // Fix common property name issues (unquoted keys)
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
}