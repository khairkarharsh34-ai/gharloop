import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';

type Props = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Hide the white "Padosi" header (used on login screens). */
  bare?: boolean;
};

/** Standard page: sticky Padosi header + scrolling content with pull-to-refresh. */
export function Screen({ children, refreshing = false, onRefresh, bare }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.page, { paddingTop: insets.top }]}>
      {bare ? null : <AppHeader />}
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} colors={[colors.green]} /> : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function AppHeader() {
  return (
    <View style={s.header}>
      <Text style={s.brand}>Padosi</Text>
      <Text style={s.tag}>Your community, made useful — and happier.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.white, padding: 19, borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { fontSize: 25, fontWeight: '900', color: colors.ink },
  tag: { fontSize: 11, color: colors.muted },
  content: { paddingTop: 16, paddingHorizontal: 15, paddingBottom: 32 },
});
