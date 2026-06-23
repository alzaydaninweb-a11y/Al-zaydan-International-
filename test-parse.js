const fs = require('fs');
const babel = require('@babel/parser');
const code = fs.readFileSync('src/admin/pages/AdminProductForm.tsx', 'utf-8');
try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Valid syntax!');
} catch (e) {
  console.error(e.message);
}
