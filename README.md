# Documentation Hub

## Overview
Documentation Hub is a centralized platform that allows users to submit, browse, and discover educational resources across various computer science domains. The platform features an approval workflow, user notifications, and an intuitive interface for exploring documentation organized by categories.

## Features
- **Resource Submission**: Users can submit documentation resources with titles, descriptions, and URLs
- **Category Organization**: Resources are categorized across various CS domains (Web Development, Programming Languages, AI & ML, Cyber Security, Data Structures, etc.)
- **Admin Approval Workflow**: Submitted resources require admin approval before being published
- **Search & Filter**: Find resources using keyword search or category filters
- **User Notifications**: Email notifications when resources are approved
- **Responsive Design**: Works on devices of all sizes
- **Security Measures**: Input sanitization, bot detection, and XSS prevention

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Email Notifications**: Gmail API via Google Apps Script

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Copy the Google Apps Script code (provided in `google-apps-script.js`)
4. Save and deploy as a web app
   - Execute the app as: `Me`
   - Who has access: `Anyone`
5. Copy the deployed script URL

### 2. Website Deployment

1. Download the repository files
2. Open `script.js` and update the `scriptURL` variable with your deployed Google Apps Script URL
3. Deploy the website to your preferred hosting solution (GitHub Pages, Netlify, Vercel, etc.)

### 3. Initial Configuration

1. Open the deployed Google Apps Script URL in your browser
2. The script will automatically set up the necessary sheet structure with headers
3. Refresh your Google Sheet to see the created headers

## Usage

### For Users
1. Visit the Documentation Hub website
2. Browse existing resources by category or search for specific topics
3. Click "Add Document" to submit a new resource
4. Fill in the required information and submit
5. Receive email notification when your submission is approved

### For Admins
1. Open the Google Sheet
2. Review new submissions (marked as "Pending" in the approvalStatus column)
3. Change the approval status to "Approved" or "Rejected"
4. Add optional comments in the adminComments column
5. Changes take effect immediately - approved documents appear on the website

## Security Features
- Input sanitization to prevent XSS attacks
- Honeypot field to detect and block bot submissions
- Safe DOM manipulation to prevent code injection
- Data validation and error handling

## Customization
- Add or modify categories by updating the HTML and the Google Sheet data validation
- Customize the styling by modifying the CSS
- Add additional fields by updating the form, JavaScript, and Google Apps Script

## Troubleshooting
- If documents aren't displaying, check the Google Apps Script deployment settings
- For email notification issues, verify the Gmail API is enabled in Google Cloud Console
- If submissions fail, check the browser console for error messages and verify the script URL

## License
MIT License

## Contributors
- Skopos-899/Doodle

