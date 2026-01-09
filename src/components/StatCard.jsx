export default function StatCard({ title, count, colorClass }) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase mb-2 sm:mb-3">{title}</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${colorClass}`}>{count}</p>
        </div>
    );
}
