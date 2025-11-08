// Utility function to automatically create an expense record when farmer harvest is recorded
// This helps track aggregation costs as expenses

const EXPENSE_API_ENDPOINT = 'http://142.93.94.236:8000/api/expenses/';

/**
 * Automatically creates an expense record from a farmer harvest record
 * @param {Object} harvestData - The farmer harvest data
 * @param {string} harvestData.farmer_name - Name of the farmer (first_name + last_name)
 * @param {string} harvestData.village - Village where farmer is from
 * @param {number} harvestData.amount_paid - Amount paid to farmer
 * @param {string} harvestData.date - Date of harvest/payment
 * @param {string} harvestData.weight - Weight of harvest (optional, for description)
 * @returns {Promise<Object>} - The created expense record or error
 */
export const createExpenseFromHarvest = async (harvestData) => {
    try {
        // Prepare expense data from harvest information
        const expenseData = {
            expense_name: `Farmer Aggregation - ${harvestData.farmer_name || 'Unknown Farmer'}`,
            category: 'Aggregation',  // Fixed category for all harvest-related expenses
            item: `Coffee Harvest${harvestData.weight ? ` (${harvestData.weight} kg)` : ''}`,
            supplier: harvestData.farmer_name || 'Unknown Farmer',  // Farmer name as supplier
            description: `Automatic expense created from farmer harvest record. Farmer: ${harvestData.farmer_name}, Village: ${harvestData.village || 'N/A'}`,
            amount: parseFloat(harvestData.amount_paid || 0).toFixed(2),  // Amount paid to farmer
            date: harvestData.date || new Date().toISOString().substring(0, 10),  // Date of harvest
            location: harvestData.village || 'N/A',  // Farmer's village
        };

        console.log('Creating expense from harvest:', expenseData);

        // Send POST request to expenses API
        const response = await fetch(EXPENSE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create expense from harvest:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const createdExpense = await response.json();
        console.log('Expense created successfully from harvest:', createdExpense);

        return {
            success: true,
            expense: createdExpense,
            message: 'Expense record created automatically from harvest'
        };

    } catch (error) {
        console.error('Error creating expense from harvest:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to create automatic expense record'
        };
    }
};

/**
 * Hook function to be called after a farmer harvest is successfully recorded
 * @param {Object} harvestRecord - The complete harvest record from the API
 * @param {Object} farmerDetails - Additional farmer details (name, village, etc.)
 */
export const onHarvestRecorded = async (harvestRecord, farmerDetails) => {
    // Extract necessary data
    const harvestData = {
        farmer_name: farmerDetails ? `${farmerDetails.first_name || ''} ${farmerDetails.last_name || ''}`.trim() : 'Unknown Farmer',
        village: farmerDetails?.village || 'N/A',
        amount_paid: harvestRecord.amount_paid || harvestRecord.total_amount || 0,
        date: harvestRecord.date_of_delivery || harvestRecord.date || new Date().toISOString().substring(0, 10),
        weight: harvestRecord.weight_delivered || harvestRecord.weight || harvestRecord.quantity,
    };

    // Create the expense record
    const result = await createExpenseFromHarvest(harvestData);

    if (result.success) {
        console.log('✅ Expense auto-created for harvest:', result.expense);
    } else {
        console.warn('⚠️ Could not auto-create expense:', result.message);
    }

    return result;
};

export default { createExpenseFromHarvest, onHarvestRecorded };
