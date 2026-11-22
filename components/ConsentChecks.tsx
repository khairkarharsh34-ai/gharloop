import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { MIN_AGE } from '@/lib/legal';
import { colors, font } from '@/lib/theme';
import { CheckRow } from './CheckRow';

export type Consent = { adult: boolean; privacy: boolean };
export const consentGiven = (c: Consent) => c.adult && c.privacy;

/** The two consents the DPDP Act needs before we store someone's data: age and the privacy notice. */
export function ConsentChecks({ value, onChange }: { value: Consent; onChange: (c: Consent) => void }) {
  return (
    <>
      <CheckRow checked={value.adult} onChange={(adult) => onChange({ ...value, adult })}>
        I am {MIN_AGE} years or older.
      </CheckRow>
      <CheckRow checked={value.privacy} onChange={(privacy) => onChange({ ...value, privacy })}>
        I have read the{' '}
        <Text style={s.link} onPress={() => router.push('/module/privacy')}>Privacy Notice</Text> and agree to Ghar Loop using my
        data as it describes. I agree to the{' '}
        <Text style={s.link} onPress={() => router.push('/module/guidelines')}>Community guidelines</Text>.
      </CheckRow>
    </>
  );
}

const s = StyleSheet.create({
  link: { ...font('700'), color: colors.green, textDecorationLine: 'underline' },
});
