import { useState } from 'react';
import { Linking, View } from 'react-native';
import { iconForService } from '@/lib/categories';
import { flatOf } from '@/lib/format';
import type { Contact } from '@/lib/types';
import { Button } from './Button';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';

/** "+91 98220 11245" → "+91 98•••••45" */
const mask = (p: string) => {
  const d = p.replace(/[^0-9+]/g, '');
  const cc = d.startsWith('+') ? d.slice(0, d.length - 10) + ' ' : '';
  const local = d.slice(-10);
  return `${cc}${local.slice(0, 2)}•••••${local.slice(-2)}`;
};

/** Neighbour-shared contact. The number stays hidden until you tap "Show". */
export function ContactCard({ contact, canDelete, onDelete }: { contact: Contact; canDelete: boolean; onDelete: () => void }) {
  const [shown, setShown] = useState(false);
  return (
    <ItemCard
      icon={iconForService(contact.service)}
      tint="teal"
      title={`${contact.name} · ${contact.service}`}
      subtitle={[shown ? contact.phone : mask(contact.phone), contact.note].filter(Boolean).join('\n')}
      right={<Pill label={`by ${flatOf(contact.author) || contact.author?.full_name?.split(' ')[0] || 'neighbour'}`} tone="grey" />}
      footer={
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {shown ? (
            <Button title="Call" icon="call-outline" small onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} style={{ flex: 1 }} />
          ) : (
            <Button title="Show number" icon="eye-outline" variant="secondary" small onPress={() => setShown(true)} style={{ flex: 1 }} />
          )}
          {canDelete ? <Button title="Remove" variant="ghost" small onPress={onDelete} /> : null}
        </View>
      }
    />
  );
}
