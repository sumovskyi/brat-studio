// ================================================
// BRAT Studio - Form Handler
// Google Sheets integration via Google Apps Script
// ================================================

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create a Google Apps Script project at https://script.google.com
 * 2. Paste the following code into the Apps Script editor:
 * 
 * ------- GOOGLE APPS SCRIPT CODE (copy this to Apps Script) -------
 * 
 * const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
 * const NOTIFICATION_EMAIL = 'your-email@example.com';
 * 
 * function doPost(e) {
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
 *     
 *     // Add timestamp
 *     data.timestamp = new Date().toISOString();
 *     
 *     // Get headers or create them
 *     let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
 *     if (headers[0] === '') {
 *       headers = Object.keys(data);
 *       sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
 *     }
 *     
 *     // Add row
 *     const row = headers.map(h => data[h] || '');
 *     sheet.appendRow(row);
 *     
 *     // Send email notification
 *     const subject = `New Lead: ${data.name || 'Unknown'} - ${data.program || 'General'}`;
 *     const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
 *     MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
 *     
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ success: true }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (error) {
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ success: false, error: error.message }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * 
 * ------- END GOOGLE APPS SCRIPT CODE -------
 * 
 * 3. Deploy as Web App:
 *    - Click Deploy → New deployment
 *    - Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy the Web App URL
 * 
 * 4. Replace GOOGLE_SCRIPT_URL below with your deployment URL
 */

// Configuration
const CONFIG = {
    // Replace this with your Google Apps Script Web App URL after deployment
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',

    // Redirect URL after successful submission
    SUCCESS_REDIRECT: 'payment.html',

    // Form IDs to handle
    FORMS: ['booking-form', 'corporate-form', 'courses-waitlist']
};

// Initialize form handlers
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.FORMS.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            initFormHandler(form);
        }
    });
});

/**
 * Initialize form submission handler
 */
function initFormHandler(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Add metadata
            data.form_source = form.id;
            data.page_url = window.location.href;
            data.submitted_at = new Date().toISOString();

            // Check if Google Script URL is configured
            if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
                // Demo mode - just log and redirect
                console.log('Form data (demo mode):', data);
                showSuccess(form, 'Demo mode: Form submitted!');

                // Redirect after short delay
                setTimeout(() => {
                    if (form.id !== 'courses-waitlist') {
                        window.location.href = CONFIG.SUCCESS_REDIRECT;
                    }
                }, 1500);
                return;
            }

            // Send to Google Apps Script
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Success
            showSuccess(form, 'Thank you! We\'ll be in touch soon.');

            // Redirect for booking forms
            if (form.id !== 'courses-waitlist') {
                setTimeout(() => {
                    window.location.href = CONFIG.SUCCESS_REDIRECT;
                }, 1500);
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showError(form, 'Something went wrong. Please try again or email us directly.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Show success message
 */
function showSuccess(form, message) {
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message form-message--success';
    msg.style.cssText = `
    padding: 1rem;
    margin-top: 1rem;
    background: rgba(60, 80, 114, 0.2);
    border: 1px solid var(--color-accent);
    border-radius: 8px;
    color: var(--color-accent-light);
    text-align: center;
  `;
    msg.textContent = message;
    form.appendChild(msg);
}

/**
 * Show error message
 */
function showError(form, message) {
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message form-message--error';
    msg.style.cssText = `
    padding: 1rem;
    margin-top: 1rem;
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid #dc2626;
    border-radius: 8px;
    color: #fca5a5;
    text-align: center;
  `;
    msg.textContent = message;
    form.appendChild(msg);
}
