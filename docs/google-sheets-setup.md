# Google Sheets & Drive Setup Guide

This app uses Google Sheets to store check-in data and Google Drive to generate PDF reports.

### 1. The Apps Script Code
Apply this code in your [Google Apps Script editor](https://script.google.com) (Extensions > Apps Script).

```javascript
/**
 * Google Apps Script for SEL Student Assistant
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data;
  
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("Error: Invalid JSON").setMimeType(ContentService.MimeType.TEXT);
  }
  
  // 1. Setup headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "studentName", "date", "emotion", "intensity", 
      "description", "bodyScan", "needs", "postEmotion", "postIntensity", "aiReport"
    ]);
  }
  
  // 2. Append Data
  var now = new Date();
  var dateOnly = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
  
  sheet.appendRow([
    data.timestamp ? data.timestamp.split('T')[0] : dateOnly,
    data.studentName || "Anonymous",
    data.date ? data.date.split('T')[0] : dateOnly,
    data.emotion || "",
    data.intensity || 0,
    data.description || "",
    data.bodyScan || "",
    data.needs || "",
    data.postEmotion || "",
    data.postIntensity || 0,
    data.aiReport || ""
  ]);
  
  // 3. Generate PDF Report in Drive
  try {
    createDriveReport(data);
  } catch (err) {
    console.error("Drive report failed: " + err);
    var logSheet = getLogSheet();
    logSheet.appendRow([new Date(), "ERROR", "PDF Generation Failed: " + err.toString()]);
  }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var record = {};
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j] || ("Column" + (j+1));
      record[headerName] = row[j];
    }
    data.push(record);
  }
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function createDriveReport(data) {
  try {
    var folderName = "SEL Student Reports";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var student = data.studentName || "Student";
    var now = new Date();
    var defaultDate = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
    var displayDate = data.date ? data.date.split('T')[0] : defaultDate;
    
    var fileName = "Report_" + student + "_" + displayDate;
    
    // Create a temp Doc
    var doc = DocumentApp.create("TEMP_" + fileName);
    var body = doc.getBody();
    
    // --- 1. TITLE / 标题 ---
    var title = body.appendParagraph("Student Check-in Report / 学生签到报告");
    title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setAttributes({
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#27ae60', // Green
      [DocumentApp.Attribute.FONT_SIZE]: 20,
      [DocumentApp.Attribute.BOLD]: true
    });
    body.appendHorizontalRule();

    // --- 2. INFO BOX / 信息概览 ---
    var infoTable = body.appendTable([
      ["Student / 学生: " + student, "Date / 日期: " + displayDate],
      ["Initial Emotion / 初始情绪: " + (data.emotion || "N/A"), "Intensity / 强度: " + (data.intensity || 0) + " / 10"]
    ]);
    infoTable.setBorderWidth(0);
    // Background and cell styling
    for(var r=0; r<2; r++) {
      for(var c=0; c<2; c++) {
        var cell = infoTable.getCell(r, c);
        cell.setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 10,
          [DocumentApp.Attribute.FOREGROUND_COLOR]: '#34495e',
        });
      }
    }
    body.appendParagraph("").setSpacingAfter(10);

    // --- 3. SECTIONS WITH DECORATION ---
    appendStyledSection(body, "What Happened / 发生了什么", data.description || "No context provided.");
    appendStyledSection(body, "Body Scan / 身体扫描", data.bodyScan || "None reported.");
    appendStyledSection(body, "Needs & Hopes / 需求与希望", data.needs || "No needs mentioned.");

    if (data.postEmotion) {
       appendStyledSection(body, "Regulation Progress / 调节进度", 
         "Post-Emotion: " + data.postEmotion + " | New Intensity: " + (data.postIntensity || 0) + "/10");
    }

    // --- 4. AI REPORT / AI 报告 (Yellow Dashed Box) ---
    if (data.aiReport) {
       body.appendParagraph("Generated Report / 报告").setAttributes({
         [DocumentApp.Attribute.BOLD]: true,
         [DocumentApp.Attribute.FONT_SIZE]: 14,
         [DocumentApp.Attribute.FOREGROUND_COLOR]: '#27ae60'
       }).setSpacingBefore(10);
       
       var aiTable = body.appendTable([[data.aiReport]]);
       aiTable.setBorderWidth(1);
       aiTable.setBorderColor('#f1c40f'); // Yellow
       var aiCell = aiTable.getCell(0, 0);
       aiCell.setBackgroundColor('#fffdf0'); // Light yellow
       aiCell.setAttributes({
         [DocumentApp.Attribute.ITALIC]: true,
         [DocumentApp.Attribute.FONT_SIZE]: 11,
         [DocumentApp.Attribute.FOREGROUND_COLOR]: '#2c3e50',
         [DocumentApp.Attribute.PADDING_LEFT]: 10,
         [DocumentApp.Attribute.PADDING_RIGHT]: 10,
         [DocumentApp.Attribute.PADDING_TOP]: 10,
         [DocumentApp.Attribute.PADDING_BOTTOM]: 10
       });
    }
    
    doc.saveAndClose();
    
    // Convert to PDF
    var docFile = DriveApp.getFileById(doc.getId());
    var pdfBlob = docFile.getAs('application/pdf');
    var pdfFile = folder.createFile(pdfBlob);
    pdfFile.setName(fileName + ".pdf");
    
    // Clean up
    docFile.setTrashed(true);
    
    getLogSheet().appendRow([new Date(), "SUCCESS", "Generated Style Report for " + student]);
  } catch (e) {
    throw e;
  }
}

/**
 * Appends a section with a distinctive green side border style
 */
function appendStyledSection(body, title, content) {
  var pTitle = body.appendParagraph("┃ " + title);
  pTitle.setAttributes({
    [DocumentApp.Attribute.BOLD]: true,
    [DocumentApp.Attribute.FONT_SIZE]: 12,
    [DocumentApp.Attribute.FOREGROUND_COLOR]: '#27ae60'
  });
  pTitle.setSpacingBefore(10);
  
  // Handle multi-line content (like Needs, Hopes, and AI Report)
  var lines = content.toString().split('\n');
  lines.forEach(function(line) {
    var pContent = body.appendParagraph(line);
    pContent.setAttributes({
      [DocumentApp.Attribute.FONT_SIZE]: 10,
      [DocumentApp.Attribute.FOREGROUND_COLOR]: '#2c3e50'
    });
    pContent.setSpacingAfter(line.trim().length > 0 ? 2 : 0);
  });
}

/**
 * 🧪 MANUAL TEST FUNCTION
 * Select "manualTestReport" from the dropdown and click "Run".
 * This will generate a report in your Google Drive instantly.
 */
function manualTestReport() {
  var now = new Date();
  var dateOnly = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
  
  var testData = {
    studentName: "Test Student (Manual)",
    date: dateOnly,
    emotion: "Happy / 开心",
    intensity: 8,
    description: "I had a great lesson today and learned something new!",
    bodyScan: "Head: Warm",
    needs: "Need: Connection\nHope: To share my learning\nCare: To rest well",
    postEmotion: "Excited / 兴奋",
    postIntensity: 9,
    aiReport: "The student is showing high engagement and positive self-awareness. Their physical sensations correlate with the reported positive emotions.\n\n学生展示了高度的参与感和积极的自我意识。他们的身体感觉与报告的正向情绪相关联。"
  };
  
  createDriveReport(testData);
  Logger.log("✅ Test report generated! Check your 'SEL Student Reports' folder in Google Drive.");
}

function getLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Logs") || ss.insertSheet("Logs");
}

/**
 * ⚠️ CRITICAL STEP: Run this once first!
 * Select this function in the top bar and click "Run".
 * This triggers the permissions prompt for Google Drive.
 */
function triggerPermissions() {
  DriveApp.getRootFolder();
  DocumentApp.create("Permission Test");
}
```

### 2. How to Fix "Permission" or "Not Found" Errors
If you see errors about "DriveApp" or "createFolder" permissions, follow this exactly:

1.  **Authorize:** In the Apps Script editor, select `triggerPermissions` in the top dropdown and click **Run**. Follow all prompts to "Allow".
2.  **Delete Old Deployment:** Click **Deploy** > **Manage deployments**. Delete (click the trash icon) all existing deployments.
3.  **New Deployment:** Click **Deploy** > **New deployment**.
    -   Select type: **Web app**.
    -   Execute as: **Me** (your email).
    -   Who has access: **Anyone**.
    -   Click **Deploy**.
4.  **Update URL:** Copy the **NEW Web App URL** and replace your existing `NEXT_PUBLIC_GOOGLE_SHEETS_URL` in the AI Studio settings.

### 3. Verification Checklist
-   [ ] Does the Dashboard show "Unknown"? Change your Sheet headers to `studentName`, `date`, `emotion`.
-   [ ] Are reports missing? Check the **Logs** tab in your Google Sheet for error details.
-   [ ] Did you update the URL? Every time you change the Apps Script code, you MUST create a **New Deployment** to see the changes.
