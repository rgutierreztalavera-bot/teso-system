const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Page.tsx') || f === 'HomeScreen.tsx');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (content.includes('flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden')) {
    content = content.replace(
      'flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden',
      'flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto overflow-x-hidden'
    );
    changed = true;
  }
  
  if (content.includes('w-full max-w-md flex flex-col gap-4 sm:gap-6"')) {
    content = content.replace(
      'w-full max-w-md flex flex-col gap-4 sm:gap-6"',
      'w-full max-w-md flex flex-col gap-4 sm:gap-6 my-auto shrink-0 py-6"'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
