// src/pages/citizen/SubmitComplaint.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createComplaint, uploadImages, CATEGORIES, PRIORITIES } from '../../services/citizenService';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Send, 
  AlertCircle, 
  CheckCircle,
  MapPin,
  FileText,
  Tag,
  Flag,
  Camera,
  Trash2,
  Plus,
  Info,
  HelpCircle
} from 'lucide-react';

const complaintSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Please provide detailed description (minimum 20 characters)')
    .max(1000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select priority level'),
  location: z.string().optional(),
  anonymous: z.boolean().optional(),
});

// Category Card Component
const CategoryCard = ({ category, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(category.id)}
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
      isSelected
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
    }`}
  >
    <div className="text-3xl mb-2">{category.icon}</div>
    <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
      {category.name}
    </p>
  </div>
);

// Priority Option Component
const PriorityOption = ({ priority, isSelected, onSelect }) => {
  const priorityColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', selected: 'border-green-500 bg-green-100' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', selected: 'border-yellow-500 bg-yellow-100' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', selected: 'border-orange-500 bg-orange-100' },
    emergency: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', selected: 'border-red-500 bg-red-100' }
  };
  
  const colors = priorityColors[priority.id] || priorityColors.medium;
  
  return (
    <label
      onClick={() => onSelect(priority.id)}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected ? colors.selected : `${colors.bg} ${colors.border}`
      }`}
    >
      <input
        type="radio"
        value={priority.id}
        checked={isSelected}
        onChange={() => onSelect(priority.id)}
        className="hidden"
      />
      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-current' : 'bg-gray-300'}`} />
      <div>
        <p className={`font-medium ${colors.text}`}>{priority.name}</p>
        <p className="text-xs text-gray-500">{priority.description}</p>
      </div>
    </label>
  );
};

// Image Upload Preview Component
const ImagePreview = ({ preview, index, onRemove }) => (
  <div className="relative group">
    <img
      src={preview}
      alt={`Preview ${index + 1}`}
      className="w-full h-28 object-cover rounded-xl shadow-md"
    />
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
    >
      <Trash2 className="w-3 h-3" />
    </button>
    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
      {index + 1}
    </div>
  </div>
);

// Character Counter Component
const CharacterCounter = ({ length, max }) => {
  const percentage = (length / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;
  
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={`text-xs ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-400'}`}>
        {length}/{max}
      </span>
    </div>
  );
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      location: '',
      anonymous: false,
    }
  });

  const watchCategory = watch('category');
  const watchPriority = watch('priority');
  const watchDescription = watch('description');
  const descriptionLength = watchDescription?.length || 0;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
        setImages(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
          setImages(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is invalid or too large`);
      }
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const complaint = await createComplaint(data);
      
      if (images.length > 0) {
        await uploadImages(complaint.id, images);
      }
      
      toast.success(`Complaint #${complaint.id?.slice(-6)} submitted successfully!`);
      navigate('/citizen/complaints');
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FileText className="w-6 h-6" style={{ color: '#1E3A8A' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Submit New Complaint
          </h1>
        </div>
        <p className="text-gray-500 ml-11">
          Please provide detailed information about your issue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Complaint Details Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Complaint Details</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Fill in the information about your complaint</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Road Damage Near Main Market"
                {...register('title')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CATEGORIES.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isSelected={watchCategory === category.name}
                    onSelect={(id) => setValue('category', category.name)}
                  />
                ))}
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {PRIORITIES.map((priority) => (
                  <PriorityOption
                    key={priority.id}
                    priority={priority}
                    isSelected={watchPriority === priority.id}
                    onSelect={(id) => setValue('priority', id)}
                  />
                ))}
              </div>
              {errors.priority && (
                <p className="mt-2 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Please describe your issue in detail. Include specific information like location, time, and any other relevant details..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <CharacterCounter length={descriptionLength} max={1000} />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-400">
                <HelpCircle className="w-3 h-3 mt-0.5" />
                <span>Be specific about location, time, and nature of the problem for faster resolution</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Address, landmark, or area name"
                  {...register('location')}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('anonymous')}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Submit anonymously (Your identity will be hidden)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Attach Evidence</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload up to 5 images (JPG, PNG, max 5MB each)</p>
          </CardHeader>
          <CardContent className="pt-5">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="p-3 bg-blue-100 rounded-full mb-3">
                  <Upload className="w-8 h-8" style={{ color: '#3B82F6' }} />
                </div>
                <span className="font-medium" style={{ color: '#3B82F6' }}>
                  Click to upload
                </span>
                <span className="text-sm text-gray-500 mt-1">or drag and drop</span>
                <span className="text-xs text-gray-400 mt-2">
                  Supported formats: JPG, PNG (Max 5MB)
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} uploaded
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreviews([]);
                      setImages([]);
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <ImagePreview
                      key={index}
                      preview={preview}
                      index={index}
                      onRemove={removeImage}
                    />
                  ))}
                  {imagePreviews.length < 5 && (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-all bg-gray-50"
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">Add more</span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Tips for faster resolution</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Provide clear and detailed description of the issue</li>
                  <li>• Upload clear images showing the problem</li>
                  <li>• Select appropriate priority level</li>
                  <li>• Include exact location details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/citizen/dashboard')}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            style={{ backgroundColor: '#3B82F6' }}
            className="shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Complaint
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;