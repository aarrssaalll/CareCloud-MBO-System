'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Users, UserCheck, Target, CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: string;
  title: string;
  departmentName?: string;
  teamName?: string;
}

interface Approval {
  id: string;
  type: string;
  entityId: string;
  status: string;
  comments?: string;
  createdAt: string;
}

export default function MboTestPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('crystal.williams@carecloud.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('/api/mbo/seed', {
        method: 'POST',
      });
      const result = await response.json();
      setSeedResult(result);
    } catch (error) {
      console.error('Seeding failed:', error);
      setSeedResult({ success: false, error: error.message });
    }
    setIsSeeding(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mbo/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.user);
        await loadApprovals(result.user.id);
      } else {
        alert('Login failed: ' + result.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    }
    setIsLoading(false);
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/mbo/data?type=users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadApprovals = async (userId: string) => {
    try {
      const response = await fetch(`/api/mbo/approvals?approverId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setApprovals(result.data);
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
    }
  };

  const handleApproval = async (approvalId: string, status: 'APPROVED' | 'REJECTED', comments?: string) => {
    try {
      const response = await fetch('/api/mbo/approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalId,
          status,
          comments,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Approval ${status.toLowerCase()} successfully!`);
        if (currentUser) {
          await loadApprovals(currentUser.id);
        }
      } else {
        alert('Approval failed: ' + result.message);
      }
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed: ' + error.message);
    }
  };

  const predefinedUsers = [
    { email: 'crystal.williams@carecloud.com', name: 'Crystal Williams', role: 'President - Operations' },
    { email: 'hadi.chaudhary@carecloud.com', name: 'Hadi Chaudhary', role: 'President - Technology & AI' },
    { email: 'sarah.johnson@carecloud.com', name: 'Sarah Johnson', role: 'IT Department Manager' },
    { email: 'michael.rodriguez@carecloud.com', name: 'Michael Rodriguez', role: 'Operations Department Manager' },
    { email: 'alex.chen@carecloud.com', name: 'Alex Chen', role: 'AI & ML Team Lead' },
    { email: 'priya.patel@carecloud.com', name: 'Priya Patel', role: 'Database & Analytics Team Lead' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#004E9E] mb-2">CareCloud MBO System Test</h1>
          <p className="text-gray-600">Database Integration & Live Testing Environment</p>
        </div>

        {/* Database Initialization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Initialization
            </CardTitle>
            <CardDescription>
              Initialize the MBO database with comprehensive organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSeedDatabase} 
              disabled={isSeeding}
              className="bg-[#004E9E] hover:bg-[#003875]"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                'Initialize Database'
              )}
            </Button>
            
            {seedResult && (
              <div className={`mt-4 p-4 rounded-lg ${seedResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className={`font-semibold ${seedResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {seedResult.success ? '✅ Database Initialized Successfully!' : '❌ Database Initialization Failed'}
                </h4>
                {seedResult.success && seedResult.data && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>• {seedResult.data.departments} departments created</p>
                    <p>• {seedResult.data.teams} teams created</p>
                    <p>• {seedResult.data.users} users created</p>
                  </div>
                )}
                {seedResult.error && (
                  <p className="mt-2 text-sm text-red-700">Error: {seedResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Authentication Test
            </CardTitle>
            <CardDescription>
              Test login functionality with real database users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Select value={loginEmail} onValueChange={setLoginEmail}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedUsers.map((user) => (
                        <SelectItem key={user.email} value={user.email}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (any password works for demo)"
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="bg-[#007BFF] hover:bg-[#0056b3]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>

              {currentUser && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Login Successful!</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {currentUser.name}</p>
                    <p><strong>Employee ID:</strong> {currentUser.employeeId}</p>
                    <p><strong>Role:</strong> <Badge variant="outline">{currentUser.role}</Badge></p>
                    <p><strong>Title:</strong> {currentUser.title}</p>
                    {currentUser.departmentName && (
                      <p><strong>Department:</strong> {currentUser.departmentName}</p>
                    )}
                    {currentUser.teamName && (
                      <p><strong>Team:</strong> {currentUser.teamName}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval System Test */}
        {currentUser && (currentUser.role === 'MANAGER' || currentUser.role === 'SENIOR_MANAGEMENT') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Approval System Test
              </CardTitle>
              <CardDescription>
                Test the approval functionality for {currentUser.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Pending Approvals</h4>
                  <Button 
                    onClick={() => loadApprovals(currentUser.id)}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>

                {approvals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvals.map((approval) => (
                      <div key={approval.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-yellow-100">
                                {approval.type}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-100">
                                <Clock className="h-3 w-3 mr-1" />
                                {approval.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Entity ID: {approval.entityId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(approval.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(approval.id, 'APPROVED', 'Approved via test interface')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(approval.id, 'REJECTED', 'Rejected via test interface')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        {approval.comments && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Comments:</strong> {approval.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users Overview
            </CardTitle>
            <CardDescription>
              View all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">All System Users</h4>
              <Button onClick={loadUsers} variant="outline" size="sm">
                Load Users
              </Button>
            </div>

            {users.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-3 bg-white">
                    <div className="space-y-1">
                      <h5 className="font-medium">{user.name}</h5>
                      <p className="text-sm text-gray-600">{user.title}</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                        {user.departmentName && (
                          <Badge variant="outline" className="text-xs bg-blue-50">{user.departmentName}</Badge>
                        )}
                        {user.teamName && (
                          <Badge variant="outline" className="text-xs bg-green-50">{user.teamName}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${seedResult?.success ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Database Initialized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>User Authenticated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${users.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Data Access Working</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
