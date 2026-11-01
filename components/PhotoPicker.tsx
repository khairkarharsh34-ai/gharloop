import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PickedPhoto } from '@/lib/api';
import { colors, font, radius } from '@/lib/theme';
import { Icon } from './Icon';
import { useToast } from './Toast';

type Props = { value: PickedPhoto | null; onChange: (p: PickedPhoto | null) => void; label?: string };

/** Tap to add a photo from the gallery (or camera on phones). Shows a preview. */
export function PhotoPicker({ value, onChange, label = 'Add a photo' }: Props) {
  const toast = useToast();

  async function pick() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: false });
      if (res.canceled || !res.assets[0]) return;
      const a = res.assets[0];
      onChange({ uri: a.uri, base64: a.base64, mimeType: a.mimeType });
    } catch (e) {
      toast((e as Error).message);
    }
  }

  if (value) {
    return (
      <View style={s.previewWrap}>
        <Image source={{ uri: value.uri }} style={s.preview} />
        <Pressable onPress={() => onChange(null)} style={s.remove} hitSlop={8}>
          <Icon name="close" size={16} color={colors.white} />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable onPress={pick} style={({ pressed }) => [s.box, pressed && { opacity: 0.7 }]}>
      <Icon name="camera-outline" size={24} color={colors.green} />
      <Text style={s.text}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  box: {
    marginTop: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.faint,
    borderRadius: radius.field,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.field,
  },
  text: { ...font('600'), fontSize: 14, color: colors.green },
  previewWrap: { marginTop: 14 },
  preview: { width: '100%', height: 200, borderRadius: radius.field, backgroundColor: colors.line },
  remove: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
