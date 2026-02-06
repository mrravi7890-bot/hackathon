import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { LocationCard } from '../components/common/LocationCard';
import { locationAPI } from '../lib/api';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';

export default function PlacesPage() {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [crowdFilter, setCrowdFilter] = useState('all');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await locationAPI.getAll();
                setLocations(response.data);
                setFilteredLocations(response.data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        let result = [...locations];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (loc) =>
                    loc.name.toLowerCase().includes(query) ||
                    loc.city.toLowerCase().includes(query) ||
                    loc.state.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter((loc) => loc.category === categoryFilter);
        }

        // Crowd filter
        if (crowdFilter !== 'all') {
            result = result.filter((loc) => loc.current_crowd_level === crowdFilter);
        }

        setFilteredLocations(result);
    }, [searchQuery, categoryFilter, crowdFilter, locations]);

    const categories = [...new Set(locations.map((loc) => loc.category))];

    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setCrowdFilter('all');
    };

    return (
        <div className="min-h-screen py-8" data-testid="places-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">
                        Tourist <span className="text-cyan-400">Destinations</span>
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Discover {locations.length} amazing places across India
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-xl p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, city, or state..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                                data-testid="search-input"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger 
                                className="w-full md:w-48 bg-slate-900/50 border-slate-700 text-slate-100"
                                data-testid="category-filter"
                            >
                                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all" className="text-slate-100">
                                    All Categories
                                </SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-slate-100">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Crowd Filter */}
                        <Select value={crowdFilter} onValueChange={setCrowdFilter}>
                            <SelectTrigger 
                                className="w-full md:w-48 bg-slate-900/50 border-slate-700 text-slate-100"
                                data-testid="crowd-filter"
                            >
                                <SelectValue placeholder="Crowd Level" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all" className="text-slate-100">
                                    All Levels
                                </SelectItem>
                                <SelectItem value="Low" className="text-emerald-400">
                                    Low Crowd
                                </SelectItem>
                                <SelectItem value="Medium" className="text-amber-400">
                                    Medium Crowd
                                </SelectItem>
                                <SelectItem value="High" className="text-red-400">
                                    High Crowd
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {(searchQuery || categoryFilter !== 'all' || crowdFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-slate-400 hover:text-slate-100"
                                data-testid="clear-filters-btn"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>
                        Showing {filteredLocations.length} of {locations.length} locations
                    </span>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : filteredLocations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredLocations.map((location) => (
                            <LocationCard key={location.id} location={location} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">
                            No locations found
                        </h3>
                        <p className="text-slate-500 mb-4">
                            Try adjusting your filters or search query
                        </p>
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="border-slate-700 text-slate-300"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
