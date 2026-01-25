export default function StatusBadge({ status }) {
    const config = {
        // --- STEP 1: PROPOSAL & REVIEW ---
        PENDING_REVIEW: {
            style: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            label: 'Pending Review (Step 1)'
        },
        RETURNED: {
            style: 'bg-red-50 text-red-700 border-red-200',
            label: 'Returned for Correction'
        },
        ON_HOLD: {
            style: 'bg-gray-50 text-gray-700 border-gray-200',
            label: 'On Hold'
        },
        CLEARED: {
            style: 'bg-green-50 text-green-700 border-green-200',
            label: 'Cleared (Step 1)'
        },

        // --- STEP 2: SCORING & FUNDING (The Missing Part) ---
        SCORED: {
            style: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Scored (Step 2)'
        },
        'NEP-INCLUDED': {
            style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'NEP Listed'
        },
        'GAA-INCLUDED': {
            style: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-black', // Highlighted
            label: 'GAA Funded (Ready for Step 3)'
        },

        // --- STEP 3: DETAILED ENGINEERING ---
        step3_pending: {
            style: 'bg-orange-50 text-orange-700 border-orange-200',
            label: 'Validating Design (Step 3)'
        },
        step3_escalated: {
            style: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Escalated / Technical Review'
        },

        // --- STEP 4: PROCUREMENT ---
        step4_bidding: {
            style: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            label: 'Bid Docs Prep'
        },
        STEP4_DOCS_SUBMITTED: {
            style: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Posting Clearance Pending'
        },
        STEP4_POSTED: {
            style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'Under Bidding (Posted)'
        },
        STEP4_AWARDED: {
            style: 'bg-green-100 text-green-800 border-green-200 font-black',
            label: 'Awarded'
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