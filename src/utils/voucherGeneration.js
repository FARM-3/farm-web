import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'UGX 0';
  return `UGX ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Formats a date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Converts a number to words (for Ugandan Shillings)
 * @param {number} amount - The amount to convert
 * @returns {string} Amount in words
 */
export const numberToWords = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Zero';

  const num = Math.floor(Number(amount));
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const tensPart = tens[Math.floor(n / 10)];
      const onesPart = ones[n % 10];
      return tensPart + (onesPart ? ' ' + onesPart : '');
    }
    const hundreds = ones[Math.floor(n / 100)] + ' Hundred';
    const remainder = n % 100;
    return hundreds + (remainder ? ' and ' + convertLessThanThousand(remainder) : '');
  };

  if (num < 1000) {
    return convertLessThanThousand(num);
  }

  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' +
           (remainder ? ' ' + convertLessThanThousand(remainder) : '');
  }

  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = convertLessThanThousand(millions) + ' Million';

    if (remainder >= 1000) {
      const thousands = Math.floor(remainder / 1000);
      const lastPart = remainder % 1000;
      result += ' ' + convertLessThanThousand(thousands) + ' Thousand';
      if (lastPart) result += ' ' + convertLessThanThousand(lastPart);
    } else if (remainder > 0) {
      result += ' ' + convertLessThanThousand(remainder);
    }

    return result;
  }

  return num.toLocaleString();
};

/**
 * Generates a unique voucher number
 * @param {number} wageId - The wage record ID
 * @returns {string} Voucher number
 */
export const generateVoucherNumber = (wageId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `VCH-${year}${month}-${String(wageId).padStart(6, '0')}`;
};

/**
 * Creates voucher data object from wage record
 * @param {Object} wageRecord - The wage record
 * @returns {Object} Voucher data
 */
export const createVoucherData = (wageRecord) => {
  if (!wageRecord) {
    throw new Error('Wage record is required to generate voucher');
  }

  return {
    voucherNumber: generateVoucherNumber(wageRecord.id || Date.now()),
    employeeName: wageRecord.employee_name || 'N/A',
    staffId: wageRecord.employee_id || 'N/A',
    dateOfPayment: formatDate(wageRecord.date_of_payment),
    daysWorked: wageRecord.days_worked || 0,
    monthlySalary: wageRecord.monthly_pay || wageRecord.monthly_salary || 0,
    deduction: wageRecord.deduction || 0,
    amountPaid: wageRecord.amount_paid || 0,
    reason: wageRecord.noted_reason || 'Regular salary payment',
    generatedDate: formatDate(new Date()),
  };
};

/**
 * Converts an image to base64 data URL
 * @param {string} url - The image URL
 * @returns {Promise<string>} Base64 data URL
 */
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        resolve('');
      }
    };
    img.onerror = () => {
      console.error('Error loading image:', url);
      resolve('');
    };
    img.src = url;
  });
};

/**
 * Generates QR code data URL for voucher verification
 * @param {number} wageId - The wage record ID
 * @returns {Promise<string>} QR code data URL
 */
export const generateQRCode = async (wageId) => {
  try {
    // Use configured frontend URL or fall back to current origin
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const verificationUrl = `${frontendUrl}/verify-voucher?id=${wageId}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#702A0B',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

/**
 * Generates voucher HTML content
 * @param {Object} voucherData - Voucher data object
 * @param {string} qrCodeDataURL - QR code data URL (optional)
 * @param {string} logoDataURL - Logo data URL (optional)
 * @returns {string} HTML string for voucher
 */
