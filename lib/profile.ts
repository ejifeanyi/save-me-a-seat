import { supabase } from './supabase';

export type ProfileData = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
};

export async function getProfileData(): Promise<ProfileData> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', userData.user.id)
    .single();
  if (error) throw error;

  return {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    email: userData.user.email ?? '',
  };
}

export async function updateProfileName(fullName: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Not signed in');

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', userData.user.id);
  if (error) throw error;
}

export async function uploadAvatar(localUri: string): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Not signed in');
  const userId = userData.user.id;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${userId}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);
  if (updateError) throw updateError;

  return avatarUrl;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user?.email) throw new Error('Not signed in');

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });
  if (reauthError) throw new Error('Current password is incorrect');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}