import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateOfficerProfile } from '../../services/officerService';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const OfficerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updatedUser = await updateOfficerProfile(profileData);
      updateUser(updatedUser);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Officer Profile</h1>
        <p className="text-gray-600 mt-1">Manage your officer account details.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(event) => setProfileData({ ...profileData, name: event.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(event) => setProfileData({ ...profileData, email: event.target.value })}
              required
            />
            <Button type="submit" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerProfile;
