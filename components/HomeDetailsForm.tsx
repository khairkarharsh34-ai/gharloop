import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { updateMyProfile, type ProfilePatch } from '@/lib/api';
import { colors } from '@/lib/theme';
import type { Profile } from '@/lib/types';
import { Button } from './Button';
import { Input } from './Input';
import { SocietyPicker } from './SocietyPicker';
import { useToast } from './Toast';

type Props = {
  profile: Profile;
  /** Show the society list (only before a resident is approved). */
  chooseSociety?: boolean;
  saveLabel?: string;
  onSaved: () => void;
};

/** Edit name, phone, tower and flat — and the society while still unapproved. */
export function HomeDetailsForm({ profile, chooseSociety, saveLabel = 'Save details', onSaved }: Props) {
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: profile.full_name,
    phone: profile.phone ?? '',
    tower: profile.tower ?? '',
    flat: profile.flat ?? '',
  });
  const [societyId, setSocietyId] = useState(profile.society_id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    if (!form.full_name.trim()) return setError('Enter your name.');
    if (chooseSociety && !societyId) return setError('Choose your society.');
    setBusy(true);
    setError(null);
    try {
      const patch: ProfilePatch = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        tower: form.tower.trim() || null,
        flat: form.flat.trim() || null,
      };
      if (chooseSociety) patch.society_id = societyId;
      await updateMyProfile(profile.id, patch);
      toast('Saved');
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <Input label="Full name" value={form.full_name} onChangeText={set('full_name')} />
      <Input label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="+91" />
      {chooseSociety ? <SocietyPicker value={societyId} onChange={setSocietyId} /> : null}
      <View style={s.two}>
        <View style={s.half}>
          <Input label="Tower / Wing" value={form.tower} onChangeText={set('tower')} autoCapitalize="characters" />
        </View>
        <View style={s.half}>
          <Input label="Flat" value={form.flat} onChangeText={set('flat')} />
        </View>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button title={saveLabel} onPress={save} loading={busy} full />
    </View>
  );
}

const s = StyleSheet.create({
  two: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  error: { color: colors.red, fontSize: 13, marginTop: 12 },
});
