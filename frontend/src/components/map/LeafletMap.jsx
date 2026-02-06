import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { CrowdBadge } from '../common/CrowdBadge';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit bounds
const FitBounds = ({ locations }) => {
    const map = useMap();
    
    useEffect(() => {
        if (locations && locations.length > 0) {
            const bounds = L.latLngBounds(
                locations.map(loc => [loc.latitude, loc.longitude])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);
    
    return null;
};

export const LeafletMap = ({ 
    locations = [], 
    center = [20.5937, 78.9629], 
    zoom = 5,
    height = '500px',
    showPopups = true 
}) => {
    const getCrowdColor = (level) => {
        switch (level) {
            case 'Low':
                return '#10b981';
            case 'Medium':
                return '#f59e0b';
            case 'High':
                return '#ef4444';
            default:
                return '#06b6d4';
        }
    };

    const getRadius = (footfall) => {
        const base = 15;
        const scale = Math.min(footfall / 100, 3);
        return base + (scale * 10);
    };

    return (
        <div 
            className="rounded-xl overflow-hidden border border-slate-700/50"
            style={{ height }}
            data-testid="leaflet-map"
        >
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {locations.length > 0 && <FitBounds locations={locations} />}
                
                {locations.map((location) => (
                    <CircleMarker
                        key={location.id}
                        center={[location.latitude, location.longitude]}
                        radius={getRadius(location.footfall || location.current_footfall || 100)}
                        pathOptions={{
                            color: getCrowdColor(location.crowd_level || location.current_crowd_level),
                            fillColor: getCrowdColor(location.crowd_level || location.current_crowd_level),
                            fillOpacity: 0.4,
                            weight: 2,
                        }}
                    >
                        {showPopups && (
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="font-semibold text-slate-900 mb-2">
                                        {location.name}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-slate-600">
                                            <span className="font-medium">Footfall:</span>{' '}
                                            {location.footfall || location.current_footfall}
                                        </p>
                                        <p className="text-slate-600">
                                            <span className="font-medium">Status:</span>{' '}
                                            <span className={
                                                (location.crowd_level || location.current_crowd_level) === 'Low' 
                                                    ? 'text-emerald-600' 
                                                    : (location.crowd_level || location.current_crowd_level) === 'Medium'
                                                        ? 'text-amber-600'
                                                        : 'text-red-600'
                                            }>
                                                {location.crowd_level || location.current_crowd_level}
                                            </span>
                                        </p>
                                    </div>
                                    <Link
                                        to={`/places/${location.id}`}
                                        className="mt-3 inline-block text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </Popup>
                        )}
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};
