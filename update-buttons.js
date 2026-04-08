const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'EmpresasPage.tsx',
  'PRLPage.tsx',
  'CentroPage.tsx',
  'Centros2Page.tsx',
  'ZonasPage.tsx',
  'Zonas2Page.tsx',
  'ExtintoresPage.tsx',
  'LocalizarExtintorPage.tsx',
  'UltimosUsadosPage.tsx',
  'UsuariosRolesPage.tsx',
  'IndustryPage.tsx',
  'ConfiguracionCapaPage.tsx'
];

const topRowReplacement = `{/* Top Row: IA Button and Back Button */}
          <div className="flex gap-2 w-[248px]">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onOpenIA}
              className="w-[184px] h-14 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 text-yellow-950 rounded-lg flex items-center justify-center font-black tracking-[0.2em] text-xl shadow-md border border-yellow-300/50"
            >
              IA
            </motion.button>
            
            {/* Back Button (Silver) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              {...longPressBack}
              className="bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-slate-200/50"
            >
              <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
            </motion.button>
          </div>`;

const leftColReplacement = `<div className="flex flex-col gap-2">
              {/* Settings Button (Dark Bronze) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenConfiguracion}
                className="bg-gradient-to-br from-orange-800 via-orange-950 to-neutral-950 text-orange-200 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-orange-800/50"
              >
                <SlidersHorizontal className="w-8 h-8" strokeWidth={2.5} />
              </motion.button>

              {/* Add Button (Chrome/Dark Metal) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-zinc-500 via-zinc-700 to-zinc-900 text-zinc-100 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-zinc-400/50"
              >
                <PlusCircle className="w-8 h-8" strokeWidth={2.5} />
              </motion.button>

              {/* Messages Button (Dark Orange Metallic) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-amber-700 via-orange-800 to-orange-950 text-orange-100 w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-orange-500/50"
              >
                <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
              </motion.button>
            </div>`;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, 'src/components', file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', file);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Top Row
  const topRowRegex = /\{\/\* Top Row: IA Button \(Wide\) \*\/\}\s*<div className="flex gap-2">\s*<div className="w-14"><\/div>.*?\s*<motion\.button[\s\S]*?onClick=\{onOpenIA\}[\s\S]*?>\s*IA\s*<\/motion\.button>\s*<\/div>/;
  
  if (topRowRegex.test(content)) {
    content = content.replace(topRowRegex, topRowReplacement);
  } else {
    console.log('Top Row not found in', file);
  }

  // Replace Left Column
  const leftColRegex = /<div className="flex flex-col gap-2">\s*<motion\.button[\s\S]*?onClick=\{onOpenConfiguracion\}[\s\S]*?<\/motion\.button>\s*<motion\.button[\s\S]*?PlusCircle[\s\S]*?<\/motion\.button>\s*<motion\.button[\s\S]*?longPressBack[\s\S]*?<\/motion\.button>\s*<\/div>/;
  
  if (leftColRegex.test(content)) {
    content = content.replace(leftColRegex, leftColReplacement);
  } else {
    // Try alternate regex if comments are present
    const leftColRegexWithComments = /<div className="flex flex-col gap-2">\s*\{\/\* Settings Button[\s\S]*?<\/motion\.button>\s*<\/div>/;
    if (leftColRegexWithComments.test(content)) {
      content = content.replace(leftColRegexWithComments, leftColReplacement);
    } else {
      console.log('Left Col not found in', file);
    }
  }

  // Ensure MessageSquare is imported
  if (!content.includes('MessageSquare')) {
    content = content.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, (match, p1) => {
      if (!p1.includes('MessageSquare')) {
        return `import {${p1}, MessageSquare } from 'lucide-react';`;
      }
      return match;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
});
