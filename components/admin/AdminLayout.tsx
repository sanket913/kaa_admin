'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Menu, 
  X, 
  Home, 
  Mail, 
  GraduationCap, 
  LogOut, 
  Activity 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/admin/dashboard':
        return 'Dashboard Overview';
      case '/admin/contacts':
        return 'Contact Management';
      case '/admin/enrollments':
        return 'Enrollment Management';
      default:
        return 'Admin Panel';
    }
  };

  const getPageDescription = () => {
    switch (pathname) {
      case '/admin/dashboard':
        return 'Welcome back, here\'s your summary';
      case '/admin/contacts':
        return 'Manage contact inquiries';
      case '/admin/enrollments':
        return 'Manage course enrollments';
      default:
        return 'Management Portal';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h3>
              
              {/* Dashboard */}
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActivePage('/admin/dashboard') 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => {
                  router.push('/admin/dashboard');
                  setSidebarOpen(false);
                }}
              >
                <Home className="h-4 w-4 mr-3" />
                Dashboard
              </Button>

              {/* Contacts */}
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActivePage('/admin/contacts') 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => {
                  router.push('/admin/contacts');
                  setSidebarOpen(false);
                }}
              >
                <Mail className="h-4 w-4 mr-3" />
                Contacts
              </Button>

              {/* Enrollments */}
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActivePage('/admin/enrollments') 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => {
                  router.push('/admin/enrollments');
                  setSidebarOpen(false);
                }}
              >
                <GraduationCap className="h-4 w-4 mr-3" />
                Enrollments
              </Button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg lg:hidden">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
                    <p className="text-sm text-gray-600 hidden sm:block">{getPageDescription()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="hidden sm:flex bg-green-50 text-green-700 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}