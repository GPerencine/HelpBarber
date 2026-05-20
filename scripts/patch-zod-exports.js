const fs = require('fs');
const path = require('path');

const zodPackageJsonPath = path.resolve(__dirname, '../node_modules/zod/package.json');

try {
  if (fs.existsSync(zodPackageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(zodPackageJsonPath, 'utf8'));
    if (pkg.exports && !pkg.exports['./v3']) {
      pkg.exports['./v3'] = {
        types: './index.d.ts',
        require: './lib/index.js',
        import: './lib/index.mjs'
      };
      fs.writeFileSync(zodPackageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log('Successfully patched zod/package.json to export ./v3');
    } else {
      console.log('zod/package.json already patched or exports not found');
    }
  } else {
    console.log('zod/package.json not found');
  }
} catch (error) {
  console.error('Failed to patch zod/package.json:', error);
  process.exit(1);
}
