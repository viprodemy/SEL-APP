'use server';

/**
 * Server action to sync check-in data to Google Sheets.
 * Bypasses CORS and allows for better error handling.
 */
export async function syncCheckinToSheets(data: any, aiReport?: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
  
  if (!webhookUrl) {
    console.error("Google Sheets URL not configured in environment variables");
    return { success: false, error: "Configuration missing" };
  }

  const klTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());

  const payload = {
    timestamp: klTime,
    studentName: data.student,
    date: data.date ? new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(data.date)) : klTime,
    emotion: data.emotion,
    intensity: data.intensity,
    description: data.description,
    bodyScan: Array.isArray(data.bodyScan) ? data.bodyScan.join(', ') : String(data.bodyScan),
    needs: typeof data.needs === 'object' ? `Need: ${data.needs.need}\nHope: ${data.needs.hope}\nCare: ${data.needs.selfCare}` : String(data.needs),
    postEmotion: data.postCoolDownEmotion || '',
    postIntensity: data.postCoolDownIntensity || 0,
    loggedInUser: data.loggedInUser || 'Anonymous',
    aiReport: aiReport || '', // New field for AI analysis
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain', // Apps Script doPost expects text/plain or application/json
      },
    });

    // Note: fetch to Apps Script Web App often returns a redirect (302)
    // and if the redirect is followed, it returns the content.
    // 'no-cors' on client side hides this, but server-side fetch handles it.
    
    if (!response.ok) {
       // Check if it's actually success (Apps Script sometimes returns weird statuses if not handled well)
       const text = await response.text();
       if (text.includes("Success")) {
         return { success: true };
       }
       throw new Error(`Failed to sync to Sheets: ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in syncCheckinToSheets:", error);
    return { success: false, error: error.message };
  }
}
