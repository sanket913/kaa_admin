'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, GraduationCap, Download, Eye, DollarSign, TrendingUp, Activity, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminLayout from '@/components/admin/AdminLayout';

interface DashboardData {
  totalContacts: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentContacts: number;
  recentEnrollments: number;
  recentRevenue: number;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const downloadContactsCSV = async () => {
    try {
      setIsDownloading('contacts');
      const response = await fetch('/api/contacts');
      const result = await response.json();
      
      if (result.success) {
        const csvData = result.data.map((contact: any) => ({
          'Contact ID': contact.contactId,
          'Name': contact.name,
          'Email': contact.email,
          'Phone': contact.phone,
          'Course': contact.course,
          'Message': contact.message,
          'Submitted At': new Date(contact.submittedAt).toLocaleString()
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `contacts_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Error downloading contacts:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadEnrollmentsCSV = async () => {
    try {
      setIsDownloading('enrollments');
      const response = await fetch('/api/enrollments');
      const result = await response.json();
      
      if (result.success) {
        const csvData = result.data.map((enrollment: any) => ({
          'Enrollment ID': enrollment.enrollmentId,
          'Student Name': enrollment.studentInfo.name,
          'Student Email': enrollment.studentInfo.email,
          'Student Phone': enrollment.studentInfo.phone,
          'Student Address': enrollment.studentInfo.address,
          'Course Title': enrollment.courseInfo.title,
          'Course Level': enrollment.courseInfo.level,
          'Course Fee': enrollment.courseInfo.fee,
          'Course Duration': enrollment.courseInfo.duration,
          'Payment Amount': enrollment.paymentInfo.amount,
          'Payment Status': enrollment.paymentInfo.paymentStatus,
          'Payment Date': new Date(enrollment.paymentInfo.paymentDate).toLocaleDateString(),
          'Enrollment Date': new Date(enrollment.invoiceInfo.enrollmentDate).toLocaleDateString()
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollments');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `enrollments_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Error downloading enrollments:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-ping"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg hidden lg:block">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 lg:text-3xl">Welcome back, Admin</h2>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">Here's what's happening with your data today.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Total Contacts</p>
                <p className="text-3xl md:text-4xl font-bold text-blue-900">{dashboardData?.totalContacts || 0}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+{dashboardData?.recentContacts || 0} this week</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Total Enrollments</p>
                <p className="text-3xl md:text-4xl font-bold text-green-900">{dashboardData?.totalEnrollments || 0}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+{dashboardData?.recentEnrollments || 0} this week</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <div className="mb-8">
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-1">Total Revenue</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-900">₹{dashboardData?.totalRevenue?.toLocaleString() || 0}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <p className="text-sm text-green-600 font-medium">+₹{dashboardData?.recentRevenue?.toLocaleString() || 0} this week</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">Contact Management</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              View and manage all contact form submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Recent contacts</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                {dashboardData?.totalContacts || 0} total
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => router.push('/admin/contacts')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Contacts
              </Button>
              <Button 
                variant="outline"
                onClick={downloadContactsCSV}
                disabled={isDownloading === 'contacts'}
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <Download className={`h-4 w-4 ${isDownloading === 'contacts' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">Enrollment Management</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              View and manage all course enrollments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Recent enrollments</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 font-semibold">
                {dashboardData?.totalEnrollments || 0} total
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => router.push('/admin/enrollments')}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Enrollments
              </Button>
              <Button 
                variant="outline"
                onClick={downloadEnrollmentsCSV}
                disabled={isDownloading === 'enrollments'}
                className="hover:bg-green-50 hover:border-green-300"
              >
                <Download className={`h-4 w-4 ${isDownloading === 'enrollments' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}