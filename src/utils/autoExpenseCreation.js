// Utility function to automatically create an expense record when farmer harvest is recorded
// This helps track aggregation costs as expenses

const EXPENSE_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/expenses/`;

// In-memory set to avoid creating duplicate expenses for the same harvest within this session
const processedHarvestIds = new Set();

// Helper: normalize date to YYYY-MM-DD. Returns null if invalid.
const normalizeDate = (input) => {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Helper: try to find an existing expense that matches supplier, amount and date to avoid duplicates
const findExistingExpense = async (supplier, amount, date, harvestId) => {
    try {
        // Fetch recent expenses (assume API returns either array or paginated {results: []})
        const res = await fetch(EXPENSE_API_ENDPOINT);
        if (!res.ok) return null;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);

        // Look for exact matches (category 'Aggregation' and matching supplier, amount and date)
        const match = list.find(e => {
            const sameSupplier = String(e.supplier || '').trim().toLowerCase() === String(supplier || '').trim().toLowerCase();
            const sameCategory = (e.category || '').toLowerCase() === 'aggregation';
            const sameAmount = Number(e.amount) === Number(amount);
            const sameDate = String(e.date || '') === String(date || '');
            const basicMatch = sameSupplier && sameCategory && sameAmount && sameDate;
            if (harvestId) {
                const desc = String(e.description || '').toLowerCase();
                if (desc.includes(String(harvestId).toLowerCase())) return true;
            }
            return basicMatch;
        });

        return match || null;
    } catch (err) {
        console.warn('Could not check existing expenses for duplicates:', err);
        return null;
    }
};

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
        const normalizedDate = normalizeDate(harvestData.date) || new Date().toISOString().substring(0, 10);
        const amountNumber = Number(parseFloat(harvestData.amount_paid || harvestData.amount || 0));

        const expenseData = {
            expense_name: `Farmer Aggregation - ${harvestData.farmer_name || 'Unknown Farmer'}`,
            category: 'Aggregation',
            item: `Coffee Harvest${harvestData.weight ? ` (${harvestData.weight} kg)` : ''}`,
            supplier: harvestData.farmer_name || 'Unknown Farmer',
            description: `Automatic expense created from farmer harvest record. Farmer: ${harvestData.farmer_name}, Village: ${harvestData.village || 'N/A'}` + (harvestData.harvest_id ? ` | harvest_id: ${harvestData.harvest_id}` : ''),
            amount: amountNumber,
            date: normalizedDate,
            location: harvestData.village || 'N/A',
        };

        console.log('Creating expense from harvest:', expenseData);

        // Check for existing expense to avoid duplicates
    const existing = await findExistingExpense(expenseData.supplier, expenseData.amount, expenseData.date, harvestData.harvest_id);
        if (existing) {
            console.log('Found existing expense matching harvest — skipping create:', existing);
            return {
                success: true,
                expense: existing,
                message: 'Existing expense matched; skip creation'
            };
        }

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
    // Prevent duplicate processing in this session when we have a harvest identifier
    const harvestIdentifier = harvestRecord.harvest_id || harvestRecord.id || harvestRecord.harvestId || null;
    if (harvestIdentifier && processedHarvestIds.has(String(harvestIdentifier))) {
        console.log('onHarvestRecorded: harvest already processed in this session, skipping:', harvestIdentifier);
        return { success: true, message: 'Already processed in session', expense: null };
    }
    // Extract necessary data
    const harvestData = {
        farmer_name: farmerDetails?.farmer_name || 'Unknown Farmer',
        village: farmerDetails?.village || 'N/A',
        amount_paid: harvestRecord.amount_paid || harvestRecord.total_amount || 0,
        date: harvestRecord.date_of_delivery || harvestRecord.date || new Date().toISOString().substring(0, 10),
        weight: harvestRecord.weight_delivered || harvestRecord.weight || harvestRecord.quantity,
        harvest_id: harvestIdentifier,
    };

    // Create the expense record
    const result = await createExpenseFromHarvest(harvestData);

    if (result.success) {
        console.log('✅ Expense auto-created for harvest:', result.expense);
        if (harvestIdentifier) processedHarvestIds.add(String(harvestIdentifier));
    } else {
        console.warn('⚠️ Could not auto-create expense:', result.message);
    }

    return result;
};

export default { createExpenseFromHarvest, onHarvestRecorded };
