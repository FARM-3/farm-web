# Auto Expense Creation from Farmer Harvest - Integration Guide

## Overview
This feature automatically creates an expense record in the Expense table whenever a farmer's harvest is recorded. This helps track aggregation costs as business expenses.

## What Gets Created

When a farmer harvest is recorded, the system automatically creates an expense with:

- **Category**: "Aggregation" (fixed)
- **Date**: Date from harvest record (date_of_delivery or date_of_payment)
- **Amount**: Amount paid to the farmer (amount_paid field)
- **Supplier**: Farmer's name (first_name + last_name)
- **Location**: Farmer's village (from farmer registration)
- **Expense Name**: "Farmer Aggregation - [Farmer Name]"
- **Item**: "Coffee Harvest ([weight] kg)" if weight is available
- **Description**: Auto-generated with farmer details

## Implementation Steps

### Step 1: Import the Utility Function

In the file where you handle farmer harvest recording (likely in Aggregation.jsx or a harvest recording modal), add this import at the top:

```javascript
import { onHarvestRecorded } from '../utils/autoExpenseCreation';
```

### Step 2: Call After Successful Harvest Recording

After successfully recording a farmer harvest (after the POST request succeeds), call the function:

```javascript
// Example: After successfully creating a harvest record
const handleHarvestSubmit = async (formData) => {
    try {
        // 1. Create the harvest record
        const harvestResponse = await fetch(FARMER_HARVEST_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!harvestResponse.ok) {
            throw new Error('Failed to create harvest record');
        }

        const harvestRecord = await harvestResponse.json();
        console.log('Harvest recorded successfully:', harvestRecord);

        // 2. Automatically create expense record
        // You need to pass the farmer details here
        const farmerDetails = {
            first_name: formData.farmer_first_name,  // Adjust based on your form
            last_name: formData.farmer_last_name,
            village: formData.farmer_village,
        };

        await onHarvestRecorded(harvestRecord, farmerDetails);

        // 3. Show success message and refresh data
        alert('Harvest recorded successfully! Expense record created automatically.');
        fetchHarvests(); // Refresh your harvest list

    } catch (error) {
        console.error('Error recording harvest:', error);
        alert('Failed to record harvest');
    }
};
```

### Step 3: Alternative - Direct Function Call

If you want more control, you can use the direct function:

```javascript
import { createExpenseFromHarvest } from '../utils/autoExpenseCreation';

// Prepare the data
const harvestData = {
    farmer_name: `${farmer.first_name} ${farmer.last_name}`,
    village: farmer.village,
    amount_paid: 50000,
    date: '2025-01-15',
    weight: 100  // optional
};

// Create expense
const result = await createExpenseFromHarvest(harvestData);

if (result.success) {
    console.log('Expense created:', result.expense);
} else {
    console.error('Failed to create expense:', result.error);
}
```

## Data Mapping

| Expense Field | Source | Example |
|--------------|--------|---------|
| `expense_name` | Auto-generated | "Farmer Aggregation - John Doe" |
| `category` | Fixed | "Aggregation" |
| `item` | Harvest type + weight | "Coffee Harvest (100 kg)" |
| `supplier` | Farmer's full name | "John Doe" |
| `description` | Auto-generated | "Automatic expense created from farmer harvest record..." |
| `amount` | Amount paid to farmer | "50000.00" |
| `date` | Harvest/payment date | "2025-01-15" |
| `location` | Farmer's village | "Kampala" |

## Expected Data Structure

### Harvest Record (from API)
```javascript
{
    harvest_id: "H001",
    farmer_id: "F123",
    amount_paid: 50000,
    date_of_delivery: "2025-01-15",
    weight_delivered: 100,
    // ... other fields
}
```

### Farmer Details
```javascript
{
    first_name: "John",
    last_name: "Doe",
    village: "Kampala",
    // ... other fields
}
```

## Error Handling

The function includes comprehensive error handling:

1. **Network Errors**: Catches failed API requests
2. **Validation**: Ensures required fields have default values
3. **Logging**: Logs success and failure for debugging
4. **Non-blocking**: If expense creation fails, the harvest record is still saved

## Testing

To test this feature:

1. Record a farmer harvest
2. Check the console for logs:
   - "Creating expense from harvest:"
   - "Expense created successfully from harvest:"
3. Navigate to the Expenses page
4. Verify a new expense with category "Aggregation" was created
5. Check that:
   - Supplier = Farmer's name
   - Location = Farmer's village
   - Amount = Amount paid
   - Date = Harvest date

## Where to Find Harvest Recording

You need to identify where farmer harvests are recorded in your application. Check these locations:

1. **Aggregation Page** (`src/pages/Aggregation.jsx`)
   - Look for "Record Harvest" button or modal
   - Look for POST requests to `FARMER_HARVEST_API`

2. **Harvest Page** (`src/pages/Harvest.jsx`)
   - Similar to above

3. **Separate Modal Component**
   - Check if there's a `HarvestModal.jsx` or similar

## Example Integration Locations

### If you have a modal for recording harvests:

```javascript
// In your HarvestModal.jsx or similar
import { onHarvestRecorded } from '../utils/autoExpenseCreation';

const HarvestModal = ({ farmer, onClose, onSuccess }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ... your existing harvest creation logic ...

        const harvestRecord = await createHarvest(formData);

        // Add this line after successful creation
        await onHarvestRecorded(harvestRecord, farmer);

        onSuccess();
        onClose();
    };

    // ... rest of your modal
};
```

### If harvest recording is in the main Aggregation page:

Look for the function that handles harvest submission and add the `onHarvestRecorded` call there.

## Benefits

1. **Automatic Tracking**: All aggregation costs are automatically tracked as expenses
2. **Accurate Records**: Ensures every farmer payment is recorded as an expense
3. **Time Saving**: No manual entry needed for aggregation expenses
4. **Consistency**: All harvest-related expenses have the same category and format
5. **Complete Financial Picture**: Expenses table includes all business costs including farmer payments

## Troubleshooting

**Issue**: Expense not created after harvest recording
- Check browser console for error messages
- Verify the harvest was successfully created first
- Ensure farmer details (name, village) are available
- Check network tab for failed API requests

**Issue**: Wrong data in expense record
- Verify the harvest data structure matches expected format
- Check that farmer details are being passed correctly
- Review the data mapping in the utility function

## Future Enhancements

Possible improvements:
1. Add option to disable auto-creation for specific harvests
2. Bulk expense creation for multiple harvests
3. Expense categorization by harvest type (Robusta vs Arabica)
4. Integration with inventory management
