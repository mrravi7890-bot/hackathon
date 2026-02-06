import { cn } from '../../lib/utils';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, className }) => {
    return (
        <div
            className={cn(
                'stat-card relative rounded-xl bg-card border border-slate-700/50 p-6 transition-all hover:border-cyan-500/30',
                className
            )}
            data-testid={`stat-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <p className="text-3xl font-bold text-slate-100">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            'flex items-center gap-1 text-sm',
                            trend > 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                            <span>{trend > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend)}% from yesterday</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
};
