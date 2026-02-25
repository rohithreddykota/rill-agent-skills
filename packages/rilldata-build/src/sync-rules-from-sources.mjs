#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    rillRepo: process.env.RILL_REPO || '/tmp/rill-repo',
    skillDir: process.env.SKILL_DIR || path.resolve('skills/rilldata'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--rill-repo') {
      args.rillRepo = argv[i + 1];
      i += 1;
    } else if (arg === '--skill-dir') {
      args.skillDir = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function splitFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return { frontmatter: {}, body: content };
  }

  const end = content.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontmatter: {}, body: content };
  }

  const fmRaw = content.slice(4, end);
  const body = content.slice(end + 5);
  const frontmatter = {};

  for (const line of fmRaw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function extractFirstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function toTitleFromFilename(fileName) {
  const base = fileName.replace(/\.md$/, '');
  return base
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeYamlString(value) {
  return String(value).replace(/"/g, '\\"');
}

function toRuleDoc({ title, section, sourcePath, sourceUrl, tags, body }) {
  const tagsText = tags.map((t) => `'${t}'`).join(', ');

  return `---\ntitle: \"${escapeYamlString(title)}\"\nsection: ${section}\nsourcePath: ${sourcePath}\nsourceUrl: ${sourceUrl}\ntags: [${tagsText}]\n---\n\n> Canonical source: \`${sourcePath}\`\n> Source URL: <${sourceUrl}>\n> Extraction: Original markdown body preserved verbatim after this header.\n\n${body.replace(/^\n+/, '')}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeRuleFile({ rulePath, ruleDoc }) {
  await fs.writeFile(rulePath, ruleDoc, 'utf8');
}

async function syncRuntimeDocs({ rillRepo, rulesDir }) {
  const runtimeDocs = [
    'runtime/ai/instructions/data/development.md',
    'runtime/ai/instructions/data/resources/canvas.md',
    'runtime/ai/instructions/data/resources/connector.md',
    'runtime/ai/instructions/data/resources/explore.md',
    'runtime/ai/instructions/data/resources/metrics_view.md',
    'runtime/ai/instructions/data/resources/model.md',
    'runtime/ai/instructions/data/resources/rillyaml.md',
    'runtime/ai/instructions/data/resources/theme.md',
  ];

  const written = [];

  for (const sourcePath of runtimeDocs) {
    const abs = path.join(rillRepo, sourcePath);
    const raw = await fs.readFile(abs, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    const heading = extractFirstHeading(body);
    const baseName = path.basename(sourcePath).replace(/\.md$/, '');
    const fileStem = `runtime-${baseName.replace(/_/g, '-')}`;
    const ruleFile = `${fileStem}.md`;
    const rulePath = path.join(rulesDir, ruleFile);

    const title = frontmatter.title || heading || toTitleFromFilename(baseName);
    const sourceUrl = `https://github.com/rilldata/rill/blob/main/${sourcePath}`;

    const ruleDoc = toRuleDoc({
      title,
      section: 'runtime',
      sourcePath,
      sourceUrl,
      tags: ['rill', 'runtime', 'instructions', 'product-usage'],
      body,
    });

    await writeRuleFile({ rulePath, ruleDoc });
    written.push(ruleFile);
  }

  return written;
}

async function syncProjectFilesDocs({ rillRepo, rulesDir }) {
  const projectFilesDir = path.join(rillRepo, 'docs/docs/reference/project-files');
  const entries = await fs.readdir(projectFilesDir);
  const docs = entries
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'en-US'));

  const written = [];

  for (const fileName of docs) {
    const sourcePath = `docs/docs/reference/project-files/${fileName}`;
    const abs = path.join(rillRepo, sourcePath);
    const raw = await fs.readFile(abs, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    const heading = extractFirstHeading(body);
    const baseName = fileName.replace(/\.md$/, '');
    const fileStem = `project-files-${baseName}`;
    const ruleFile = `${fileStem}.md`;
    const rulePath = path.join(rulesDir, ruleFile);

    const title = frontmatter.title || heading || toTitleFromFilename(baseName);
    const slug = baseName === 'index' ? '' : `/${baseName}`;
    const sourceUrl = `https://docs.rilldata.com/reference/project-files${slug}`;

    const ruleDoc = toRuleDoc({
      title,
      section: 'project-files',
      sourcePath,
      sourceUrl,
      tags: ['rill', 'project-files', 'reference', 'product-usage'],
      body,
    });

    await writeRuleFile({ rulePath, ruleDoc });
    written.push(ruleFile);
  }

  return written;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillDir = path.resolve(args.skillDir);
  const rulesDir = path.join(skillDir, 'rules');

  await ensureDir(rulesDir);

  const runtimeWritten = await syncRuntimeDocs({ rillRepo: args.rillRepo, rulesDir });
  const projectFilesWritten = await syncProjectFilesDocs({ rillRepo: args.rillRepo, rulesDir });

  console.log(`Wrote ${runtimeWritten.length} runtime rules and ${projectFilesWritten.length} project-files rules.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
