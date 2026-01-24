import StatCard from './StatCard';
import { StatsSkeleton } from './SkeletonLoader';

export default function StatsGrid({ projects, isLoading }) {
    if (isLoading) {
        return <StatsSkeleton />;
    }

    // 1. Pending Review: Any project waiting for Validator/BAFE Action (Step 1 or Step 3)
    const pendingCount = projects.filter(p =>
        p.status === 'PENDING_REVIEW' ||
        p.status === 'step3_pending' ||
        p.status === 'step3_escalated'
    ).length;

    // 2. Returned: Needs Implementing Office (RO) Correction
    const returnedCount = projects.filter(p =>
        p.status === 'RETURNED'
    ).length;

    // 3. For Design / GAA Ready: Projects that have Funding but need Engineering Docs
    // (This replaces 'Cleared Step 1' as the more important metric now)
    const forDesignCount = projects.filter(p =>
        p.status === 'GAA-INCLUDED' ||
        p.status === 'SCORED' ||
        p.status === 'NEP-INCLUDED'
    ).length;

    // 4. Under Bidding: Projects that passed Step 3 and are in Procurement (Step 4)
    const biddingCount = projects.filter(p =>
        p.status === 'step4_bidding' ||
        (p.status && p.status.startsWith('STEP4_'))
    ).length;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Yellow: Needs Validation */}
            <StatCard title="Pending Validation" count={pendingCount} colorClass="text-yellow-600" />

            {/* Red: Needs Correction */}
            <StatCard title="Returned" count={returnedCount} colorClass="text-red-600" />

            {/* Blue: Ready for Detailed Engineering */}
            <StatCard title="For Design / GAA" count={forDesignCount} colorClass="text-blue-600" />

            {/* Purple: Active Procurement */}
            <StatCard title="Under Bidding" count={biddingCount} colorClass="text-purple-600" />
        </div>
    );
}