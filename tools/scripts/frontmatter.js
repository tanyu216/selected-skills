import { isValidSlug } from './util.js';

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    if (trimmed.startsWith('"')) {
      try { return JSON.parse(trimmed); } catch { return inner; }
    }
    return inner.replaceAll("''", "'");
  }
  return trimmed;
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item))
      .filter((item) => item !== '');
  }
  return unquote(trimmed);
}

export function splitFrontmatter(text) {
  const clean = String(text || '').replace(/^﻿/, '');
  const lineEnding = clean.includes('\r\n') ? '\r\n' : '\n';
  const lines = clean.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    return { data: {}, body: clean, hasFrontmatter: false, lineEnding };
  }
  let close = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') {
      close = index;
      break;
    }
  }
  if (close === -1) {
    return { data: {}, body: clean, hasFrontmatter: false, lineEnding };
  }
  const data = {};
  for (let index = 1; index < close; index += 1) {
    const line = lines[index];
    if (!line || /^\s/.test(line) || line.trim().startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = parseValue(match[2]);
  }
  const body = lines.slice(close + 1).join(lineEnding);
  return { data, body, hasFrontmatter: true, lineEnding };
}

function findTopLevelLine(lines, key) {
  const prefix = `${key}:`;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].startsWith(prefix)) return index;
  }
  return -1;
}

function quoteYaml(value) {
  return JSON.stringify(String(value));
}

/**
 * Normalize an upstream SKILL.md copy:
 * - frontmatter must be the first thing in the file
 * - name must match the install directory slug (required by opencode/pi)
 * - description is filled from the catalog summary if missing
 * Everything else in the frontmatter and body is preserved verbatim.
 */
export function normalizeSkillMd(text, { slug, fallbackDescription }) {
  const clean = String(text || '').replace(/^﻿/, '');
  const lineEnding = clean.includes('\r\n') ? '\r\n' : '\n';
  const lines = clean.split(/\r?\n/);

  if (lines[0]?.trim() !== '---') {
    const finalDescription = fallbackDescription || `Skill ${slug}`;
    return [
      '---',
      `name: ${slug}`,
      `description: ${quoteYaml(finalDescription)}`,
      '---',
      '',
      clean
    ].join('\n');
  }

  let close = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '---') { close = index; break; }
  }
  if (close === -1) {
    return [
      '---',
      `name: ${slug}`,
      `description: ${quoteYaml(fallbackDescription || `Skill ${slug}`)}`,
      '---',
      '',
      clean
    ].join('\n');
  }

  const front = lines.slice(1, close);
  const originalNameIndex = findTopLevelLine(front, 'name');
  let originalName = '';
  if (originalNameIndex !== -1) {
    const raw = front[originalNameIndex].slice('name:'.length).trim();
    originalName = unquote(raw);
  }

  const needsRename = !originalName || originalName !== slug || !isValidSlug(originalName);
  if (needsRename) {
    if (originalNameIndex === -1) {
      front.unshift(`name: ${slug}`);
    } else {
      front[originalNameIndex] = `name: ${slug}`;
    }
    if (originalName && originalName !== slug) {
      const metadataIndex = findTopLevelLine(front, 'metadata');
      const catalogNameLine = `  catalog_name: ${quoteYaml(originalName)}`;
      if (metadataIndex === -1) {
        front.push('metadata:');
        front.push(catalogNameLine);
      } else {
        front.splice(metadataIndex + 1, 0, catalogNameLine);
      }
    }
  }

  const descriptionIndex = findTopLevelLine(front, 'description');
  if (descriptionIndex === -1 || !front[descriptionIndex].slice('description:'.length).trim()) {
    const line = `description: ${quoteYaml(fallbackDescription || `Skill ${slug}`)}`;
    const nameIndex = findTopLevelLine(front, 'name');
    if (descriptionIndex === -1) {
      front.splice(nameIndex + 1, 0, line);
    } else {
      front[descriptionIndex] = line;
    }
  }

  const body = lines.slice(close + 1);
  return ['---', ...front, '---', ...body].join(lineEnding);
}

/**
 * Return a warning when a description is longer than the legacy Codex limit.
 */
export function descriptionWarning(text) {
  const { data } = splitFrontmatter(text);
  const description = typeof data.description === 'string' ? data.description : '';
  if (description.length > 500) {
    return `description 长度 ${description.length} > 500（Codex 旧版限制），可能被截断`;
  }
  return null;
}
