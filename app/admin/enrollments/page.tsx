'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, GraduationCap, User, Calendar, DollarSign, CreditCard, FileText, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminLayout from '@/components/admin/AdminLayout';

interface StudentInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CourseInfo {
  title: string;
  level: string;
  hindiName: string;
  fee: string;
  duration: string;
  sessions: string;
  technique: string;
  color: string;
}

interface PaymentInfo {
  amount: number;
  transactionId: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  paymentDate: string;
}

interface InvoiceInfo {
  invoiceNumber: string;
  invoiceDate: string;
  enrollmentDate: string;
}

interface Enrollment {
  enrollmentDate: string | number | Date;
  enrollmentId: string;
  studentInfo: StudentInfo;
  courseInfo: CourseInfo;
  paymentInfo: PaymentInfo;
  invoiceInfo: InvoiceInfo;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStats, setPaymentStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0
  });

  // Fetch enrollments from API
  const fetchEnrollments = useCallback(async (search = '', course = 'all') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (course !== 'all') params.append('course', course);
      
      const url = `/api/enrollments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setEnrollments(result.data);
        setFilteredEnrollments(result.data);
        calculatePaymentStats(result.data);
      } else {
        setError(result.error || 'Failed to fetch enrollments');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching enrollments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const calculatePaymentStats = (enrollments: Enrollment[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let yearTotal = 0;

    enrollments.forEach(enrollment => {
      if (enrollment.paymentInfo.paymentStatus === 'success') {
        const paymentDate = new Date(enrollment.paymentInfo.paymentDate);
        const amount = enrollment.paymentInfo.amount;

        // Today's payments
        if (paymentDate >= today && paymentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
          todayTotal += amount;
        }

        // This week's payments
        if (paymentDate >= thisWeekStart) {
          weekTotal += amount;
        }

        // This month's payments
        if (paymentDate >= thisMonthStart) {
          monthTotal += amount;
        }

        // This year's payments
        if (paymentDate >= thisYearStart) {
          yearTotal += amount;
        }
      }
    });

    setPaymentStats({
      today: todayTotal,
      thisWeek: weekTotal,
      thisMonth: monthTotal,
      thisYear: yearTotal
    });
  };

  // Handle search and filter with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEnrollments(searchTerm, selectedCourse);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCourse, fetchEnrollments]);

  // Get unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(enrollments.map(enrollment => enrollment.courseInfo.title)));

  const exportToExcel = () => {
    const exportData = filteredEnrollments.map(enrollment => ({
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
      'Invoice Number': enrollment.invoiceInfo.invoiceNumber,
      'Enrollment Date': new Date(enrollment.enrollmentDate).toLocaleDateString()
    }));


    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enrollments');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `enrollments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-green-100 opacity-20 animate-ping"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading enrollments...</p>
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
              onClick={() => fetchEnrollments()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700">Total Enrollments</p>
                <p className="text-2xl font-bold text-green-900">{enrollments.length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">Today's Revenue</p>
                <p className="text-xl font-bold text-blue-900">₹{paymentStats.today.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">This Week</p>
                <p className="text-xl font-bold text-purple-900">₹{paymentStats.thisWeek.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">This Month</p>
                <p className="text-xl font-bold text-orange-900">₹{paymentStats.thisMonth.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-700">This Year</p>
                <p className="text-xl font-bold text-indigo-900">₹{paymentStats.thisYear.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Course Enrollments</CardTitle>
              <CardDescription className="text-gray-600">
                Manage and track all course enrollments ({filteredEnrollments.length} total)
              </CardDescription>
            </div>
            <Button 
              onClick={exportToExcel} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export to Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search enrollments by student name, email, course, or enrollment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-green-400 rounded-xl transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-green-400 rounded-xl">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <TableHead className="font-bold text-gray-700">Enrollment ID</TableHead>
                    <TableHead className="font-bold text-gray-700">Student Info</TableHead>
                    <TableHead className="font-bold text-gray-700">Course Details</TableHead>
                    <TableHead className="font-bold text-gray-700">Payment Info</TableHead>
                    <TableHead className="font-bold text-gray-700">Invoice Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.enrollmentId} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-sm bg-blue-50 text-blue-700 border-blue-200">
                          {enrollment.enrollmentId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-semibold text-gray-900">{enrollment.studentInfo.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{enrollment.studentInfo.email}</div>
                            <div>{enrollment.studentInfo.phone}</div>
                            <div className="truncate max-w-xs" title={enrollment.studentInfo.address}>
                              {enrollment.studentInfo.address}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900">{enrollment.courseInfo.title}</div>
  
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {enrollment.courseInfo.level}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Fee: {enrollment.courseInfo.fee}</div>
                            <div>Duration: {enrollment.courseInfo.duration}</div>
                  
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={`${getPaymentStatusColor(enrollment.paymentInfo.paymentStatus)} font-semibold`}>
                            {enrollment.paymentInfo.paymentStatus}
                          </Badge>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                              <span className="font-semibold">₹{enrollment.paymentInfo.amount}</span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="h-3 w-3 mr-1 text-blue-500" />
                              <span className="font-mono text-xs">{enrollment.paymentInfo.transactionId}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-purple-500" />
                              <span className="text-xs">{new Date(enrollment.paymentInfo.paymentDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1 text-orange-500" />
                            <span className="font-mono text-xs">{enrollment.invoiceInfo.invoiceNumber}</span>
                          </div>
                          <div>Invoice: {enrollment.invoiceInfo.invoiceDate}</div>
                          <div>Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No enrollments found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No course enrollments yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}