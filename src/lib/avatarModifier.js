export function removeBackgroundColor(url) {
  const u = new URL(url);
  u.searchParams.delete('backgroundColor');
  return u.toString();
}
export function flip(url) {
  const u = new URL(url);
  u.searchParams.delete('flip');

  return u.toString();
}
export function replaceFaceParams(url) {
  const cleanedUrl = removeBackgroundColor(url);
  const u = new URL(cleanedUrl);

  // ----- Random mouth -----
  const mouthStyles = ['laughing', 'surprised', 'smile', 'smirk'];
  const randomMouth = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];
  u.searchParams.set('mouth', randomMouth);

  // ----- Eyes logic -----
  const currentEyes = u.searchParams.get('eyes');

  if (currentEyes === 'eyes' || currentEyes === 'round') {
    u.searchParams.set('eyes', 'smiling');
  } else if (currentEyes === 'eyesShadow') {
    u.searchParams.set('eyes', 'smilingShadow');
  }
  // Force fresh URL every time
  u.searchParams.set('_rnd', Math.random().toString(36).slice(2));
  return u.toString();
}
