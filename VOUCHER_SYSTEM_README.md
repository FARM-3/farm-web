# Voucher System Documentation

## Overview

The voucher system automatically generates professional payment vouchers for wage submissions. When a wage is submitted, users can download a formatted PDF voucher containing all payment details.

## Features

### 1. Automatic Voucher Generation
- **Trigger**: After successfully submitting a wage record
- **User Choice**: Modal prompt asks if user wants to download voucher
- **Skip Option**: Users can skip and download later from the Wages page

### 2. Manual Voucher Download
- **Location**: Wages page ([wages.jsx](src/pages/wages.jsx))
- **Action**: Click the green download icon next to any wage record
- **Feedback**: Loading spinner during generation, success toast on completion

### 3. Professional PDF Format
- **Layout**: A4 size, professional design
- **Branding**: Rugyeyo Enterprise header and footer
- **Content Includes**:
  - Unique voucher number (format: VCH-YYYYMM-######)
  - Employee information (name, staff ID, payment date)
  - Payment breakdown (days worked, salary, deductions, net amount)
  - Notes/reason for payment
  - Signature areas for employee and authorized personnel
  - Generation date and timestamp

## File Structure

```
web/
├── src/
│   ├── utils/
│   │   └── voucherGeneration.js       # Core voucher generation logic
│   ├── components/
│   │   └── VoucherTemplate.jsx        # React component for voucher UI
│   ├── pages/
│   │   ├── WageEntry.jsx              # Modified: Added voucher prompt after submission
│   │   └── wages.jsx                  # Modified: Added download button for each record
└── VOUCHER_SYSTEM_README.md          # This file
```

## Implementation Details

### 1. Voucher Generation Utility ([voucherGeneration.js](src/utils/voucherGeneration.js))

#### Key Functions:

**`generateAndDownloadVoucher(wageRecord, options)`**
- Main function to generate and download voucher PDF
- Parameters:
  - `wageRecord`: Object containing wage data
  - `options`: Optional settings (e.g., custom filename)
- Returns: Promise resolving to `{ success, voucherNumber, filename }`

**`createVoucherData(wageRecord)`**
- Transforms wage record into voucher format
- Generates unique voucher number
- Formats dates and currency values

**`validateWageRecordForVoucher(wageRecord)`**
- Validates required fields before generation
- Returns: `{ isValid: boolean, errors: string[] }`

**`formatCurrency(amount)`**
- Formats numbers as RWF currency
- Example: `1500000` → `"RWF 1,500,000.00"`

**`formatDate(date)`**
- Formats dates in readable format
- Example: `"2025-11-10"` → `"10 November 2025"`

**`generateVoucherNumber(wageId)`**
- Creates unique voucher identifiers
- Format: `VCH-YYYYMM-######`
- Example: `VCH-202511-000042`

### 2. VoucherTemplate Component ([VoucherTemplate.jsx](src/components/VoucherTemplate.jsx))

React component for rendering voucher preview. Can be used for:
- On-screen preview
- Print layout
- PDF generation source

**Props:**
- `voucherData`: Object with formatted voucher information

**Styling:**
- Uses Tailwind CSS for responsive design
- Matches Rugyeyo Enterprise brand colors (#702A0B, #F5EEDC)
- Print-friendly layout

### 3. WageEntry Integration ([WageEntry.jsx](src/pages/WageEntry.jsx))

**Changes:**
1. Import voucher generation utility
2. Add state management:
   ```javascript
   const [showVoucherPrompt, setShowVoucherPrompt] = useState(false);
   const [savedWageRecord, setSavedWageRecord] = useState(null);
   ```
3. Modified `handleSubmit`:
   - Captures saved wage record
   - Shows voucher prompt modal after success
4. New handlers:
   - `handleDownloadVoucher()`: Generates and downloads voucher
   - `handleSkipVoucher()`: Skips voucher and navigates to wages page

**User Flow:**
1. User submits wage form
2. API saves wage record
3. Success modal appears with two options:
   - **Download Voucher**: Generates PDF and navigates to wages page
   - **Skip for Now**: Goes directly to wages page

### 4. Wages Page Integration ([wages.jsx](src/pages/wages.jsx))

**Changes:**
1. Import voucher utilities and Download icon
2. Add state:
   ```javascript
   const [downloadingVoucher, setDownloadingVoucher] = useState(null);
   ```
3. New handler:
   ```javascript
   const handleDownloadVoucher = async (wage) => {
     // Validates, generates, and downloads voucher
     // Shows success toast notification
   };
   ```
4. Table actions updated:
   - Added green download button before Edit and Delete
   - Shows loading spinner during generation
   - Displays success toast with voucher number

**User Experience:**
- Instant feedback with loading state
- Toast notification confirming download
- Disabled button during generation to prevent duplicates

## Usage Examples

### Example 1: Download Voucher After Submission

```javascript
// User submits wage form
// After successful API response:
const wageRecord = {
  id: 42,
  employee_name: "John Doe",
  date_of_payment: "2025-11-10",
  days_worked: 22,
  monthly_pay: 500000,
  deduction: 50000,
  amount_paid: 450000,
  noted_reason: "Monthly salary payment"
};

// Modal appears asking to download voucher
// If user clicks "Download Voucher":
await generateAndDownloadVoucher(wageRecord);
// Result: VCH-202511-000042_John_Doe.pdf downloads
```

### Example 2: Download from Wages List

```javascript
// User navigates to wages page
// Clicks download icon on a wage record
const handleDownloadVoucher = async (wage) => {
  // Validate first
  const validation = validateWageRecordForVoucher(wage);
  if (!validation.isValid) {
    alert('Cannot generate voucher: ' + validation.errors.join(', '));
    return;
  }

  // Generate and download
  const result = await generateAndDownloadVoucher(wage);
  // Shows success toast: "Voucher VCH-202511-000042 downloaded successfully!"
};
```

### Example 3: Custom Voucher Validation

```javascript
import { validateWageRecordForVoucher } from '../utils/voucherGeneration';

const wage = {
  employee_name: "Jane Smith",
  // Missing required fields...
};

const validation = validateWageRecordForVoucher(wage);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  // Output: ['Payment date is required', 'Amount paid is required']
}
```

## Technical Requirements

### Dependencies

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

**Installation:**
```bash
cd web
npm install jspdf html2canvas
```

### Browser Compatibility

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required APIs**:
  - `html2canvas` for HTML-to-image conversion
  - `jsPDF` for PDF generation
  - `document.createElement` and DOM manipulation
  - `Blob` and download APIs

### Performance Considerations

1. **Generation Time**: 2-5 seconds depending on browser
2. **File Size**: ~100-300 KB per voucher
3. **Memory Usage**: Temporary DOM elements removed after generation
4. **Optimization**: Uses `scale: 2` for high-quality PDF output

## Best Practices

### 1. Error Handling

Always wrap voucher generation in try-catch blocks:

```javascript
try {
  await generateAndDownloadVoucher(wageRecord);
} catch (error) {
  console.error('Voucher generation failed:', error);
  alert(`Failed to generate voucher: ${error.message}`);
}
```

### 2. Validation Before Generation

```javascript
const validation = validateWageRecordForVoucher(wage);
if (!validation.isValid) {
  // Handle validation errors
  return;
}
// Proceed with generation
```

### 3. User Feedback

Provide clear feedback during generation:
- Show loading spinner/state
- Display success message with voucher number
- Handle errors gracefully with user-friendly messages

### 4. Accessibility

- Modal has proper focus management
- Buttons have descriptive titles
- Icons include text labels
- Color contrast meets WCAG standards

## Customization Guide

### Modify Voucher Design

Edit [voucherGeneration.js:76](src/utils/voucherGeneration.js#L76) - `generateVoucherHTML()` function:

```javascript
// Change header color
<h1 style="color: #YOUR_COLOR;">PAYMENT VOUCHER</h1>

// Modify layout
// Edit HTML structure within template literal

// Change fonts
style="font-family: 'Your Font', sans-serif;"
```

### Change Voucher Number Format

Edit [voucherGeneration.js:36](src/utils/voucherGeneration.js#L36) - `generateVoucherNumber()`:

```javascript
export const generateVoucherNumber = (wageId) => {
  // Custom format: PAY-YYYY-MM-DD-####
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `PAY-${year}-${month}-${day}-${String(wageId).padStart(4, '0')}`;
};
```

### Add Company Logo

Modify `generateVoucherHTML()` to include logo:

```javascript
// Add in header section
<div style="text-align: center; margin-bottom: 20px;">
  <img src="/path/to/logo.png" alt="Company Logo" style="max-width: 150px;" />
  <h1 style="color: #702A0B;">PAYMENT VOUCHER</h1>
</div>
```

### Customize Currency

Edit [voucherGeneration.js:10](src/utils/voucherGeneration.js#L10) - `formatCurrency()`:

```javascript
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'UGX 0.00';
  return `UGX ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0, // No decimals for UGX
    maximumFractionDigits: 0,
  })}`;
};
```

## Troubleshooting

### Issue: PDF Not Downloading

**Possible Causes:**
1. Browser blocking downloads
2. Missing required fields in wage record
3. Network/API error

**Solutions:**
```javascript
// Check browser console for errors
console.error('Error generating voucher:', error);

// Validate wage record first
const validation = validateWageRecordForVoucher(wage);
console.log('Validation:', validation);

// Ensure browser allows downloads from your domain
// Check browser download settings
```

### Issue: Voucher Layout Broken

**Causes:**
- Missing CSS styles
- HTML structure errors
- Font loading issues

**Solutions:**
```javascript
// Check HTML template syntax
const html = generateVoucherHTML(voucherData);
console.log('Generated HTML:', html);

// Verify all closing tags
// Ensure inline styles are properly formatted
```

### Issue: Slow Generation

**Optimization:**
```javascript
// Reduce canvas scale (lower quality, faster)
const canvas = await html2canvas(container, {
  scale: 1, // Instead of 2
  useCORS: true,
  logging: false,
});

// Simplify HTML template
// Remove unnecessary styling/elements
```

## Security Considerations

1. **Input Validation**: All wage data is validated before PDF generation
2. **XSS Prevention**: User input is escaped in HTML template
3. **No Server-Side Storage**: Vouchers generated client-side only
4. **Temporary DOM Elements**: Removed immediately after generation

## Future Enhancements

### Potential Features:
1. **Email Integration**: Send vouchers directly via email
2. **Bulk Download**: Generate multiple vouchers at once
3. **Template Selection**: Choose from different voucher designs
4. **Digital Signatures**: Integrate e-signature functionality
5. **Archive System**: Store vouchers in database for retrieval
6. **Print Preview**: Show voucher before downloading
7. **Multi-Language**: Support for multiple languages
8. **Watermarks**: Add draft/final watermarks

### Suggested Implementation:

```javascript
// Email voucher
const emailVoucher = async (wage, recipientEmail) => {
  const voucherBlob = await generateVoucherBlob(wage);
  await sendEmail({
    to: recipientEmail,
    subject: `Payment Voucher ${voucherNumber}`,
    attachments: [voucherBlob]
  });
};

// Bulk download
const downloadMultipleVouchers = async (wageRecords) => {
  const zip = new JSZip();
  for (const wage of wageRecords) {
    const blob = await generateVoucherBlob(wage);
    zip.file(`voucher_${wage.id}.pdf`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, 'vouchers.zip');
};
```

## Support

For issues or questions:
1. Check this documentation first
2. Review browser console for error messages
3. Verify all dependencies are installed
4. Test with sample data to isolate issues

## Version History

**Version 1.0.0** (2025-11-10)
- Initial implementation
- Automatic voucher generation after wage submission
- Manual download from wages page
- Professional PDF layout with branding
- Comprehensive validation and error handling
- Toast notifications for user feedback
- Loading states for better UX

## License

Part of the Rugyeyo Enterprise web application.
