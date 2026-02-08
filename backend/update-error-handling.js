/**
 * Script to batch update remaining API routes with new error handling
 * This script updates imports and error handling blocks in all remaining routes
 */

const fs = require('fs');
const path = require('path');

const routesToUpdate = [
  'app/api/announcements/route.ts',
  'app/api/announcements/[id]/route.ts',
  'app/api/resources/route.ts',
  'app/api/resources/[id]/route.ts',
  'app/api/sponsors/route.ts',
  'app/api/sponsors/[id]/route.ts',
  'app/api/sponsors/[id]/logo/route.ts',
  'app/api/leaderboard/route.ts',
  'app/api/leaderboard/[eventId]/route.ts',
  'app/api/registrations/[id]/route.ts',
  'app/api/registrations/event/[eventId]/route.ts',
  'app/api/events/[id]/images/route.ts'
];

// Update imports
const updateImports = (content) => {
  // Remove ZodError import
  content = content.replace(/import { ZodError } from 'zod'\n/g, '');
  
  // Add error handling imports if not present
  if (!content.includes("from '@/lib/errors'")) {
    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const nextNewlineIndex = content.indexOf('\n', lastImportIndex);
    
    const errorImport = "import { handleApiError, NotFoundError, ValidationError, ConflictError, AuthorizationError } from '@/lib/errors'\n";
    content = content.slice(0, nextNewlineIndex + 1) + errorImport + content.slice(nextNewlineIndex + 1);
  }
  
  return content;
};

// Update error handling blocks
const updateErrorHandling = (content) => {
  // Replace complex catch blocks with handleApiError
  const catchBlockPattern = /} catch \(error\) \{[\s\S]*?(?=\n}\n\nexport|$)/g;
  
  content = content.replace(catchBlockPattern, (match) => {
    // If it already uses handleApiError, skip
    if (match.includes('handleApiError')) {
      return match;
    }
    
    // Replace with simple handleApiError call
    return `} catch (error) {
    return handleApiError(error)
  }`;
  });
  
  return content;
};

// Replace inline error returns with throw statements
const replaceInlineErrors = (content) => {
  // Replace 404 errors
  content = content.replace(
    /return NextResponse\.json\(\s*\{ error: ['"]([^'"]+not found[^'"]*)['"]\s*\},\s*\{ status: 404 \}\s*\)/gi,
    (match, message) => `throw new NotFoundError('${message}')`
  );
  
  // Replace 400 validation errors
  content = content.replace(
    /return NextResponse\.json\(\s*\{ error: ['"]([^'"]+)['"]\s*\},\s*\{ status: 400 \}\s*\)/g,
    (match, message) => `throw new ValidationError('${message}')`
  );
  
  // Replace 409 conflict errors
  content = content.replace(
    /return NextResponse\.json\(\s*\{ error: ['"]([^'"]+)['"]\s*\},\s*\{ status: 409 \}\s*\)/g,
    (match, message) => `throw new ConflictError('${message}')`
  );
  
  // Replace 403 authorization errors
  content = content.replace(
    /return NextResponse\.json\(\s*\{ error: ['"]([^'"]+)['"]\s*\},\s*\{ status: 403 \}\s*\)/g,
    (match, message) => `throw new AuthorizationError('${message}')`
  );
  
  return content;
};

console.log('Updating API routes with new error handling...\n');

routesToUpdate.forEach(route => {
  const filePath = path.join(__dirname, route);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${route} (file not found)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply transformations
    content = updateImports(content);
    content = replaceInlineErrors(content);
    content = updateErrorHandling(content);
    
    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${route}`);
  } catch (error) {
    console.error(`❌ Error updating ${route}:`, error.message);
  }
});

console.log('\n✨ Done!');
