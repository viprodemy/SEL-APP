'use server';

/**
 * Server action to fetch data from Google Sheets Apps Script.
 * Bypasses CORS issues that occur in the browser.
 */
export async function fetchCheckinsFromSheets() {
  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
  
  if (!webhookUrl) {
    console.error("Google Sheets URL not configured in environment variables");
    return { success: false, error: "Configuration missing" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
      next: { revalidate: 0 } // Disable caching for fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Sheets: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in fetchCheckinsFromSheets:", error);
    return { success: false, error: error.message };
  }
}
