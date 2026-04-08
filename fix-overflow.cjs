const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx') || f === 'HomeScreen.tsx');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('p-4 sm:p-6 overflow-hidden')) {
    content = content.replace(/p-4 sm:p-6 overflow-hidden/g, 'p-4 sm:p-6 overflow-y-auto overflow-x-hidden');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
