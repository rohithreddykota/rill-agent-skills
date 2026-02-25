import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) {
    throw new Error('Missing frontmatter opening delimiter');
  }

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('Missing frontmatter closing delimiter');
  }

  const fmBody = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const meta = {};

  const lines = fmBody.split('\n');
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inside = rawValue.slice(1, -1).trim();
      meta[key] = inside
        ? inside.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        : [];
      continue;
    }

    meta[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }

  return { meta, body };
}

export function parseSections(raw) {
  const blocks = raw.split(/(?=^##\s+\d+\.\s+)/m).filter((b) => b.trim());
  const sections = [];

  for (const block of blocks) {
    const header = block.match(/^##\s+(\d+)\.\s+(.+?)\s+\(([^)]+)\)\s*$/m);
    if (!header) {
      continue;
    }

    const number = Number.parseInt(header[1], 10);
    const title = header[2].trim();
    const id = header[3].trim();
    const impactMatch = block.match(/\*\*Impact:\*\*\s+(.+)$/m);
    const descMatch = block.match(/\*\*Description:\*\*\s+([\s\S]+)$/m);

    sections.push({
      number,
      title,
      id,
      impact: impactMatch ? impactMatch[1].trim() : 'UNSPECIFIED',
      description: descMatch ? descMatch[1].trim() : '',
    });
  }

  return sections.sort((a, b) => a.number - b.number);
}

export async function getRules(skillDir) {
  const rulesDir = path.join(skillDir, 'rules');
  const entries = await fs.readdir(rulesDir);
  const ruleFiles = entries
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort((a, b) => a.localeCompare(b, 'en-US'));

  const rules = [];

  for (const fileName of ruleFiles) {
    const filePath = path.join(rulesDir, fileName);
    const raw = await readFile(filePath);
    const { meta, body } = parseFrontmatter(raw);
    rules.push({ fileName, filePath, meta, body });
  }

  return rules;
}

export async function getSections(skillDir) {
  const sectionsPath = path.join(skillDir, 'rules', '_sections.md');
  const raw = await readFile(sectionsPath);
  return parseSections(raw);
}
