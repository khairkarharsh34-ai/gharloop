import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '@/lib/theme';
import { Icon } from './Icon';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Show a "‹ Back" link above the title. */
  back?: boolean;
  /** Element on the right of the title, e.g. an avatar. */
  right?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** No side padding or top inset (for screens with a full-bleed hero). */
  bleed?: boolean;
};

/** Standard page: big title, scrolling content, pull-to-refresh. */
export function Screen({ children, title, subtitle, back, right, refreshing = false, onRefresh, bleed }: Props) {
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={s.page}>
      <ScrollView
        contentContainerStyle={[bleed ? s.bleed : s.content, !bleed && { paddingTop: insets.top + 18 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} colors={[colors.green]} />
          ) : undefined
        }
      >
        {back ? (
          <Pressable onPress={goBack} hitSlop={10} style={s.back}>
            <Icon name="chevron-back" size={20} color={colors.green} />
            <Text style={s.backText}>Back</Text>
          </Pressable>
        ) : null}
        {title ? (
          <View style={s.head}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{title}</Text>
              {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  bleed: { paddingBottom: 40 },
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 14, marginLeft: -4, paddingVertical: 4 },
  backText: { ...font('700'), color: colors.green, fontSize: 15 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  title: { ...font('800'), fontSize: 30, color: colors.ink, letterSpacing: -0.8 },
  subtitle: { ...font('400'), fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
});
