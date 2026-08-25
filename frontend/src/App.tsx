import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CreatorSignupProvider } from './context/CreatorSignupContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Brand Pages
import { BrandDashboard } from './pages/brand/BrandDashboard';
import { DiscoverCreators } from './pages/brand/DiscoverCreators';
import { CreatorDetailPage } from './pages/brand/CreatorDetailPage';
import { BrandCampaigns } from './pages/brand/BrandCampaigns';
import { CampaignDetailPage } from './pages/brand/CampaignDetailPage';
import { BrandInvitations } from './pages/brand/BrandInvitations';
import { BrandNegotiations } from './pages/brand/BrandNegotiations';
import { BrandActiveCollaborations } from './pages/brand/BrandActiveCollaborations';
import { SavedCreators } from './pages/brand/SavedCreators';
import { BrandNotifications } from './pages/brand/BrandNotifications';
import { CompanyProfile } from './pages/brand/CompanyProfile';
import { BrandSettings } from './pages/brand/BrandSettings';
import { BrandReviews } from './pages/brand/BrandReviews';

// Creator Pages
import { CreatorDashboard } from './pages/creator/CreatorDashboard';
import { BrowseBrands } from './pages/creator/BrowseBrands';
import { CreatorRequests } from './pages/creator/CreatorRequests';
import { CreatorNegotiations } from './pages/creator/CreatorNegotiations';
import { CreatorActiveCollaborations } from './pages/creator/CreatorActiveCollaborations';
import { CreatorPortfolio } from './pages/creator/CreatorPortfolio';
import { CreatorPricing } from './pages/creator/CreatorPricing';
import { CreatorReviews } from './pages/creator/CreatorReviews';
import { CreatorNotifications } from './pages/creator/CreatorNotifications';
import { CreatorProfilePage } from './pages/creator/CreatorProfilePage';
import { CreatorSettings } from './pages/creator/CreatorSettings';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageCampaigns } from './pages/admin/ManageCampaigns';
import { ManageCollaborations } from './pages/admin/ManageCollaborations';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';

const ScrollToHashElement: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHashElement />
      <AuthProvider>
        <AppProvider>
          <CreatorSignupProvider>
            <Routes>
              {/* Public Layout Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Protected Dashboard Layout Routes */}
              <Route element={<DashboardLayout />}>
                {/* Brand Routes */}
                <Route path="/brand/dashboard" element={<ProtectedRoute allowedRoles={['brand']}><BrandDashboard /></ProtectedRoute>} />
                <Route path="/brand/discover" element={<ProtectedRoute allowedRoles={['brand']}><DiscoverCreators /></ProtectedRoute>} />
                <Route path="/brand/creator/:id" element={<ProtectedRoute allowedRoles={['brand']}><CreatorDetailPage /></ProtectedRoute>} />
                <Route path="/brand/campaigns" element={<ProtectedRoute allowedRoles={['brand']}><BrandCampaigns /></ProtectedRoute>} />
                <Route path="/brand/campaigns/:id" element={<ProtectedRoute allowedRoles={['brand']}><CampaignDetailPage /></ProtectedRoute>} />
                <Route path="/brand/invitations" element={<ProtectedRoute allowedRoles={['brand']}><BrandInvitations /></ProtectedRoute>} />
                <Route path="/brand/negotiations" element={<ProtectedRoute allowedRoles={['brand']}><BrandNegotiations /></ProtectedRoute>} />
                <Route path="/brand/collaborations" element={<ProtectedRoute allowedRoles={['brand']}><BrandActiveCollaborations /></ProtectedRoute>} />
                <Route path="/brand/saved" element={<ProtectedRoute allowedRoles={['brand']}><SavedCreators /></ProtectedRoute>} />
                <Route path="/brand/saved-creators" element={<ProtectedRoute allowedRoles={['brand']}><SavedCreators /></ProtectedRoute>} />
                <Route path="/brand/reviews" element={<ProtectedRoute allowedRoles={['brand']}><BrandReviews /></ProtectedRoute>} />
                <Route path="/brand/notifications" element={<ProtectedRoute allowedRoles={['brand']}><BrandNotifications /></ProtectedRoute>} />
                <Route path="/brand/profile" element={<ProtectedRoute allowedRoles={['brand']}><CompanyProfile /></ProtectedRoute>} />
                <Route path="/brand/settings" element={<ProtectedRoute allowedRoles={['brand']}><BrandSettings /></ProtectedRoute>} />

                {/* Creator Routes */}
                <Route path="/creator/dashboard" element={<ProtectedRoute allowedRoles={['creator']}><CreatorDashboard /></ProtectedRoute>} />
                <Route path="/creator/discover" element={<ProtectedRoute allowedRoles={['creator']}><BrowseBrands /></ProtectedRoute>} />
                <Route path="/creator/campaigns" element={<ProtectedRoute allowedRoles={['creator']}><BrowseBrands /></ProtectedRoute>} />
                <Route path="/creator/requests" element={<ProtectedRoute allowedRoles={['creator']}><CreatorRequests /></ProtectedRoute>} />
                <Route path="/creator/negotiations" element={<ProtectedRoute allowedRoles={['creator']}><CreatorNegotiations /></ProtectedRoute>} />
                <Route path="/creator/collaborations" element={<ProtectedRoute allowedRoles={['creator']}><CreatorActiveCollaborations /></ProtectedRoute>} />
                <Route path="/creator/portfolio" element={<ProtectedRoute allowedRoles={['creator']}><CreatorPortfolio /></ProtectedRoute>} />
                <Route path="/creator/pricing" element={<ProtectedRoute allowedRoles={['creator']}><CreatorPricing /></ProtectedRoute>} />
                <Route path="/creator/reviews" element={<ProtectedRoute allowedRoles={['creator']}><CreatorReviews /></ProtectedRoute>} />
                <Route path="/creator/notifications" element={<ProtectedRoute allowedRoles={['creator']}><CreatorNotifications /></ProtectedRoute>} />
                <Route path="/creator/profile" element={<ProtectedRoute allowedRoles={['creator']}><CreatorProfilePage /></ProtectedRoute>} />
                <Route path="/creator/settings" element={<ProtectedRoute allowedRoles={['creator']}><CreatorSettings /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/brands" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/creators" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/campaigns" element={<ProtectedRoute allowedRoles={['admin']}><ManageCampaigns /></ProtectedRoute>} />
                <Route path="/admin/collaborations" element={<ProtectedRoute allowedRoles={['admin']}><ManageCollaborations /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CreatorSignupProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
