import { useState, useEffect } from 'react';
import { LeafletMap } from '../components/map/LeafletMap';
import { analyticsAPI } from '../lib/api';
import { Loader2, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function HeatmapPage() {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHeatmap = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const response = await analyticsAPI.getHeatmap();
            setHeatmapData(response.data);
        } catch (error) {
            console.error('Failed to fetch heatmap:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHeatmap();
        // Auto refresh every 30 seconds
        const interval = setInterval(() => fetchHeatmap(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const crowdCounts = heatmapData.reduce(
        (acc, loc) => {
            acc[loc.crowd_level] = (acc[loc.crowd_level] || 0) + 1;
            return acc;
        },
        { Low: 0, Medium: 0, High: 0 }
    );

    return (
        <div className="min-h-screen py-8" data-testid="heatmap-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">
                            Live Crowd <span className="text-cyan-400">Heatmap</span>
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Real-time visualization of tourist density across India
                        </p>
                    </div>
                    <Button
                        onClick={() => fetchHeatmap(true)}
                        disabled={refreshing}
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        data-testid="refresh-heatmap-btn"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-400">Low Crowd</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">{crowdCounts.Low}</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm text-slate-400">Medium Crowd</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">{crowdCounts.Medium}</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm text-slate-400">High Crowd</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">{crowdCounts.High}</div>
                    </div>
                </div>

                {/* Map */}
                {loading ? (
                    <div className="h-[600px] rounded-xl bg-card flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <LeafletMap 
                        locations={heatmapData} 
                        height="600px"
                        showPopups={true}
                    />
                )}

                {/* Legend */}
                <div className="mt-6 glass-card rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/40 border-2 border-emerald-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-100">Low</div>
                                <div className="text-xs text-slate-500">&lt; 100 visitors</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/40 border-2 border-amber-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-100">Medium</div>
                                <div className="text-xs text-slate-500">100-300 visitors</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/40 border-2 border-red-500" />
                            <div>
                                <div className="text-sm font-medium text-slate-100">High</div>
                                <div className="text-xs text-slate-500">&gt; 300 visitors</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        Circle size represents relative crowd density. Click on markers for details.
                    </p>
                </div>
            </div>
        </div>
    );
}
