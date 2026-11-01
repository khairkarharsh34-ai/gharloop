import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { time } from '@/lib/format';
import { activityStatus } from '@/lib/status';
import { colors, font } from '@/lib/theme';
import type { Activity } from '@/lib/types';
import { DateBadge } from './DateBadge';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';
import { ProgressBar } from './ProgressBar';

/** Activity row: date badge, title, host/place/time, price and spots left. */
export function ActivityCard({ activity, me }: { activity: Activity; me?: string }) {
  const joined = activity.activity_joins.length;
  const mine = activity.activity_joins.some((j) => j.user_id === me);
  const cap = activity.capacity;
  const st = activityStatus[activity.status];
  return (
    <ItemCard
      left={<DateBadge value={activity.starts_at} tone={activity.price ? 'gold' : 'green'} />}
      title={activity.title}
      subtitle={[activity.author?.full_name, activity.location, time(activity.starts_at)].filter(Boolean).join(' · ')}
      right={
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Pill label={activity.price ? `₹${activity.price}` : 'FREE'} tone={activity.price ? 'gold' : 'green'} />
          {activity.status !== 'live' ? <Pill label={st.label} tone={st.tone} /> : mine ? <Pill label="Joined ✓" tone="blue" /> : null}
        </View>
      }
      footer={
        activity.status === 'live' ? (
          <View style={{ marginTop: 8 }}>
            {cap ? <ProgressBar value={joined / cap} color={joined >= cap ? colors.red : colors.green} /> : null}
            <Text style={{ ...font('500'), fontSize: 12, color: colors.muted, marginTop: 6 }}>
              {cap ? (joined >= cap ? 'Full' : `${joined}/${cap} joined · ${cap - joined} spots left`) : `${joined} joined`}
            </Text>
          </View>
        ) : null
      }
      onPress={() => router.push(`/activities/${activity.id}`)}
    />
  );
}
