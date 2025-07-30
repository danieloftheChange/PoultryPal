import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/dashBoard';
import StockPage from './pages/stock';
import HomePage from './pages/home';
import SignUpPage from './pages/signup';
import LoginPage from './pages/login';
import QueryProvider from '@/components/QueryProvider';
import BatchPage from './pages/birds';
import HousesPage from './pages/houses/houses';
import HouseDetailPage from './pages/houses/houseDetails';
import ImmunizationPage from './pages/immunization';
import DiagnosisPage from './pages/diagnosis/diagnosis';
import DiagnosisDetailPage from './pages/diagnosis/diagnosisDetails';
import StaffPage from './pages/staff';
import SettingsPage from './pages/settings';
import ProductionPage from './pages/production';
// Import feed formula pages
import FeedFormulaPage from './pages/feed-formula/index';
import FeedFormulaCreatePage from './pages/feed-formula/create';
import FeedFormulaViewPage from './pages/feed-formula/view';

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/immunization" element={<ImmunizationPage />} />
          <Route path="/birds" element={<BatchPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/house/:id" element={<HouseDetailPage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/diagnosis/:id" element={<DiagnosisDetailPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/production" element={<ProductionPage />} />
          
          {/* Feed Formula Routes */}
          <Route path="/feed-formula" element={<FeedFormulaPage />} />
          <Route path="/feed-formula/create" element={<FeedFormulaCreatePage />} />
          <Route path="/feed-formula/:id" element={<FeedFormulaViewPage />} />
          <Route path="/feed-formula/edit/:id" element={<FeedFormulaViewPage />} />
          
          <Route path="/signup" element={<SignUpPage logo={{
            src: '',
            alt: ''
          }} />} />
          <Route path="/login" element={<LoginPage logo={{
            src: '',
            alt: ''
          }} />} />
        </Routes>
      </Router>
    </QueryProvider>
  );
}

export default App;