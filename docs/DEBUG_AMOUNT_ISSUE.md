# Debugging Amount Paid Issue - Step by Step Guide

## Current Status

I've added comprehensive debug logging to track the amount_paid value through the entire system. Now we need to run the app and check the browser console to see where the data is getting lost.

## What I've Added

### 1. Debug Logging in WageEntry Form
**File**: [src/pages/WageEntry.jsx:136-141](src/pages/WageEntry.jsx#L136-L141)

When you submit a wage, the console will show:
```
💰 Amount Paid Details: {
  form_value: "450000.00",
  form_type: "string",
  converted: 450000,
  payload_value: 450000
}
```

### 2. Debug Logging in Wages Fetch
**File**: [src/pages/wages.jsx:1038-1044](src/pages/wages.jsx#L1038-L1044)

When wages are loaded from API, each wage shows:
```
🔍 Processing wage: {
  id: 42,
  employee: "John Doe",
  amount_paid_raw: 450000,
  amount_paid_type: "number",
  rounded: 450000
}
```

### 3. Debug Logging in Table Rendering
**File**: [src/pages/wages.jsx:1335-1341](src/pages/wages.jsx#L1335-L1341)

When each row renders, shows:
```
💰 Rendering wage row: {
  id: 42,
  employee: "John Doe",
  amount_paid: 450000,
  formatted: "450,000",
  fullDisplay: "UGX 450,000"
}
```

## Testing Steps

### Step 1: Start the Development Server

```bash
cd web
npm run dev
```

The server will start at http://localhost:5173 (or another port if that's taken).

### Step 2: Open Browser DevTools

1. Open the app in your browser
2. Press F12 to open Developer Tools
3. Go to the **Console** tab
4. Clear any existing logs (click the 🚫 icon or press Ctrl+L)

### Step 3: Test Submitting a New Wage

1. Navigate to the **Wage Entry** page
2. Fill out the form:
   - **Employee**: Select any employee
   - **Date of Payment**: Choose today's date
   - **Days Worked**: 22
   - **Monthly Pay**: 500000
   - **Deduction**: 50000
   - **Amount Paid**: Should auto-calculate to 450000

3. **Before submitting**, check the console for any errors

4. Click **"Submit Wage"**

5. **Check the console** for these logs:
   ```
   📤 WageEntry: Submitting payload: {...}
   💰 Amount Paid Details: {...}
   ```

6. **Screenshot or copy** what you see in the console

### Step 4: Check the Wages List

1. After submission (if successful), you'll be redirected to the Wages page
2. **Check the console** for these logs:
   ```
   📊 Wages fetched from API: {...}
   🔍 Processing wage: {...}
   💰 Rendering wage row: {...}
   ```

3. **Look at the table** - do you see the amount in the "Amount Paid" column?

4. **Screenshot or copy** the console logs

### Step 5: Check Existing Wages

1. If you're already on the Wages page, refresh it (F5)
2. **Check the console** immediately for:
   ```
   📊 Wages fetched from API: {...}
   🔍 Processing wage: {...}
   💰 Rendering wage row: {...}
   ```

3. **Take screenshots** of:
   - The console logs
   - The wages table showing the issue

## What to Look For

### Scenario A: amount_paid is 0 or null from API

**Console will show**:
```
🔍 Processing wage: {
  amount_paid_raw: null,    ← Problem is here!
  amount_paid_type: "object",
  rounded: 0
}
```

**This means**: The API is not returning amount_paid, or it's returning null.

**Solution**: The issue is on the backend. The API needs to be fixed to properly save and return amount_paid.

### Scenario B: amount_paid exists but formatUGX fails

**Console will show**:
```
🔍 Processing wage: {
  amount_paid_raw: 450000,   ← Value exists
  rounded: 450000
}

💰 Rendering wage row: {
  amount_paid: 450000,       ← Still exists
  formatted: "0",             ← Problem is here!
  fullDisplay: "UGX 0"
}
```

**This means**: The formatUGX function is broken.

**Solution**: Need to fix the formatUGX function (already attempted, but may need more work).

### Scenario C: Form calculation not working

**Console will show**:
```
💰 Amount Paid Details: {
  form_value: "",              ← Problem is here!
  form_type: "string",
  converted: 0,
  payload_value: 0
}
```

**This means**: The amount_paid field is empty in the form.

**Solution**: The calculateAmountPaid function isn't running or the value isn't being set.

### Scenario D: Everything logs correctly but doesn't display

**Console shows all correct values, but table is blank**.

**This means**: There's a CSS issue or the table cell isn't rendering.

**Solution**: Check the browser's Elements inspector (inspect the table cell).

## Diagnostic Questions

After running the tests above, please provide:

1. **Did the wage submit successfully?**
   - Yes/No
   - Any error messages?

2. **What does the console show for "Amount Paid Details"?**
   - Copy the exact output

3. **What does the console show for "Processing wage"?**
   - Copy the exact output for the wage you just submitted

4. **What does the console show for "Rendering wage row"?**
   - Copy the exact output

5. **What do you see in the table's Amount Paid column?**
   - Blank
   - "UGX 0"
   - "UGX NaN"
   - Something else?

6. **Can you take screenshots of:**
   - The Wage Entry form (showing the auto-calculated amount)
   - The console logs after submission
   - The wages table

## Quick Checks

### Check 1: Is the calculation working in the form?

When you type in **Monthly Pay: 500000** and **Deduction: 50000**, does the **Amount Paid** field show **"UGX 450,000"**?

- **Yes** ✅ → Calculation works, issue is elsewhere
- **No** ❌ → Calculation is broken

### Check 2: Does the API accept amount_paid?

In the console after submission, look at the payload:
```json
{
  "amount_paid": 450000,  ← Should NOT be 0
  "monthly_pay": 500000,
  "deduction": 50000
}
```

- **amount_paid is 450000** ✅ → Being sent correctly
- **amount_paid is 0** ❌ → Not being calculated or set

### Check 3: Does the API return amount_paid?

In the console when viewing wages, look for:
```
📊 Wages fetched from API: {
  results: [
    {
      id: 42,
      amount_paid: 450000,  ← Should exist and be non-zero
      ...
    }
  ]
}
```

- **amount_paid exists and has value** ✅ → API is working
- **amount_paid is null or missing** ❌ → API issue

## Most Likely Issues

Based on common patterns, here are the most likely problems:

### Issue #1: API Not Saving amount_paid (Most Likely)

**Symptom**: Form shows amount, but wages list shows 0 or blank

**Cause**: Backend might be ignoring amount_paid field or not saving it

**How to confirm**: Check "Processing wage" logs - if `amount_paid_raw` is null or 0, this is the issue

**Solution**: Backend API needs to be updated to accept and save amount_paid

### Issue #2: Data Type Mismatch

**Symptom**: API returns amount_paid as string instead of number

**How to confirm**: Check logs for `amount_paid_type: "string"`

**Solution**: Already handled by `roundAmountToHundred` which converts to Number

### Issue #3: Field Name Mismatch

**Symptom**: API uses different field name (e.g., `total_paid` instead of `amount_paid`)

**How to confirm**: Look at raw API response in console logs

**Solution**: Update frontend to use correct field name

## Next Steps

1. **Run the tests above** and collect the console logs
2. **Take screenshots** of the issue
3. **Share the console logs** so we can identify the exact problem
4. Based on the logs, I'll provide a targeted fix

## Temporary Workaround

If this is urgent and you need wages to display something, we can:

1. Calculate amount_paid on the frontend when displaying
2. Use monthly_pay - deduction as a fallback
3. Show "Pending" or "Calculate" for missing amounts

Let me know the console output and I'll provide the exact fix needed!
