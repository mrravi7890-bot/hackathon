import { useState, useEffect } from 'react';
import { locationAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { CrowdBadge } from '../components/common/CrowdBadge';
import { toast } from 'sonner';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    MapPin,
    Search,
} from 'lucide-react';

const CATEGORIES = ['Monument', 'Religious Site', 'Natural', 'Beach', 'Palace', 'Fort', 'Museum', 'Park'];

const initialFormData = {
    name: '',
    description: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    image_url: '',
    category: '',
    best_time_to_visit: '',
    opening_hours: '',
    entry_fee: '',
};

export default function AdminLocationsPage() {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const fetchLocations = async () => {
        try {
            const response = await locationAPI.getAll();
            setLocations(response.data);
            setFilteredLocations(response.data);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            toast.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            setFilteredLocations(
                locations.filter(
                    (loc) =>
                        loc.name.toLowerCase().includes(query) ||
                        loc.city.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredLocations(locations);
        }
    }, [searchQuery, locations]);

    const handleOpenDialog = (location = null) => {
        if (location) {
            setEditingId(location.id);
            setFormData({
                name: location.name,
                description: location.description,
                city: location.city,
                state: location.state,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                image_url: location.image_url,
                category: location.category,
                best_time_to_visit: location.best_time_to_visit,
                opening_hours: location.opening_hours,
                entry_fee: location.entry_fee,
            });
        } else {
            setEditingId(null);
            setFormData(initialFormData);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        const data = {
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
        };

        try {
            if (editingId) {
                await locationAPI.update(editingId, data);
                toast.success('Location updated successfully');
            } else {
                await locationAPI.create(data);
                toast.success('Location created successfully');
            }
            setIsDialogOpen(false);
            fetchLocations();
        } catch (error) {
            console.error('Failed to save location:', error);
            toast.error('Failed to save location');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;
        
        try {
            await locationAPI.delete(id);
            toast.success('Location deleted successfully');
            fetchLocations();
        } catch (error) {
            console.error('Failed to delete location:', error);
            toast.error('Failed to delete location');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" data-testid="admin-locations-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">
                            Manage <span className="text-cyan-400">Locations</span>
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Add, edit, or remove tourist destinations
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => handleOpenDialog()}
                                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                                data-testid="add-location-btn"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Location
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-slate-100">
                                    {editingId ? 'Edit Location' : 'Add New Location'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Name *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                            data-testid="location-name-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Category *</label>
                                        <Select 
                                            value={formData.category} 
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat} className="text-slate-100">
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Description *</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        rows={3}
                                        className="bg-slate-800 border-slate-700 text-slate-100"
                                        data-testid="location-description-input"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">City *</label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">State *</label>
                                        <Input
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Latitude *</label>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Longitude *</label>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">Image URL *</label>
                                    <Input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        required
                                        className="bg-slate-800 border-slate-700 text-slate-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Best Time to Visit *</label>
                                        <Input
                                            value={formData.best_time_to_visit}
                                            onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Opening Hours *</label>
                                        <Input
                                            value={formData.opening_hours}
                                            onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">Entry Fee *</label>
                                        <Input
                                            value={formData.entry_fee}
                                            onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                                            required
                                            className="bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="border-slate-700 text-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
                                        data-testid="save-location-btn"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {editingId ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="glass-card rounded-xl p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100"
                            data-testid="search-locations-input"
                        />
                    </div>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                        <div
                            key={location.id}
                            className="glass-card rounded-xl overflow-hidden group"
                            data-testid={`location-item-${location.id}`}
                        >
                            <div className="relative h-40">
                                <img
                                    src={location.image_url}
                                    alt={location.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <CrowdBadge level={location.current_crowd_level} size="sm" />
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-100 mb-1">{location.name}</h3>
                                <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
                                    <MapPin className="w-4 h-4" />
                                    <span>{location.city}, {location.state}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Footfall: <span className="text-cyan-400 font-mono">{location.current_footfall}</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleOpenDialog(location)}
                                            className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                                            data-testid={`edit-location-${location.id}`}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(location.id)}
                                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                            data-testid={`delete-location-${location.id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLocations.length === 0 && (
                    <div className="text-center py-20">
                        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">
                            No locations found
                        </h3>
                        <p className="text-slate-500">
                            {searchQuery ? 'Try a different search term' : 'Add your first location to get started'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
