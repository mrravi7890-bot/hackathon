import { useState, useEffect } from 'react';
import { feedbackAPI, locationAPI } from '../lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Loader2, MessageSquare, Star, Search, MapPin } from 'lucide-react';

export default function AdminFeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [feedbackRes, locRes] = await Promise.all([
                    feedbackAPI.getAll(),
                    locationAPI.getAll(),
                ]);
                setFeedbacks(feedbackRes.data);
                setLocations(locRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getLocationName = (locationId) => {
        const loc = locations.find((l) => l.id === locationId);
        return loc?.name || 'Unknown Location';
    };

    const filteredFeedbacks = feedbacks.filter((fb) => {
        const matchesLocation = selectedLocation === 'all' || fb.location_id === selectedLocation;
        const matchesSearch = !searchQuery || 
            fb.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.comment.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLocation && matchesSearch;
    });

    const averageRating = filteredFeedbacks.length > 0
        ? (filteredFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / filteredFeedbacks.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" data-testid="admin-feedbacks-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-100">
                        Visitor <span className="text-cyan-400">Feedback</span>
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Review and manage user feedback across all locations
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card rounded-xl p-6 text-center">
                        <MessageSquare className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-slate-100">{filteredFeedbacks.length}</div>
                        <div className="text-sm text-slate-400">Total Reviews</div>
                    </div>
                    <div className="glass-card rounded-xl p-6 text-center">
                        <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-slate-100">{averageRating}</div>
                        <div className="text-sm text-slate-400">Average Rating</div>
                    </div>
                    <div className="glass-card rounded-xl p-6 text-center">
                        <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-slate-100">
                            {new Set(feedbacks.map(f => f.location_id)).size}
                        </div>
                        <div className="text-sm text-slate-400">Locations Reviewed</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or comment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100"
                                data-testid="search-feedbacks-input"
                            />
                        </div>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger 
                                className="w-full md:w-64 bg-slate-900/50 border-slate-700 text-slate-100"
                                data-testid="location-filter"
                            >
                                <SelectValue placeholder="Filter by location" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all" className="text-slate-100">
                                    All Locations
                                </SelectItem>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id} className="text-slate-100">
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Feedbacks List */}
                {filteredFeedbacks.length > 0 ? (
                    <div className="space-y-4">
                        {filteredFeedbacks.map((feedback) => (
                            <div
                                key={feedback.id}
                                className="glass-card rounded-xl p-6"
                                data-testid={`feedback-item-${feedback.id}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-100">{feedback.user_name}</h3>
                                        <p className="text-sm text-slate-400">{feedback.user_email}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${
                                                        star <= feedback.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-500">
                                            {new Date(feedback.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-slate-300 mb-4">{feedback.comment}</p>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-400 pt-4 border-t border-slate-700/50">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span>{getLocationName(feedback.location_id)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">
                            No feedback found
                        </h3>
                        <p className="text-slate-500">
                            {searchQuery || selectedLocation !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Visitor feedback will appear here'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
