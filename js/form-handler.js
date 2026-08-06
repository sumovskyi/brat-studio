// ================================================
// BRAT Studio - Form Handler
// Corporate inquiries via Google Forms -> Google Sheets; booking/waitlist via Google Apps Script
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

    // Published Google Form endpoint that writes website inquiries to the BRAT CRM sheet.
    CORPORATE_FORM_ENDPOINT: 'https://docs.google.com/forms/d/e/1FAIpQLSeF-2c7GomPWT1I8b411MqqwQ42vLu7kMFBh9ZTi4u-ONMu2g/formResponse',

    // Only registration/booking forms should continue to payment
    SUCCESS_REDIRECTS: {
        'booking-form': 'payment.html'
    },

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

    initCorporateProgramLinks();
});

/**
 * Initialize form submission handler
 */
function initFormHandler(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

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

            if (form.id === 'corporate-form') {
                // Silently discard likely bot submissions caught by the hidden honeypot.
                if (data._honey) {
                    showSuccess(form, 'Thank you—BRAT will review your request and reply with the recommended format, scope and next step.');
                    form.reset();
                    resetCorporateProgramSelection();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }

                const programNames = {
                    recommend: 'Plan a team workshop',
                    'reset-connect': 'RESET & CONNECT',
                    'ready-real-time': 'READY IN REAL TIME',
                    'lead-presence': 'LEAD WITH PRESENCE',
                    'real-moment': 'REAL MOMENT LAB'
                };
                const corporatePayload = new URLSearchParams({
                    'entry.387981321': data.company || '',
                    'entry.592734545': data.name || '',
                    'entry.610900539': data.email || '',
                    'entry.1001196294': programNames[data.program] || data.program || 'Request recommendation',
                    'entry.169625623': data.workplace_situation || '',
                    'entry.1182273870': data.page_url,
                    'entry.1656936871': 'To review',
                    'entry.2134172810': 'New',
                    'entry.189387613': 'Review and contact',
                    'entry.394698953': 'Unassigned',
                    'entry.2100311547': 'Website'
                });

                await fetch(CONFIG.CORPORATE_FORM_ENDPOINT, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: corporatePayload
                });

                showSuccess(
                    form,
                    'Thank you—BRAT will review your request and reply with the recommended format, scope and next step.'
                );
                form.reset();
                resetCorporateProgramSelection();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            // Check if Google Script URL is configured
            if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
                console.log('Form data (demo mode):', data);

                showSuccess(form, 'Demo mode: Form submitted!');

                const demoRedirect = CONFIG.SUCCESS_REDIRECTS[form.id];
                if (demoRedirect) {
                    setTimeout(() => {
                        window.location.href = demoRedirect;
                    }, 1500);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
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

            // Redirect only the forms that explicitly require a payment step.
            const successRedirect = CONFIG.SUCCESS_REDIRECTS[form.id];
            if (successRedirect) {
                setTimeout(() => {
                    window.location.href = successRedirect;
                }, 1500);
            } else {
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
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
 * Preselect the matching corporate product when a card CTA is clicked.
 */
function initCorporateProgramLinks() {
    const programInput = document.getElementById('interest');
    const selectionNote = document.getElementById('corporate-program-selection');
    const inquirySection = document.getElementById('inquiry');
    const inquiryTitle = document.getElementById('corporate-inquiry-title');
    const programLinks = document.querySelectorAll('[data-corporate-program]');
    const programNames = {
        'reset-connect': 'RESET & CONNECT',
        'ready-real-time': 'READY IN REAL TIME',
        'lead-presence': 'LEAD WITH PRESENCE',
        'real-moment': 'REAL MOMENT LAB'
    };

    if (!programInput || !programLinks.length) return;

    programLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            programInput.value = link.dataset.corporateProgram || 'recommend';

            if (selectionNote && programNames[programInput.value]) {
                selectionNote.textContent = `Selected starting point: ${programNames[programInput.value]}`;
                selectionNote.hidden = false;
            }

            if (inquiryTitle && programNames[programInput.value]) {
                inquiryTitle.textContent = `Let's scope ${programNames[programInput.value]} for your team.`;
            }

            const scrollTarget = selectionNote || inquirySection;
            if (scrollTarget) {
                const headerOffset = 124;
                const destination = scrollTarget.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top: destination, behavior: 'smooth' });
            }
        });
    });
}

/**
 * Reset the program confirmation after a successful inquiry.
 */
function resetCorporateProgramSelection() {
    const programInput = document.getElementById('interest');
    const selectionNote = document.getElementById('corporate-program-selection');
    const inquiryTitle = document.getElementById('corporate-inquiry-title');

    if (programInput) programInput.value = 'recommend';
    if (selectionNote) {
        selectionNote.textContent = '';
        selectionNote.hidden = true;
    }
    if (inquiryTitle) {
        inquiryTitle.textContent = 'Tell us what your team needs.';
    }
}

/**
 * Show success message
 */
function showSuccess(form, message) {
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message form-message--success';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
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
    msg.setAttribute('role', 'alert');
    msg.style.cssText = `
    padding: 1rem;
    margin-top: 1rem;
    background: rgba(220, 38, 38, 0.08);
    border: 1px solid #dc2626;
    border-radius: 8px;
    color: #991b1b;
    text-align: center;
  `;
    msg.textContent = message;
    form.appendChild(msg);
}
