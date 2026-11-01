import { Linking, View } from 'react-native';
import { iconForBusiness } from '@/lib/categories';
import { flatOf } from '@/lib/format';
import { businessStatus } from '@/lib/status';
import type { Business } from '@/lib/types';
import { Button } from './Button';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';

type Props = { biz: Business; admin: boolean; onReview: (status: Business['status']) => void };

/** Resident business. Food businesses show their FSSAI declaration. */
export function BusinessCard({ biz, admin, onReview }: Props) {
  const st = businessStatus[biz.status];
  return (
    <ItemCard
      icon={iconForBusiness(biz.category)}
      tint="orange"
      title={biz.name}
      subtitle={biz.description ?? biz.category}
      meta={[biz.owner?.full_name, flatOf(biz.owner), biz.is_food && biz.fssai ? `FSSAI ${biz.fssai}` : null].filter(Boolean).join(' · ')}
      right={
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          {biz.status !== 'approved' ? <Pill label={st.label} tone={st.tone} /> : null}
          {biz.is_food ? <Pill label="FSSAI declared" tone="blue" /> : <Pill label="Resident business" tone="green" />}
        </View>
      }
      footer={
        admin && biz.status === 'pending' ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Button title="Reject" variant="danger" small onPress={() => onReview('rejected')} style={{ flex: 1 }} />
            <Button title="Approve" small onPress={() => onReview('approved')} style={{ flex: 1 }} />
          </View>
        ) : biz.phone && biz.status === 'approved' ? (
          <Button title="Call to order" icon="call-outline" variant="secondary" small onPress={() => Linking.openURL(`tel:${biz.phone!.replace(/\s/g, '')}`)} full style={{ marginTop: 10 }} />
        ) : null
      }
    />
  );
}
