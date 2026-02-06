import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Navbar } from "./components/layout/Navbar";

// Pages
import HomePage from "./pages/HomePage";
import PlacesPage from "./pages/PlacesPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import HeatmapPage from "./pages/HeatmapPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLocationsPage from "./pages/AdminLocationsPage";
import AdminFeedbacksPage from "./pages/AdminFeedbacksPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

// Layout with Navbar
const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

// App Routes
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                element={
                    <Layout>
                        <HomePage />
                    </Layout>
                }
            />
            <Route
                path="/places"
                element={
                    <Layout>
                        <PlacesPage />
                    </Layout>
                }
            />
            <Route
                path="/places/:id"
                element={
                    <Layout>
                        <PlaceDetailPage />
                    </Layout>
                }
            />
            <Route
                path="/heatmap"
                element={
                    <Layout>
                        <HeatmapPage />
                    </Layout>
                }
            />

            {/* Auth Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AdminDashboardPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/locations"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AdminLocationsPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/feedbacks"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AdminFeedbacksPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <div className="App min-h-screen bg-background">
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                <Toaster 
                    position="top-right" 
                    richColors
                    toastOptions={{
                        style: {
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#f8fafc',
                        },
                    }}
                />
            </div>
        </AuthProvider>
    );
}

export default App;