export const generateVoucherHTML = (voucherData, qrCodeDataURL = '', logoDataURL = '') => {
  return `
    <div style="
      width: 210mm;
      min-height: 297mm;
      padding: 25mm;
      margin: 0 auto;
      background: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-sizing: border-box;
      color: #333;
    ">
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #702A0B; padding-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            ${logoDataURL ? `<img src="${logoDataURL}" alt="Rugyeyo Farm Logo" style="width: 60px; height: 60px; object-fit: contain;" />` : ''}
            <div>
              <h1 style="color: #702A0B; margin: 0 0 5px 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">RUGYEYO FARM</h1>
              <p style="margin: 0; color: #666; font-size: 11px;">Coffee Production & Processing</p>
              <p style="margin: 0; color: #666; font-size: 11px;">Namayumba, Wakiso District, Uganda</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #702A0B; font-size: 10px; font-weight: 600;">VOUCHER</p>
            <p style="margin: 0; color: #666; font-size: 11px;">${voucherData.voucherNumber}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 10px; font-weight: 600;">ORIGINAL</p>
          </div>
        </div>
      </div>

      <!-- Voucher Title Bar -->
      <div style="background: #702A0B; padding: 12px; text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0; color: white; font-size: 16px; font-weight: 600; letter-spacing: 1px;">PAYMENT VOUCHER</h2>
      </div>

      <!-- Payment Details Grid -->
      <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; width: 35%; border-bottom: 1px solid #e0e0e0;">Date of Payment:</td>
            <td style="padding: 8px 12px; color: #333; border-bottom: 1px solid #e0e0e0;">${voucherData.dateOfPayment}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #e0e0e0;">Paid To:</td>
            <td style="padding: 8px 12px; color: #333; border-bottom: 1px solid #e0e0e0;">${voucherData.employeeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #e0e0e0;">Staff ID:</td>
            <td style="padding: 8px 12px; color: #333; border-bottom: 1px solid #e0e0e0;">${voucherData.staffId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555; border-bottom: 1px solid #e0e0e0;">Payment Method:</td>
            <td style="padding: 8px 12px; color: #333; border-bottom: 1px solid #e0e0e0;">Mobile Money</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #555;">Paid By:</td>
            <td style="padding: 8px 12px; color: #333;">Staff Member</td>
          </tr>
        </table>
      </div>

      <!-- Payment Breakdown in Box -->
      <div style="border: 2px solid #702A0B; border-radius: 8px; padding: 20px; margin-bottom: 25px; background: #F5EEDC;">
        <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #702A0B;">💼 Wage Details</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
          <tr>
            <td style="padding: 6px 0; color: #666;">Days Worked:</td>
            <td style="padding: 6px 0; color: #333; text-align: right; font-weight: 500;">${voucherData.daysWorked} days</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Monthly Salary:</td>
            <td style="padding: 6px 0; color: #333; text-align: right; font-weight: 500;">${formatCurrency(voucherData.monthlySalary)}</td>
          </tr>
        </table>

        <div style="border-top: 2px solid #702A0B; padding-top: 15px;">
          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #702A0B;">Amount in Figures:</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #702A0B;">${formatCurrency(voucherData.amountPaid)}</p>
          <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 600; color: #702A0B;">Amount in Words:</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #333; font-style: italic;">${numberToWords(voucherData.amountPaid)} Shillings Only</p>
        </div>
      </div>

      <!-- Notes -->
      ${voucherData.reason ? `
      <div style="margin-bottom: 40px; padding: 15px; background: #f9f9f9; border-left: 4px solid #702A0B;">
        <p style="margin: 0; font-size: 11px; font-weight: 600; color: #702A0B;">Notes:</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #333;">${voucherData.reason}</p>
      </div>
      ` : ''}

      <!-- Signatures -->
      <div style="margin-top: 60px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; padding: 20px;">
              <div style="border-top: 2px solid #702A0B; padding-top: 10px; text-align: center;">
                <p style="margin: 5px 0; font-size: 12px; font-weight: 600; color: #333;">Employee Signature</p>
                <p style="margin: 5px 0; color: #666; font-size: 11px;">Date: _____________</p>
              </div>
            </td>
            <td style="width: 50%; padding: 20px;">
              <div style="border-top: 2px solid #702A0B; padding-top: 10px; text-align: center;">
                <p style="margin: 5px 0; font-size: 12px; font-weight: 600; color: #333;">Authorized Signature</p>
                <p style="margin: 5px 0; color: #666; font-size: 11px;">Date: _____________</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer with QR Code -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #702A0B;">
        ${qrCodeDataURL ? `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${qrCodeDataURL}" alt="Verification QR Code" style="width: 120px; height: 120px; border: 3px solid #702A0B; border-radius: 8px; padding: 8px; background: white;" />
          <p style="margin: 10px 0 0 0; font-size: 10px; font-weight: 600; color: #702A0B;">Scan to Verify</p>
          <p style="margin: 5px 0; font-size: 9px; color: #666;">Scan this QR code to verify voucher authenticity</p>
        </div>
        ` : ''}
        <div style="text-align: center; color: #666; font-size: 11px;">
          <p style="margin: 5px 0;">This is an official payment voucher generated by Rugyeyo Farm system</p>
          <p style="margin: 5px 0;">For any queries, please contact the accounts department</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generates and downloads a PDF voucher from wage record
 * @param {Object} wageRecord - The wage record
 * @param {Object} options - Options for PDF generation
 * @returns {Promise<void>}
 */
export const generateAndDownloadVoucher = async (wageRecord, options = {}) => {
  try {
    // Validate input
    if (!wageRecord) {
      throw new Error('Wage record is required');
    }

    // Create voucher data
    const voucherData = createVoucherData(wageRecord);

    // Generate QR code for verification
    const qrCodeDataURL = await generateQRCode(wageRecord.id);

    // Load and convert logo to base64
    const logoDataURL = await imageToBase64('/logo.jpg');

    // Create temporary container for HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = generateVoucherHTML(voucherData, qrCodeDataURL, logoDataURL);
    document.body.appendChild(container);

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Generate filename
    const filename = options.filename ||
      `Voucher_${voucherData.voucherNumber}_${wageRecord.employee_name?.replace(/\s+/g, '_') || 'Employee'}.pdf`;

    // Download PDF
    pdf.save(filename);

    return {
      success: true,
      voucherNumber: voucherData.voucherNumber,
      filename,
    };
  } catch (error) {
    console.error('Error generating voucher:', error);
    throw new Error(`Failed to generate voucher: ${error.message}`);
  }
};

/**
 * Generates voucher preview HTML element (for display before download)
 * @param {Object} wageRecord - The wage record
 * @returns {HTMLElement} Voucher preview element
 */
export const generateVoucherPreview = (wageRecord) => {
  try {
    const voucherData = createVoucherData(wageRecord);
    const container = document.createElement('div');
    container.innerHTML = generateVoucherHTML(voucherData);
    return container;
  } catch (error) {
    console.error('Error generating voucher preview:', error);
    throw error;
  }
};

/**
 * Validates if a wage record has all required fields for voucher generation
 * @param {Object} wageRecord - The wage record to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateWageRecordForVoucher = (wageRecord) => {
  const errors = [];

  if (!wageRecord) {
    return { isValid: false, errors: ['Wage record is required'] };
  }

  if (!wageRecord.employee_name) {
    errors.push('Employee name is required');
  }

  if (!wageRecord.date_of_payment) {
    errors.push('Payment date is required');
  }

  if (wageRecord.amount_paid === null || wageRecord.amount_paid === undefined) {
    errors.push('Amount paid is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== RECEIPT GENERATION FUNCTIONS ====================

/**
 * Generates receipt number from sale record
 * @param {Object} sale - The sale record
 * @returns {string} Receipt number
 */
export const generateReceiptNumber = (sale) => {
  if (!sale) return '';
  const date = sale.date_of_payment || sale.date || '';
  const year = date ? new Date(date).getFullYear() : 'XXXX';
  return `RUG-${year}-${String(sale.id).padStart(4, '0')}`;
};

/**
 * Generates receipt HTML content
 * @param {Object} sale - Sale record
 * @returns {string} HTML string for receipt
 */
export const generateReceiptHTML = (sale) => {
  const receiptNumber = generateReceiptNumber(sale);
  const items = sale.items || [
    {
      product: sale.item || '',
      item: sale.item || '',
      qty: sale.quantity || 0,
      rate: sale.rate || 0,
      total: (sale.quantity || 0) * (sale.rate || 0)
    }
  ];
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const amountInWords = numberToWords(totalAmount);
  const paymentDate = sale.date_of_payment ? new Date(sale.date_of_payment).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : sale.date || 'N/A';

  return `
    <div style="
      width: 210mm;
      min-height: 297mm;
      padding: 25mm;
      margin: 0 auto;
      background: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-sizing: border-box;
      color: #333;
    ">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 25px; border-bottom: 2px solid #702A0B; padding-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div>
            <h1 style="color: #702A0B; margin: 0 0 5px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">RUGYEYO FARM</h1>
            <p style="margin: 0; color: #666; font-size: 12px;">Coffee Production & Processing</p>
            <p style="margin: 0; color: #666; font-size: 11px;">Namayumba, Wakiso District, Uganda</p>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; color: #702A0B; font-size: 12px; font-weight: 600;">RECEIPT</p>
          <p style="margin: 0; color: #666; font-size: 11px;">No: ${receiptNumber}</p>
        </div>
      </div>

      <!-- Title -->
      <div style="background: #F5EEDC; padding: 12px; text-align: center; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0; color: #702A0B; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">SALES RECEIPT</h2>
      </div>

      <!-- Customer Information -->
      <div style="background: #FEFBF8; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #702A0B; font-size: 14px; font-weight: 600;">Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 6px 0; color: #666; width: 30%;">Customer:</td>
            <td style="padding: 6px 0; color: #333; font-weight: 600;">${sale.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Payment Date:</td>
            <td style="padding: 6px 0; color: #333; font-weight: 600;">${paymentDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Status:</td>
            <td style="padding: 6px 0; color: #333; font-weight: 600;">${sale.status || 'Paid'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Payment Method:</td>
            <td style="padding: 6px 0; color: #333; font-weight: 600;">${sale.method_of_payment || sale.payment_method || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Batch ID:</td>
            <td style="padding: 6px 0; color: #333; font-weight: 600;">${sale.batch_id || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <div style="background: #FEFBF8; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #702A0B; font-size: 14px; font-weight: 600;">Item Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #F5EEDC;">
              <th style="text-align: left; padding: 10px; color: #702A0B; font-weight: 600;">Product</th>
              <th style="text-align: left; padding: 10px; color: #702A0B; font-weight: 600;">Item</th>
              <th style="text-align: left; padding: 10px; color: #702A0B; font-weight: 600;">Qty (kg)</th>
              <th style="text-align: left; padding: 10px; color: #702A0B; font-weight: 600;">Rate (UGX)</th>
              <th style="text-align: left; padding: 10px; color: #702A0B; font-weight: 600;">Total (UGX)</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #E8DCC8;">
                <td style="padding: 10px; color: #333;">${item.product || item.item}</td>
                <td style="padding: 10px; color: #333;">${item.item}</td>
                <td style="padding: 10px; color: #333;">${item.qty}</td>
                <td style="padding: 10px; color: #333;">${Number(item.rate).toLocaleString()}</td>
                <td style="padding: 10px; color: #333;">${Number(item.total).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Total Amount -->
      <div style="background: #702A0B; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="color: white; font-size: 14px; font-weight: 600;">Total Amount:</span>
          <span style="color: white; font-size: 20px; font-weight: 700;">${formatCurrency(totalAmount)}</span>
        </div>
        <p style="margin: 10px 0 0 0; color: white; font-size: 11px; font-style: italic;">
          ${amountInWords} Shillings Only
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
          <span style="color: white; font-size: 13px; font-weight: 600;">Balance:</span>
          <span style="color: white; font-size: 16px; font-weight: 600;">${formatCurrency(sale.balance || 0)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #702A0B;">
        <p style="margin: 5px 0; font-size: 10px; font-style: italic; color: #666;">
          This is an official sales receipt from Rugyeyo Farm
        </p>
        <p style="margin: 5px 0; font-size: 10px; color: #666;">
          Namayumba, Wakiso District, Uganda | Tel: +256772701051
        </p>
      </div>
    </div>
  `;
};

/**
 * Generates and downloads a PDF receipt from sale record
 * @param {Object} saleRecord - The sale record
 * @returns {Promise<void>}
 */
export const generateAndDownloadReceipt = async (saleRecord) => {
  try {
    if (!saleRecord) {
      throw new Error('Sale record is required');
    }

    // Create temporary container for HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = generateReceiptHTML(saleRecord);
    document.body.appendChild(container);

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,  // A4 width at 96 DPI
      windowHeight: 1123 // A4 height at 96 DPI
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Generate filename
    const receiptNumber = generateReceiptNumber(saleRecord);
    const filename = `Receipt_${receiptNumber}_${saleRecord.customer_name?.replace(/\s+/g, '_') || 'Customer'}.pdf`;

    // Download PDF
    pdf.save(filename);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error(`Failed to generate receipt: ${error.message}`);
  }
};
