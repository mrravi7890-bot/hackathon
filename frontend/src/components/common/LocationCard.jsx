import { Link } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import { CrowdBadge } from './CrowdBadge';
import { cn } from '../../lib/utils';

export const LocationCard = ({ location, className }) => {
    return (
        <Link
            to={`/places/${location.id}`}
            className={cn(
                'location-card block rounded-xl bg-card border border-slate-700/50 overflow-hidden group',
                className
            )}
            data-testid={`location-card-${location.id}`}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={location.image_url}
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                
                {/* Crowd Badge */}
                <div className="absolute top-3 right-3">
                    <CrowdBadge level={location.current_crowd_level} size="sm" />
                </div>
                
                {/* Category */}
                <div className="px-3 py-1 rounded-md bg-slate-900/60 backdrop-blur-sm text-xs text-orange-400 border border-orange-500/20">
                        {location.category}
                    </span>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                    {location.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{location.city}, {location.state}</span>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2">
                    {location.description}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="line-clamp-1">{location.best_time_to_visit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{location.current_footfall}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
