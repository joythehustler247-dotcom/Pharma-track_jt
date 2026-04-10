import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface DashboardLayoutProps {
  role: 'manufacturer' | 'distributor' | 'pharmacy';
  searchPlaceholder?: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, searchPlaceholder, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Sidebar role={role} />
      <div className="ml-[200px] flex flex-col min-h-screen">
        <TopNav searchPlaceholder={searchPlaceholder} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
