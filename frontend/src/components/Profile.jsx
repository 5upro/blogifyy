import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import { profileAPI, uploadAPI } from '../api';
import AccentPicker from './Premium/AccentPicker';
import UpgradeModal from './Premium/UpgradeModal';
import { formatExpiry } from '../premium/plans';

const initialSocialHandles = {
  twitter: '',
  github: '',
  linkedin: '',
  website: '',
  instagram: ''
};

const getEmptyProfile = (fallbackEmail = '') => ({
  name: '',
  username: '',
  bio: '',
  profilePicture: '',
  email: fallbackEmail,
  accent: 'indigo',
  socialHandles: { ...initialSocialHandles }
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateCurrentUser, entitlements, isPremium, isProSubscriber, refreshSubscription } = useAuth();
  const [profile, setProfile] = useState(getEmptyProfile(user?.email || ''));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [upgradeReason, setUpgradeReason] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        const data = response.data.user || {};
        const merged = {
          ...getEmptyProfile(data.email || user?.email || ''),
          ...data,
          socialHandles: {
            ...initialSocialHandles,
            ...(data.socialHandles || {})
          }
        };
        setProfile(merged);
      } catch {
        setStatus({ error: 'Failed to load profile information.', success: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email]);

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccentChange = (accent) => {
    if (!entitlements.customTheme) {
      setUpgradeReason({
        icon: 'customTheme',
        title: 'Custom themes are a Pro feature',
        description: 'Pick one of eight accent colours and apply it to your profile and every post you publish.'
      });
      return;
    }

    setProfile((prev) => ({ ...prev, accent }));
  };

  const updateSocial = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      socialHandles: {
        ...prev.socialHandles,
        [key]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setStatus({ error: '', success: '' });

    try {
      const response = await uploadAPI.uploadImage(formData);
      const imageUrl = response.data?.imageUrl || '';
      setProfile((prev) => ({ ...prev, profilePicture: imageUrl }));
      setStatus({ error: '', success: 'Profile image uploaded. Save profile to apply changes.' });
    } catch {
      setStatus({ error: 'Image upload failed. Please try again.', success: '' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ error: '', success: '' });

    const payload = {
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      profilePicture: profile.profilePicture,
      socialHandles: profile.socialHandles
    };

    if (entitlements.customTheme) {
      payload.accent = profile.accent;
    }

    try {
      const response = await profileAPI.updateProfile(payload);
      const updatedUser = response.data.user;
      updateCurrentUser(updatedUser);
      setProfile((prev) => ({
        ...prev,
        ...updatedUser,
        socialHandles: {
          ...initialSocialHandles,
          ...(updatedUser.socialHandles || {})
        }
      }));
      refreshSubscription();
      setStatus({ error: '', success: 'Profile updated successfully.' });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Unable to update profile at the moment.';
      setStatus({ error: message, success: '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 accent-scope" data-accent={profile.accent}>
      <nav className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Profile Setup</h1>
              <p className="text-xs text-white/50 mt-1">Complete your public writer profile</p>
            </div>
            <div className="flex items-center gap-3">
              {isProSubscriber ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg">
                  <Crown size={12} /> Pro
                </span>
              ) : (
                <button
                  onClick={() => navigate('/premium')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg transition-all hover:bg-amber-500/20"
                >
                  <Sparkles size={12} /> Upgrade
                </button>
              )}
              <button
                onClick={() => navigate('/blogs')}
                className="bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] px-4 py-2 rounded-xl font-medium transition-all"
              >
                Go to Blogs
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 h-fit">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-white/[0.1] bg-white/[0.04] mb-4">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/40">
                    {(profile.name?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>

              <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/[0.1] text-sm text-white/70 hover:bg-white/[0.06] transition-all">
                {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>

              <p className="text-xs text-white/40 mt-3">
                Best result: square image, JPG or PNG.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            {status.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                {status.success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">Actual Name</label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="example_username"
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
                <p className="text-xs text-white/40 mt-1">3-20 chars. Letters, numbers, underscore, dot.</p>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white/70 mb-2">Bio</label>
              <textarea
                id="bio"
                rows={4}
                maxLength={300}
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell readers who you are and what you write about."
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white resize-none"
              />
              <p className="text-xs text-white/40 mt-1">{profile.bio.length}/300</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white/90 mb-3">Social Handles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={profile.socialHandles.twitter}
                  onChange={(e) => updateSocial('twitter', e.target.value)}
                  placeholder="Twitter URL or handle"
                  className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
                <input
                  type="text"
                  value={profile.socialHandles.github}
                  onChange={(e) => updateSocial('github', e.target.value)}
                  placeholder="GitHub URL or handle"
                  className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
                <input
                  type="text"
                  value={profile.socialHandles.linkedin}
                  onChange={(e) => updateSocial('linkedin', e.target.value)}
                  placeholder="LinkedIn URL"
                  className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
                <input
                  type="text"
                  value={profile.socialHandles.website}
                  onChange={(e) => updateSocial('website', e.target.value)}
                  placeholder="Personal website"
                  className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white"
                />
                <input
                  type="text"
                  value={profile.socialHandles.instagram}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  placeholder="Instagram URL or handle"
                  className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none text-white md:col-span-2"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <AccentPicker
                value={profile.accent}
                onChange={handleAccentChange}
                disabled={!entitlements.customTheme}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white/70">
                  {isPremium ? 'Pro plan active' : 'Free plan'}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {isPremium
                    ? `Renews on ${formatExpiry(user?.premiumExpiresAt) || 'the next billing date'}`
                    : 'Upgrade for featured images, private posts, unlimited posts and a custom theme.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/premium')}
                className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-sm font-medium transition-all"
              >
                {isPremium ? 'Manage plan' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          onClose={() => setUpgradeReason(null)}
          onViewPlans={() => {
            setUpgradeReason(null);
            navigate('/premium');
          }}
        />
      )}
    </div>
  );
};

export default Profile;