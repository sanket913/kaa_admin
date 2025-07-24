'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Users, Mail, Phone, BookOpen, MessageSquare, Calendar, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminLayout from '@/components/admin/AdminLayout';

interface Contact {
  contactId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  submittedAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts from API
  const fetchContacts = useCallback(async (search = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = search 
        ? `/api/contacts?search=${encodeURIComponent(search)}`
        : '/api/contacts';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setContacts(result.data);
        setFilteredContacts(result.data);
      } else {
        setError(result.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchContacts(searchTerm);
      } else {
        fetchContacts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchContacts]);

  const exportToExcel = () => {
    const csvData = filteredContacts.map((contact: any) => ({
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <p className="mt-6 text-gray-600 font-medium">Loading contacts...</p>
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
              onClick={() => fetchContacts()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
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
      {/* Stats Card */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700">Total Contacts</p>
                  <p className="text-3xl font-bold text-blue-900">{contacts.length}</p>
                </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="mb-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredContacts.length} results
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No contacts found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.contactId} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800 truncate">
                    {contact.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200">
                    {contact.contactId.slice(-6)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{contact.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{contact.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {contact.course}
                  </Badge>
                </div>
                
                {contact.message && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 line-clamp-2" title={contact.message}>
                      {contact.message}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">
                    {formatDate(contact.submittedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredContacts.length > 0 && (
        <div className="mt-8 text-center">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg inline-block">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{filteredContacts.length}</span> of{' '}
                <span className="font-semibold text-blue-600">{contacts.length}</span> contacts
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}