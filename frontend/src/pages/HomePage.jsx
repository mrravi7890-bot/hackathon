import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LocationCard } from '../components/common/LocationCard';
import { LeafletMap } from '../components/map/LeafletMap';
import { locationAPI, analyticsAPI } from '../lib/api';
import { 
    MapPin, 
    TrendingUp, 
    Users, 
    Clock,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function HomePage() {
    const [locations, setLocations] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, heatRes] = await Promise.all([
                    locationAPI.getAll(),
                    analyticsAPI.getHeatmap()
                ]);
                setLocations(locRes.data);
                setHeatmapData(heatRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const featuredLocations = locations.slice(0, 4);

    return (
        <div className="min-h-screen" data-testid="home-page">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1665849863716-b527b5e9ed62?w=1920"
                        alt="Hero background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>Real-time Tourism Intelligence</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight">
                            Discover India's{' '}
                            <span className="gradient-text">Hidden Gems</span>{' '}
                            Without the Crowds
                        </h1>

                        <p className="text-lg text-slate-400 max-w-2xl">
                            Get live crowd updates, best visiting times, and smart recommendations
                            for tourist destinations across India. Plan smarter, travel better.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/places">
                                <Button 
                                    size="lg" 
                                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold gap-2"
                                    data-testid="explore-places-btn"
                                >
                                    Explore Places
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/heatmap">
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2"
                                    data-testid="view-heatmap-btn"
                                >
                                    <MapPin className="w-4 h-4" />
                                    View Live Heatmap
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="relative z-10 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">{locations.length}+</div>
                                <div className="text-sm text-slate-500 mt-1">Tourist Spots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">Real-time</div>
                                <div className="text-sm text-slate-500 mt-1">Crowd Updates</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">24/7</div>
                                <div className="text-sm text-slate-500 mt-1">Live Monitoring</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">100%</div>
                                <div className="text-sm text-slate-500 mt-1">Free Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Heatmap Preview */}
            <section className="py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                                Live Crowd Heatmap
                            </h2>
                            <p className="text-slate-400 mt-2">
                                Real-time visualization of tourist density across locations
                            </p>
                        </div>
                        <Link to="/heatmap">
                            <Button variant="ghost" className="text-cyan-400 hover:bg-cyan-500/10 gap-2">
                                Full Screen Map
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="h-[400px] rounded-xl bg-card animate-pulse" />
                    ) : (
                        <LeafletMap 
                            locations={heatmapData} 
                            height="400px"
                        />
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-400">Low Crowd</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-amber-500" />
                            <span className="text-sm text-slate-400">Medium Crowd</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-red-500" />
                            <span className="text-sm text-slate-400">High Crowd</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Places */}
            <section className="py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                                Popular Destinations
                            </h2>
                            <p className="text-slate-400 mt-2">
                                Explore top-rated tourist attractions with live crowd status
                            </p>
                        </div>
                        <Link to="/places">
                            <Button variant="ghost" className="text-cyan-400 hover:bg-cyan-500/10 gap-2">
                                View All Places
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-80 rounded-xl bg-card animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredLocations.map((location) => (
                                <LocationCard key={location.id} location={location} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                            Why Choose VisitMap?
                        </h2>
                        <p className="text-slate-400 mt-2">
                            Smart features for smarter travel planning
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-xl bg-card border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                Real-time Analytics
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Live footfall data and crowd density updates for all monitored locations.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-card border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                Best Time Recommendations
                            </h3>
                            <p className="text-slate-400 text-sm">
                                AI-powered suggestions for optimal visiting hours based on historical data.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-card border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                Community Feedback
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Real visitor reviews and ratings to help you plan your perfect trip.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
                        <div className="relative p-8 md:p-12 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
                                Ready to Explore?
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                Start planning your next adventure with real-time crowd insights
                                and smart recommendations.
                            </p>
                            <Link to="/places">
                                <Button 
                                    size="lg"
                                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold"
                                    data-testid="cta-explore-btn"
                                >
                                    Start Exploring
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                            <span className="font-semibold text-slate-100">
                                Visit<span className="text-cyan-400">Map</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2024 VisitMap. Tourism Intelligence Platform.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
