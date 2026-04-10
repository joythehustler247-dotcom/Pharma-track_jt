import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

// Manufacturer
import ManufacturerDashboard from "./pages/manufacturer/Dashboard";
import Register from "./pages/manufacturer/Register";

// Distributor
import DistributorDashboard from "./pages/distributor/Dashboard";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Manufacturer Routes */}
      <Route path="/manufacturer" element={<ManufacturerDashboard />} />
      <Route path="/manufacturer/register" element={<Register />} />

      {/* Distributor Routes */}
      <Route path="/distributor" element={<DistributorDashboard />} />

      {/* Pharmacy Routes */}
      <Route path="/pharmacy" element={<PharmacyDashboard />} />
    </Routes>
  );
}