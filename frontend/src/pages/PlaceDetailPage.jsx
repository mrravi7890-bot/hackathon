import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { CrowdBadge } from '../components/common/CrowdBadge';
import { LeafletMap } from '../components/map/LeafletMap';
import { locationAPI, feedbackAPI, analyticsAPI } from '../lib/api';
import { toast } from 'sonner';
import {
    MapPin,
    Clock,
    Users,
    IndianRupee,
    Calendar,
    Star,
    ArrowLeft,
    Send,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function PlaceDetailPage() {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({
        user_name: '',
        user_email: '',
        rating: 5,
        comment: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, hourlyRes, feedbackRes] = await Promise.all([
                    locationAPI.getOne(id),
                    analyticsAPI.getHourly(),
                    feedbackAPI.getAll(id),
                ]);
                setLocation(locRes.data);
                setHourlyData(hourlyRes.data);
                setFeedbacks(feedbackRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load location details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await feedbackAPI.submit({
                ...feedback,
                location_id: id,
            });
            toast.success('Thank you for your feedback!');
            setFeedback({ user_name: '', user_email: '', rating: 5, comment: '' });
            // Refresh feedbacks
            const res = await feedbackAPI.getAll(id);
            setFeedbacks(res.data);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (!location) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <MapPin className="w-12 h-12 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-300">Location not found</h2>
                <Link to="/places">
                    <Button variant="outline" className="border-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Places
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" data-testid="place-detail-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link to="/" className="hover:text-cyan-400 transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to="/places" className="hover:text-cyan-400 transition-colors">
                        Places
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-100">{location.name}</span>
                </nav>

                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden mb-8">
                    <img
                        src={location.image_url}
                        alt={location.name}
                        className="w-full h-64 md:h-96 object-cover"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-sm border border-cyan-500/30">
                                        {location.category}
                                    </span>
                                    <CrowdBadge level={location.current_crowd_level} />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {location.name}
                                </h1>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span>{location.city}, {location.state}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-700/50">
                                <Users className="w-5 h-5 text-cyan-400" />
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {location.current_footfall}
                                    </div>
                                    <div className="text-xs text-slate-400">Current Visitors</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-slate-100 mb-4">About</h2>
                            <p className="text-slate-300 leading-relaxed">
                                {location.description}
                            </p>
                        </div>

                        {/* Hourly Pattern Chart */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-slate-100 mb-4">
                                Crowd Pattern (Today)
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hourlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis 
                                            dataKey="hour" 
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                            }}
                                            labelStyle={{ color: '#f8fafc' }}
                                            itemStyle={{ color: '#06b6d4' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="footfall"
                                            stroke="#06b6d4"
                                            strokeWidth={2}
                                            dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#06b6d4' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-slate-100 mb-4">Location</h2>
                            <LeafletMap
                                locations={[location]}
                                center={[location.latitude, location.longitude]}
                                zoom={13}
                                height="300px"
                                showPopups={false}
                            />
                        </div>

                        {/* Feedback Form */}
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-slate-100 mb-4">
                                Share Your Experience
                            </h2>
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">
                                            Your Name
                                        </label>
                                        <Input
                                            value={feedback.user_name}
                                            onChange={(e) =>
                                                setFeedback({ ...feedback, user_name: e.target.value })
                                            }
                                            placeholder="John Doe"
                                            required
                                            className="bg-slate-900/50 border-slate-700 text-slate-100"
                                            data-testid="feedback-name-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={feedback.user_email}
                                            onChange={(e) =>
                                                setFeedback({ ...feedback, user_email: e.target.value })
                                            }
                                            placeholder="john@example.com"
                                            required
                                            className="bg-slate-900/50 border-slate-700 text-slate-100"
                                            data-testid="feedback-email-input"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">
                                        Rating
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFeedback({ ...feedback, rating: star })}
                                                className="p-1 transition-transform hover:scale-110"
                                                data-testid={`rating-star-${star}`}
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${
                                                        star <= feedback.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">
                                        Your Review
                                    </label>
                                    <Textarea
                                        value={feedback.comment}
                                        onChange={(e) =>
                                            setFeedback({ ...feedback, comment: e.target.value })
                                        }
                                        placeholder="Share your experience..."
                                        required
                                        rows={4}
                                        className="bg-slate-900/50 border-slate-700 text-slate-100"
                                        data-testid="feedback-comment-input"
                                    />
                                </div>
                                
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-medium"
                                    data-testid="submit-feedback-btn"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Submit Feedback
                                </Button>
                            </form>
                        </div>

                        {/* Reviews */}
                        {feedbacks.length > 0 && (
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-slate-100 mb-4">
                                    Visitor Reviews ({feedbacks.length})
                                </h2>
                                <div className="space-y-4">
                                    {feedbacks.slice(0, 5).map((fb) => (
                                        <div
                                            key={fb.id}
                                            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h4 className="font-medium text-slate-100">
                                                        {fb.user_name}
                                                    </h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${
                                                                    star <= fb.rating
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'text-slate-600'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(fb.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400">{fb.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">
                                Quick Info
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-cyan-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-slate-400">Opening Hours</div>
                                        <div className="text-slate-100">{location.opening_hours}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <IndianRupee className="w-5 h-5 text-cyan-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-slate-400">Entry Fee</div>
                                        <div className="text-slate-100">{location.entry_fee}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-slate-400">Best Time to Visit</div>
                                        <div className="text-slate-100">{location.best_time_to_visit}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">
                                Live Status
                            </h3>
                            <div className="text-center">
                                <CrowdBadge level={location.current_crowd_level} size="lg" />
                                <div className="mt-4">
                                    <div className="text-4xl font-bold text-slate-100">
                                        {location.current_footfall}
                                    </div>
                                    <div className="text-sm text-slate-400">Current Visitors</div>
                                </div>
                                <p className="text-sm text-slate-500 mt-4">
                                    {location.current_crowd_level === 'Low' && 'Great time to visit! Low crowd expected.'}
                                    {location.current_crowd_level === 'Medium' && 'Moderate crowd. Plan accordingly.'}
                                    {location.current_crowd_level === 'High' && 'High crowd. Consider visiting later.'}
                                </p>
                            </div>
                        </div>

                        {/* Back Button */}
                        <Link to="/places" className="block">
                            <Button
                                variant="outline"
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to All Places
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
