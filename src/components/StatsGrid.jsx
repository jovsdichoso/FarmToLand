import StatCard from './StatCard';
import { StatsSkeleton } from './SkeletonLoader';

export default function StatsGrid({ projects, isLoading }) {
    if (isLoading) {
        return <StatsSkeleton />;
    }

    const pendingCount = projects.filter(p => p.status === 'PENDING_REVIEW').length;
    const returnedCount = projects.filter(p => p.status === 'RETURNED').length;
    const clearedCount = projects.filter(p => p.status === 'CLEARED').length;
    const onHoldCount = projects.filter(p => p.status === 'ON_HOLD').length;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard title="Pending Review" count={pendingCount} colorClass="text-yellow-600" />
            <StatCard title="Returned" count={returnedCount} colorClass="text-red-600" />
            <StatCard title="Cleared Step 1" count={clearedCount} colorClass="text-green-600" />
            <StatCard title="On Hold" count={onHoldCount} colorClass="text-gray-600" />
        </div>
    );
}
