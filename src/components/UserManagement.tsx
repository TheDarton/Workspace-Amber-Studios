import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/useAuth';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  login: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  nickname: string | null;
  country_id: string;
  role: string;
}

interface UserManagementProps {
  countryId: string;
  countryName: string;
}

type UserRole = 'dealer' | 'sm' | 'operation';

export function UserManagement({ countryId, countryName }: UserManagementProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formRole, setFormRole] = useState<UserRole>('dealer');
  const [formLogin, setFormLogin] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, [countryId]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('country_id', countryId)
        .in('role', ['dealer', 'sm', 'operation'])
        .order('role')
        .order('login');

      if (!error && data) {
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formName.trim() || !formSurname.trim()) {
      setMessage({ type: 'error', text: 'Name and Surname are required' });
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert({
        country_id: countryId,
        role: formRole,
        login: formLogin,
        password_hash: formPassword,
        name: formName.trim(),
        surname: formSurname.trim(),
        email: formEmail || null,
        nickname: formNickname || null,
        must_change_password: false,
      });

    if (error) {
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'A user with this login already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to add user' });
      }
    } else {
      setMessage({ type: 'success', text: 'User added successfully' });
      resetForm();
      loadUsers();
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!editingUser) return;

    if (!formName.trim() || !formSurname.trim()) {
      setMessage({ type: 'error', text: 'Name and Surname are required' });
      return;
    }

    const updateData: Record<string, string | null> = {
      role: formRole,
      login: formLogin,
      name: formName.trim(),
      surname: formSurname.trim(),
      email: formEmail || null,
      nickname: formNickname || null,
    };

    if (formPassword) {
      updateData.password_hash = formPassword;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', editingUser.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update user' });
    } else {
      setMessage({ type: 'success', text: 'User updated successfully' });
      resetForm();
      loadUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (!error) {
      setMessage({ type: 'success', text: 'User deleted successfully' });
      loadUsers();
    } else {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormRole(user.role as UserRole);
    setFormLogin(user.login);
    setFormPassword('');
    setFormName(user.name || '');
    setFormSurname(user.surname || '');
    setFormEmail(user.email || '');
    setFormNickname(user.nickname || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormRole('dealer');
    setFormLogin('');
    setFormPassword('');
    setFormName('');
    setFormSurname('');
    setFormEmail('');
    setFormNickname('');
    setShowForm(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.surname && user.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.nickname && user.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'dealer':
        return 'bg-blue-100 text-blue-800';
      case 'sm':
        return 'bg-green-100 text-green-800';
      case 'operation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'dealer':
        return 'Dealer';
      case 'sm':
        return 'Shift Manager';
      case 'operation':
        return 'Operation';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          User Management - {countryName}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-amber hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                  required
                >
                  <option value="dealer">Dealer</option>
                  <option value="sm">Shift Manager</option>
                  <option value="operation">Operation</option>
                </select>
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Login *
                </label>
                <input
                  type="text"
                  value={formLogin}
                  onChange={(e) => setFormLogin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                  required
                />
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  {editingUser ? 'Password (leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Name * <span className="text-xs text-gray-500">(used for schedule filtering)</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                  required
                  placeholder="e.g., John"
                />
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Surname * <span className="text-xs text-gray-500">(used for schedule filtering)</span>
                </label>
                <input
                  type="text"
                  value={formSurname}
                  onChange={(e) => setFormSurname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                  required
                  placeholder="e.g., Smith"
                />
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>

              <div>
                <label className="block text-14 font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            </div>

            {(formRole === 'dealer' || formRole === 'sm') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> The Name and Surname must match exactly with the CSV data in the schedule files.
                  For example, if the CSV contains "John Smith", the Name should be "John" and Surname should be "Smith".
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-amber hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, login, or nickname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <option value="all">All Roles</option>
            <option value="dealer">Dealers</option>
            <option value="sm">Shift Managers</option>
            <option value="operation">Operations</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            {searchQuery || roleFilter !== 'all' ? 'No users match your search criteria' : 'No users found. Click "Add User" to create one.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Login</th>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Name Surname</th>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Nickname</th>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-14 font-medium">{user.login}</td>
                  <td className="px-4 py-3 text-14">
                    {user.name && user.surname ? `${user.name} ${user.surname}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-14">{user.nickname || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-14">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-600 hover:text-amber hover:bg-amber-50 rounded transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
