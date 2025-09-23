import React, { useContext, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX, FiShield } from 'react-icons/fi';

const Profile = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await updateProfile({ name, email });
      setMessage('✅ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage(err.response?.data?.error || '❌ Update failed. Please try again.');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/20 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600 flex items-center">
                  <FiShield className="mr-1" size={14} />
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FiEdit2 size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                    isEditing 
                      ? 'border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                    isEditing 
                      ? 'border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex-1"
                >
                  <FiCheck size={16} />
                  <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex-1"
                >
                  <FiX size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>

          {/* Account Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <button 
              onClick={logout}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
