const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('MessageSquare')) {
    content = content.replace(/MessageSquare/g, 'MessageSquareMore');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/transition=\{\{ duration: 0\.5 \}\}/g, 'transition={{ duration: 0.15 }}');
appContent = appContent.replace(/transition=\{\{ duration: 0\.4 \}\}/g, 'transition={{ duration: 0.15 }}');
fs.writeFileSync(appPath, appContent);
console.log('Updated App.tsx');
