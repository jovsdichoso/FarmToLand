export default function StatusBadge({ status }) {
    const config = {
        CLEARED: { style: 'bg-green-50 text-green-700 border-green-200', label: 'Cleared' },
        RETURNED: { style: 'bg-red-50 text-red-700 border-red-200', label: 'Returned' },
        PENDING_REVIEW: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending Review' },
        ON_HOLD: { style: 'bg-gray-50 text-gray-700 border-gray-200', label: 'On Hold' }
    };
    const { style, label } = config[status] || config.ON_HOLD;

    return (
        <span className={`px-3 py-1 rounded text-xs font-semibold border ${style}`}>
            {label}
        </span>
    );
}
