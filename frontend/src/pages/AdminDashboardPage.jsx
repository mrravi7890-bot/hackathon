import { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { CrowdBadge } from '../components/common/CrowdBadge';
import { analyticsAPI, locationAPI, exportAPI } from '../lib/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import {
    MapPin,
    Users,
    TrendingUp,
    Star,
    Download,
    FileText,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState(null);
    const [footfallData, setFootfallData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    const fetchData = async () => {
        try {
            const [summaryRes, footfallRes, locRes] = await Promise.all([
                analyticsAPI.getSummary(),
                analyticsAPI.getFootfall(null, period),
                locationAPI.getAll(),
            ]);
            setSummary(summaryRes.data);
            setFootfallData(footfallRes.data);
            setLocations(locRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const response = type === 'csv' 
                ? await exportAPI.downloadCSV()
                : await exportAPI.downloadPDF();
            
            const blob = new Blob([response.data], { 
                type: type === 'csv' ? 'text/csv' : 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tourism_data_${new Date().toISOString().split('T')[0]}.${type}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success(`${type.toUpperCase()} exported successfully`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed');
        } finally {
            setExporting(null);
        }
    };

    const crowdPieData = summary ? [
        { name: 'Low', value: summary.crowd_distribution.Low, color: '#10b981' },
        { name: 'Medium', value: summary.crowd_distribution.Medium, color: '#f59e0b' },
        { name: 'High', value: summary.crowd_distribution.High, color: '#ef4444' },
    ] : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" data-testid="admin-dashboard-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">
                            Admin <span className="text-cyan-400">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Tourism analytics and footfall management
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={() => fetchData()}
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            data-testid="refresh-dashboard-btn"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => handleExport('csv')}
                            disabled={exporting === 'csv'}
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            data-testid="export-csv-btn"
                        >
                            {exporting === 'csv' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            CSV
                        </Button>
                        <Button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting === 'pdf'}
                            className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                            data-testid="export-pdf-btn"
                        >
                            {exporting === 'pdf' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4 mr-2" />
                            )}
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Locations"
                        value={summary?.total_locations || 0}
                        icon={MapPin}
                    />
                    <StatCard
                        title="Total Footfall"
                        value={summary?.total_footfall?.toLocaleString() || 0}
                        icon={Users}
                        trend={12}
                    />
                    <StatCard
                        title="Total Feedbacks"
                        value={summary?.total_feedbacks || 0}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Average Rating"
                        value={summary?.average_rating || 0}
                        subtitle="out of 5"
                        icon={Star}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Footfall Trend Chart */}
                    <div className="lg:col-span-2 glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-100">
                                Footfall Trend
                            </h3>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-slate-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="daily" className="text-slate-100">Daily</SelectItem>
                                    <SelectItem value="weekly" className="text-slate-100">Weekly</SelectItem>
                                    <SelectItem value="monthly" className="text-slate-100">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={footfallData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis 
                                        dataKey={period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'}
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            if (period === 'daily') return value.split('-').slice(1).join('/');
                                            return value;
                                        }}
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
                                    <Bar 
                                        dataKey="average" 
                                        fill="#06b6d4"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Crowd Distribution Pie */}
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-6">
                            Crowd Distribution
                        </h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={crowdPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {crowdPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                        }}
                                        labelStyle={{ color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {crowdPieData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-slate-400">
                                        {item.name} ({item.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Locations Table */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50">
                        <h3 className="text-lg font-semibold text-slate-100">
                            Location Overview
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                                        City
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                                        Footfall
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((location) => (
                                    <tr 
                                        key={location.id}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={location.image_url}
                                                    alt={location.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100';
                                                    }}
                                                />
                                                <span className="font-medium text-slate-100">
                                                    {location.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {location.city}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-sm">
                                                {location.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-slate-100">
                                                {location.current_footfall}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <CrowdBadge level={location.current_crowd_level} size="sm" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
