import React, { useState, useEffect } from 'react';
import { adminAPI, blogAPI } from '../api';
import { useAuth } from '../Auth/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Trash2,
  LogOut,
  TrendingUp,
  Shield,
  Search,
  Menu,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
    setLoading(false);
  };

  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getAllBlogsAdmin();
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs');
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        fetchStats();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete user.', 'error');
      }
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'success',
        title: 'User role updated'
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to update user role', 'error');
    }
  };

  const deleteBlog = async (blogId) => {
    const result = await Swal.fire({
      title: 'Delete this blog?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await blogAPI.deleteBlog(blogId);
        setBlogs(blogs.filter(b => b._id !== blogId));
        fetchStats();
        Swal.fire('Deleted!', 'Blog has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete blog.', 'error');
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-100 text-gray-800">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label, onClick }) => (
    <button
      onClick={onClick || (() => {
        setActiveTab(id);
        if (id === 'users') fetchUsers();
        if (id === 'blogs') fetchAllBlogs();
        if (id === 'stats') fetchStats();
      })}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors duration-200 ${activeTab === id
        ? 'bg-blue-600 text-white border-r-4 border-blue-800'
        : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <h1 className="text-xl font-bold tracking-wider">ADMIN PANNEL</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100%-4rem)] justify-between">  
          <div>
            <NavItem id="stats" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="users" icon={Users} label="Users" />
            <NavItem id="blogs" icon={FileText} label="All Blogs" />
          </div>

          <div className="p-4">
            <div className="flex items-center p-4 bg-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Add header search or notifications here if needed */}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 transition-all">
          <div className="max-w-7xl mx-auto">

            {activeTab === 'stats' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
                  <StatsCard title="Total Blogs" value={stats.totalBlogs} icon={FileText} color="bg-green-500" />
                  <StatsCard title="Published" value={stats.publishedBlogs} icon={TrendingUp} color="bg-purple-500" />
                  <StatsCard title="Admins" value={stats.totalAdmins} icon={Shield} color="bg-red-500" />
                </div>

                {/* Could add charts here later */}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">User</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Joined</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{u.name}</div>
                                  <div className="text-sm text-gray-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={u.role}
                                onChange={(e) => changeUserRole(u._id, e.target.value)}
                                disabled={u._id === user.id}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border-none focus:ring-2 focus:ring-offset-1 cursor-pointer
                                  ${u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                  }`}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {u._id !== user.id && (
                                <button
                                  onClick={() => deleteUser(u._id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'blogs' && (
              <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">All Blogs</h2>
                  <div className="flex space-x-2">
                    {/* Filter buttons could go here */}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-10 text-gray-500">Loading blogs...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map(blog => (
                      <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="h-40 bg-gray-200 flex items-center justify-center relative group">
                          {/* Placeholder or actual image if available */}
                          <FileText className="w-12 h-12 text-gray-400" />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{blog.title}</h3>
                          <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                            <span>By {blog.author.name}</span>
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                            {blog.content}
                          </p>
                          <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={() => deleteBlog(blog._id)}
                              className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-105">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 text-opacity-100`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value || 0}</h3>
    </div>
  </div>
);

export default AdminDashboard;