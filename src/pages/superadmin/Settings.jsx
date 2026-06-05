// src/pages/superadmin/Settings.jsx
import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory, getPriorities, updatePriority } from '../../services/superAdminService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  Flag, 
  X, 
  Save,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Shield,
  Settings as SettingsIcon,
  Database,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Category Item Component
const CategoryItem = ({ category, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get random color for category icon
  const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];
  const colorIndex = category.id % colors.length;
  
  return (
    <div 
      className="group flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${colors[colorIndex]} flex items-center justify-center`}>
          <Tag className="w-4 h-4" />
        </div>
        <span className="font-medium text-gray-900">{category.name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          ID: {category.id}
        </span>
      </div>
      <div className={`flex gap-1 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button 
          onClick={() => onEdit(category)} 
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Edit Category"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => onDelete(category.id)} 
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Delete Category"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Priority Item Component
const PriorityItem = ({ priority, onUpdate }) => {
  const getPriorityColor = (level) => {
    switch(level) {
      case 4: return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Emergency' };
      case 3: return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'High' };
      case 2: return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium' };
      default: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Low' };
    }
  };
  
  const color = getPriorityColor(priority.level);
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl transition-all duration-200 hover:shadow-md bg-white" style={{ borderColor: color.border.split(' ')[1] }}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center`}>
          <Flag className={`w-5 h-5 ${color.text}`} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{priority.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
              {color.label}
            </span>
            <span className="text-xs text-gray-400">Level {priority.level}/4</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => priority.level > 1 && onUpdate(priority.id, priority.level - 1)}
          disabled={priority.level <= 1}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg"
        >
          −
        </button>
        <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">{priority.level}</span>
        </div>
        <button
          onClick={() => priority.level < 4 && onUpdate(priority.id, priority.level + 1)}
          disabled={priority.level >= 4}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, onSubmit, category, isLoading }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onSubmit({ name: name.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {category ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Examples: Roads, Water Supply, Electricity, Sanitation, etc.
            </p>
          </div>
          
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {category ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SystemSettings = () => {
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        let cats, prios;
        try {
          cats = await getCategories();
          prios = await getPriorities();
        } catch (error) {
          console.log('Using demo data');
          cats = [
            { id: 1, name: 'Roads & Infrastructure' },
            { id: 2, name: 'Water Supply' },
            { id: 3, name: 'Electricity' },
            { id: 4, name: 'Sanitation' },
            { id: 5, name: 'Public Safety' },
            { id: 6, name: 'Healthcare' },
            { id: 7, name: 'Education' },
            { id: 8, name: 'Transport' }
          ];
          prios = [
            { id: 1, name: 'Low', level: 1 },
            { id: 2, name: 'Medium', level: 2 },
            { id: 3, name: 'High', level: 3 },
            { id: 4, name: 'Emergency', level: 4 }
          ];
        }
        if (isMounted) {
          setCategories(cats);
          setPriorities(prios);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleAddCategory = async (data) => {
    setIsSubmitting(true);
    try {
      const newCat = await addCategory({ name: data.name, icon: 'tag' });
      setCategories([...categories, newCat]);
      toast.success(`Category "${data.name}" added successfully!`);
      setShowCatModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (data) => {
    setIsSubmitting(true);
    try {
      const updated = await updateCategory(editingCat.id, { name: data.name });
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      toast.success(`Category updated to "${data.name}"`);
      setEditingCat(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    const category = categories.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${category?.name}"? This may affect existing complaints.`)) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        toast.success(`Category "${category?.name}" deleted`);
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  const handleUpdatePriority = async (id, level) => {
    try {
      const updated = await updatePriority(id, { level });
      setPriorities(priorities.map(p => p.id === updated.id ? updated : p));
      const priority = priorities.find(p => p.id === id);
      toast.success(`${priority?.name} priority level changed to ${level}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update priority');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <SettingsIcon className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-500">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-xl">
            <SettingsIcon className="w-6 h-6" style={{ color: '#1E3A8A' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            System Settings
          </h1>
        </div>
        <p className="text-gray-500 ml-11 text-sm">
          Configure system-wide settings including categories and priorities
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Categories" 
          value={categories.length} 
          icon={Tag}
          color="from-purple-500 to-purple-600"
        />
        <StatsCard 
          title="Priority Levels" 
          value={priorities.length} 
          icon={Flag}
          color="from-red-500 to-red-600"
        />
        <StatsCard 
          title="Active Settings" 
          value="12" 
          icon={Database}
          color="from-green-500 to-green-600"
        />
        <StatsCard 
          title="System Version" 
          value="v2.0" 
          icon={TrendingUp}
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Categories Section */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Categories</h2>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowCatModal(true)}
                style={{ backgroundColor: '#3B82F6' }}
                className="shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage complaint classification categories</p>
          </CardHeader>
          <CardContent className="pt-5">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">No categories yet</h3>
                <p className="text-sm text-gray-500 mt-1">Click "Add Category" to create your first category</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {categories.map((category) => (
                  <CategoryItem 
                    key={category.id} 
                    category={category} 
                    onEdit={(cat) => {
                      setEditingCat(cat);
                    }}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Total: {categories.length} categories</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Priority Levels Section */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Priority Levels</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Configure complaint priority hierarchy</p>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {priorities.map((priority) => (
                <PriorityItem 
                  key={priority.id} 
                  priority={priority} 
                  onUpdate={handleUpdatePriority}
                />
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-800">About Priority Levels</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Higher priority complaints are addressed first. Emergency (Level 4) complaints trigger immediate notifications to department heads.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Configuration */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>System Configuration</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto-assignment</p>
                <p className="text-xs text-gray-500">Automatically assign complaints to available officers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Send email alerts for new complaints</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Data Management</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">Export System Data</span>
              <span className="text-xs text-blue-600">Export</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">Backup Database</span>
              <span className="text-xs text-blue-600">Backup</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <span className="text-sm font-medium text-red-700">Clear System Cache</span>
              <span className="text-xs text-red-600">Clear</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSubmit={handleAddCategory}
        isLoading={isSubmitting}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={!!editingCat}
        onClose={() => setEditingCat(null)}
        onSubmit={handleUpdateCategory}
        category={editingCat}
        isLoading={isSubmitting}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SystemSettings;