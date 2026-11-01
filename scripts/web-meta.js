// Runs after `expo export -p web`. Adds the tags iPhones need so that
// "Add to Home Screen" opens Ghar Loop full-screen like a normal app.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const file = path.join(dist, 'index.html');
let html = fs.readFileSync(file, 'utf8');

const tags = [
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="apple-mobile-web-app-title" content="Ghar Loop">',
  '<meta name="theme-color" content="#1d5c45">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="manifest" href="/manifest.json">',
].join('\n');

html = html
  .replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
  .replace('</head>', `${tags}\n</head>`)
  .replace(/<title>.*?<\/title>/, '<title>Ghar Loop</title>');
fs.writeFileSync(file, html);

fs.copyFileSync(path.join(__dirname, '..', 'assets', 'icon.png'), path.join(dist, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(__dirname, '..', 'assets', 'icon.png'), path.join(dist, 'icon-512.png'));
fs.writeFileSync(
  path.join(dist, 'manifest.json'),
  JSON.stringify({
    name: 'Ghar Loop',
    short_name: 'Ghar Loop',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f4ee',
    theme_color: '#1d5c45',
    icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  }, null, 2),
);
console.log('web-meta: home-screen tags added');
