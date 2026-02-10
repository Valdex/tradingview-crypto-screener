import * as fs from 'fs';
import * as path from 'path';
import type { FieldMap } from './types';

let cachedFields: FieldMap | null = null;

export function loadFields(filePath?: string): FieldMap {
  if (cachedFields && !filePath) return cachedFields;

  const resolved = filePath ?? path.resolve(__dirname, '..', 'src', 'fields', 'crypto.json');

  // Try the source path first, then try relative to dist
  let actualPath = resolved;
  if (!fs.existsSync(actualPath)) {
    actualPath = path.resolve(__dirname, 'fields', 'crypto.json');
  }
  if (!fs.existsSync(actualPath)) {
    // Fallback: look next to the package root
    actualPath = path.resolve(__dirname, '..', 'fields', 'crypto.json');
  }

  const raw = fs.readFileSync(actualPath, 'utf8');
  const fields: FieldMap = JSON.parse(raw);

  if (!filePath) cachedFields = fields;
  return fields;
}
