const fs = require('fs');

const contentPath = 'huashu-admin/src/pages/Content.jsx';
let content = fs.readFileSync(contentPath, 'utf8');

// The `fetchScripts` function is currently inside `useEffect` but used in `handleSubmit`.
// We need to move it out and wrap in useCallback if it depends on state or token, or simply move it outside.
// But we can just use sed/regex.

const hookImportCheck = content.match(/import \{.*?\} from 'react';/);
if (hookImportCheck && !hookImportCheck[0].includes('useCallback')) {
    content = content.replace(/import \{/, 'import { useCallback, ');
}

// Find useEffect that contains fetchScripts
const fetchScriptsPattern = /useEffect\(\(\) => \{\s*const fetchScripts = async \(\) => \{([\s\S]*?)\};\s*fetchScripts\(\);\s*\}, \[token\]\);/;

const match = content.match(fetchScriptsPattern);
if (match) {
    const fetchBody = match[1];
    const newFetchScripts = `const fetchScripts = useCallback(async () => {${fetchBody}}, [token]);\n\n  useEffect(() => {\n    fetchScripts();\n  }, [fetchScripts]);`;
    content = content.replace(fetchScriptsPattern, newFetchScripts);
} else {
    console.log("Could not find fetchScripts useEffect pattern");
}

fs.writeFileSync(contentPath, content);

const authContextPath = 'huashu-admin/src/context/AuthContext.jsx';
let authContext = fs.readFileSync(authContextPath, 'utf8');
if (!authContext.includes('eslint-disable-next-line react-refresh/only-export-components')) {
    authContext = authContext.replace(/export const AuthProvider =/, '// eslint-disable-next-line react-refresh/only-export-components\nexport const AuthProvider =');
    authContext = authContext.replace(/export const useAuth =/, '// eslint-disable-next-line react-refresh/only-export-components\nexport const useAuth =');
}

fs.writeFileSync(authContextPath, authContext);
