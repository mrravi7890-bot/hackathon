import { cn } from '../../lib/utils';

export const CrowdBadge = ({ level, size = 'default', showDot = true, className }) => {
    const levelConfig = {
        Low: {
            bg: 'bg-emerald-500/20',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30',
            dot: 'bg-emerald-500',
        },
        Medium: {
            bg: 'bg-amber-500/20',
            text: 'text-amber-400',
            border: 'border-amber-500/30',
            dot: 'bg-amber-500',
        },
        High: {
            bg: 'bg-red-500/20',
            text: 'text-red-400',
            border: 'border-red-500/30',
            dot: 'bg-red-500',
        },
    };

    const sizeConfig = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const config = levelConfig[level] || levelConfig.Low;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium transition-transform crowd-badge',
                config.bg,
                config.text,
                config.border,
                sizeConfig[size],
                className
            )}
            data-testid={`crowd-badge-${level?.toLowerCase()}`}
        >
            {showDot && (
                <span className={cn('w-2 h-2 rounded-full animate-pulse', config.dot)} />
            )}
            {level}
        </span>
    );
};
