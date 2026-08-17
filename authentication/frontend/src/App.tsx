import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CreatorSignupProvider } from './context/CreatorSignupContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

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

            {/* Dashboard Layout Routes */}
            <Route element={<DashboardLayout />}>
              {/* Brand Routes */}
              <Route path="/brand/dashboard" element={<BrandDashboard />} />
              <Route path="/brand/discover" element={<DiscoverCreators />} />
              <Route path="/brand/creator/:id" element={<CreatorDetailPage />} />
              <Route path="/brand/campaigns" element={<BrandCampaigns />} />
              <Route path="/brand/campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="/brand/invitations" element={<BrandInvitations />} />
              <Route path="/brand/negotiations" element={<BrandNegotiations />} />
              <Route path="/brand/collaborations" element={<BrandActiveCollaborations />} />
              <Route path="/brand/saved" element={<SavedCreators />} />
              <Route path="/brand/notifications" element={<BrandNotifications />} />
              <Route path="/brand/profile" element={<CompanyProfile />} />
              <Route path="/brand/settings" element={<BrandSettings />} />

              {/* Creator Routes */}
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/discover" element={<BrowseBrands />} />
              <Route path="/creator/requests" element={<CreatorRequests />} />
              <Route path="/creator/negotiations" element={<CreatorNegotiations />} />
              <Route path="/creator/collaborations" element={<CreatorActiveCollaborations />} />
              <Route path="/creator/portfolio" element={<CreatorPortfolio />} />
              <Route path="/creator/pricing" element={<CreatorPricing />} />
              <Route path="/creator/reviews" element={<CreatorReviews />} />
              <Route path="/creator/notifications" element={<CreatorNotifications />} />
              <Route path="/creator/profile" element={<CreatorProfilePage />} />
              <Route path="/creator/settings" element={<CreatorSettings />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/campaigns" element={<ManageCampaigns />} />
              <Route path="/admin/collaborations" element={<ManageCollaborations />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
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
