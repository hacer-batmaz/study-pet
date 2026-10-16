import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-retro-dark text-gray-100">
      {/* Sol Menü */}
      <Sidebar />

      {/* Sağ Ana İçerik */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
        {/* Dashboard Alt Bilgisi */}
        <Footer />
      </div>
    </div>
  );
}