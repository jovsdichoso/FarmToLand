export default function StatusBadge({ status }) {
    const config = {
        // --- STEP 1 STATUSES ---
        PENDING_REVIEW: {
            style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            label: 'Pending Review'
        },
        RETURNED: {
            style: 'bg-red-50 text-red-700 border-red-200',
            label: 'Returned'
        },
        ON_HOLD: {
            style: 'bg-gray-50 text-gray-700 border-gray-200',
            label: 'On Hold'
        },
        CLEARED: {
            style: 'bg-green-50 text-green-700 border-green-200',
            label: 'Cleared (Step 1)'
        },

        // --- STEP 2 STATUSES ---
        SCORED: {
            style: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Scored (Step 2)'
        },

        // --- STEP 3/4 STATUSES (NEW) ---
        step3_pending: {
            style: 'bg-orange-50 text-orange-700 border-orange-200',
            label: 'Returned (Step 3)'
        },
        step4_bidding: {
            style: 'bg-purple-50 text-purple-700 border-purple-200',
            label: 'Ready for Bidding'
        }
    };

    // Fallback for unknown statuses or mixed case
    const { style, label } = config[status] || {
        style: 'bg-gray-100 text-gray-600 border-gray-200',
        label: status ? String(status).replace(/_/g, ' ') : 'Unknown'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${style} whitespace-nowrap`}>
            {label}
        </span>
    );
}