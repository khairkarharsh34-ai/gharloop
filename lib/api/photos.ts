import { myId, supabase } from './client';

export type PickedPhoto = { uri: string; base64?: string | null; mimeType?: string | null };

/** Uploads a picked photo to the public "photos" bucket and returns its URL. */
export async function uploadPhoto(photo: PickedPhoto, folder: string) {
  const uid = await myId();
  const type = photo.mimeType || 'image/jpeg';
  const ext = type.includes('png') ? 'png' : 'jpg';
  const path = `${uid}/${folder}-${Date.now()}.${ext}`;
  // Phones give us base64; the web gives us a blob URL.
  const body = photo.base64 ? decodeBase64(photo.base64) : await (await fetch(photo.uri)).blob();
  const { error } = await supabase.storage.from('photos').upload(path, body, { contentType: type });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(b64: string) {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const [a, b, c, d] = [0, 1, 2, 3].map((k) => CHARS.indexOf(clean[i + k] ?? 'A'));
    bytes[p++] = (a << 2) | (b >> 4);
    if (i + 2 < clean.length) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < clean.length) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes.slice(0, p).buffer;
}
