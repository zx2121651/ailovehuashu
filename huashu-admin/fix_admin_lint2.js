const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix error/err unused
    content = content.replace(/catch \((err|error|e)\) \{/g, 'catch (_$1) {');

    // Fix empty catch blocks
    content = content.replace(/catch \(_err\) \{\s*\}/g, 'catch (_err) { console.error(_err); }');

    fs.writeFileSync(file, content);
});
