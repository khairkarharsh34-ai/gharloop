import { Platform, Share } from 'react-native';

export const APP_URL = 'https://app.gharloop.com';
export const inviteLink = (code: string) => `${APP_URL}/join/${code}`;

/** Opens the phone's share sheet (WhatsApp etc.); on a laptop browser, copies the text instead. */
export async function shareText(message: string): Promise<'shared' | 'copied'> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ text: message });
        return 'shared';
      } catch {
        // User closed the share sheet or it failed: fall back to copying.
      }
    }
    await nav?.clipboard?.writeText(message);
    return 'copied';
  }
  await Share.share({ message });
  return 'shared';
}

export const inviteMessage = (society: string, code: string) =>
  `Our society ${society} is now on Ghar Loop: notices, complaints, visitors and SOS in one app.\n\n` +
  `Join here: ${inviteLink(code)}\n(or open ${APP_URL} and use society code ${code})\n\n` +
  `Your committee approves every resident, so only neighbours can see our society.`;
