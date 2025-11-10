import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    staffId: wageRecord.staff || 'N/A',
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
 * Generates voucher HTML content
 * @param {Object} voucherData - Voucher data object
 * @returns {string} HTML string for voucher
 */
export const generateVoucherHTML = (voucherData) => {
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
            <img src="/logo.jpg" alt="Rugyeyo Farm Logo" style="width: 60px; height: 60px; object-fit: contain;" />
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

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #702A0B; color: #666; font-size: 11px;">
        <p style="margin: 5px 0;">This is an official payment voucher generated by Rugyeyo Farm system</p>
        <p style="margin: 5px 0;">For any queries, please contact the accounts department</p>
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

    // Create temporary container for HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = generateVoucherHTML(voucherData);
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
