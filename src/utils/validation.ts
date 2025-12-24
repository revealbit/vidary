import type { TreeItem, VideoItem, GroupItem, VideoStatus } from '../types';

// Maximum file size for imports (10MB)
export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;

// Maximum number of items allowed in a single import
export const MAX_IMPORT_ITEMS = 10000;

// Valid video statuses
const VALID_STATUSES: VideoStatus[] = ['none', 'watched', 'important', 'to-watch', 'in-progress'];

/**
 * Validates that a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validates that a value is a valid UUID v4 format
 */
function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates that a value is a non-negative number
 */
function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validates that a value is null or a valid UUID
 */
function isNullOrUUID(value: unknown): value is string | null {
  return value === null || isValidUUID(value);
}

/**
 * Validates a VideoItem structure
 */
function validateVideoItem(item: unknown): item is VideoItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Required fields
  if (!isValidUUID(obj.id)) return false;
  if (!isNonEmptyString(obj.title)) return false;
  if (!isNonEmptyString(obj.url)) return false;
  if (!isNonEmptyString(obj.youtubeId)) return false;
  if (!isNullOrUUID(obj.parentId)) return false;
  if (!isNonNegativeNumber(obj.order)) return false;
  if (obj.type !== 'video') return false;
  if (!isNonNegativeNumber(obj.createdAt)) return false;

  // Optional fields
  if (obj.status !== undefined && !VALID_STATUSES.includes(obj.status as VideoStatus)) {
    return false;
  }
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    return false;
  }

  // Security: Validate YouTube ID format (11 alphanumeric chars with - and _)
  const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (!youtubeIdRegex.test(obj.youtubeId as string)) {
    return false;
  }

  // Security: Validate URL is actually a YouTube URL
  const url = obj.url as string;
  if (!url.startsWith('https://www.youtube.com/') &&
      !url.startsWith('https://youtube.com/') &&
      !url.startsWith('https://youtu.be/')) {
    return false;
  }

  return true;
}

/**
 * Validates a GroupItem structure
 */
function validateGroupItem(item: unknown): item is GroupItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Required fields
  if (!isValidUUID(obj.id)) return false;
  if (!isNonEmptyString(obj.name)) return false;
  if (!isNullOrUUID(obj.parentId)) return false;
  if (!isNonNegativeNumber(obj.order)) return false;
  if (obj.type !== 'group') return false;
  if (typeof obj.isExpanded !== 'boolean') return false;
  if (!isNonNegativeNumber(obj.createdAt)) return false;

  return true;
}

/**
 * Validates a single TreeItem (either VideoItem or GroupItem)
 */
function validateTreeItem(item: unknown): item is TreeItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  if (obj.type === 'video') {
    return validateVideoItem(item);
  } else if (obj.type === 'group') {
    return validateGroupItem(item);
  }

  return false;
}

export interface ValidationResult {
  valid: boolean;
  items?: TreeItem[];
  error?: string;
}

/**
 * Dangerous keys that could be used for prototype pollution attacks.
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Recursively checks an object for prototype pollution keys.
 * Returns true if dangerous keys are found.
 */
function hasPrototypePollutionKeys(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => hasPrototypePollutionKeys(item));
  }

  const keys = Object.keys(obj);
  if (keys.some(key => DANGEROUS_KEYS.includes(key))) {
    return true;
  }

  return Object.values(obj).some(value => hasPrototypePollutionKeys(value));
}

/**
 * Validates imported JSON data for security and data integrity.
 * Returns validated items or an error message.
 */
export function validateImportData(json: string): ValidationResult {
  // Check for empty input
  if (!json || json.trim().length === 0) {
    return { valid: false, error: 'Empty import data' };
  }

  // Parse JSON safely
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { valid: false, error: 'Invalid JSON format' };
  }

  // Security: Check for prototype pollution attempts
  if (hasPrototypePollutionKeys(parsed)) {
    return { valid: false, error: 'Invalid import data: forbidden keys detected' };
  }

  // Must be an array
  if (!Array.isArray(parsed)) {
    return { valid: false, error: 'Import data must be an array' };
  }

  // Check item count limit
  if (parsed.length > MAX_IMPORT_ITEMS) {
    return { valid: false, error: `Too many items (max ${MAX_IMPORT_ITEMS})` };
  }

  // Validate each item
  const validatedItems: TreeItem[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];

    if (!validateTreeItem(item)) {
      return { valid: false, error: `Invalid item at index ${i}` };
    }

    // Check for duplicate IDs
    if (seenIds.has(item.id)) {
      return { valid: false, error: `Duplicate ID found: ${item.id}` };
    }
    seenIds.add(item.id);

    // Create sanitized copy with only allowed properties
    if (item.type === 'video') {
      validatedItems.push({
        id: item.id,
        title: sanitizeString(item.title),
        url: item.url,
        youtubeId: item.youtubeId,
        parentId: item.parentId,
        order: item.order,
        type: 'video',
        createdAt: item.createdAt,
        status: item.status,
        description: item.description ? sanitizeString(item.description) : undefined,
      });
    } else {
      validatedItems.push({
        id: item.id,
        name: sanitizeString(item.name),
        parentId: item.parentId,
        order: item.order,
        type: 'group',
        isExpanded: item.isExpanded,
        createdAt: item.createdAt,
      });
    }
  }

  // Validate parent references (all parentIds must exist or be null)
  for (const item of validatedItems) {
    if (item.parentId !== null && !seenIds.has(item.parentId)) {
      return { valid: false, error: `Invalid parent reference: ${item.parentId}` };
    }
  }

  // Check for circular references
  const circularCheck = detectCircularReferences(validatedItems);
  if (circularCheck) {
    return { valid: false, error: `Circular reference detected: ${circularCheck}` };
  }

  return { valid: true, items: validatedItems };
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * while preserving legitimate content.
 */
function sanitizeString(str: string): string {
  // Remove null bytes and other control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Detects circular references in the parent-child hierarchy.
 * Returns the ID where a cycle is detected, or null if no cycles exist.
 */
function detectCircularReferences(items: TreeItem[]): string | null {
  const itemMap = new Map<string, TreeItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  for (const item of items) {
    const visited = new Set<string>();
    let current: TreeItem | undefined = item;

    while (current) {
      if (visited.has(current.id)) {
        return current.id;
      }
      visited.add(current.id);

      if (current.parentId === null) {
        break;
      }
      current = itemMap.get(current.parentId);
    }
  }

  return null;
}
