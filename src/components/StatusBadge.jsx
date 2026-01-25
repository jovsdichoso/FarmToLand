export default function StatusBadge({ status }) {
    const config = {
        // --- STEP 1 STATUSES ---
        PENDING_REVIEW: {
            style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            label: 'Pending Review (Step 1)'
        },
        RETURNED: {
            style: 'bg-red-50 text-red-700 border-red-200',
            label: 'Returned for Correction' // Generic return (Step 1 or 3)
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
        'NEP-INCLUDED': {
            style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'NEP Included'
        },
        'GAA-INCLUDED': {
            style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'GAA Funded (Open for Step 3)'
        },

        // --- STEP 3 STATUSES (Engineering) ---
        step3_pending: {
            style: 'bg-orange-50 text-orange-700 border-orange-200',
            label: 'Pending Validation (Step 3)' // <--- FIXED: Was "Returned"
        },
        step3_escalated: {
            style: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Escalated / Review'
        },

        // --- STEP 4 STATUSES (Procurement) ---
        step4_bidding: {
            style: 'bg-purple-50 text-purple-700 border-purple-200',
            label: 'Under Bidding'
        },
        STEP4_DOCS_SUBMITTED: {
            style: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Posting Clearance Pending'
        }
    };

    // Fallback for unknown statuses or mixed case
    const { style, label } = config[status] || {
        style: 'bg-gray-100 text-gray-600 border-gray-200',
        label: status ? String(status).replace(/_/g, ' ') : 'Unknown'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${style} whitespace-nowrap`}>
            {label}
        </span>
    );
}