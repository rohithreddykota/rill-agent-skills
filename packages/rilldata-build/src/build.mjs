#!/usr/bin/env node
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { getRules, getSections, readFile } from './lib.mjs';

function parseArgs(argv) {
  const args = {
    skillDir: process.env.SKILL_DIR || path.resolve('skills/rilldata'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--skill-dir') {
      args.skillDir = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function groupBySection(rules) {
  const grouped = new Map();
  for (const rule of rules) {
    const key = rule.meta.section;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(rule);
  }

  for (const [, values] of grouped) {
    values.sort((a, b) => {
      const left = a.meta.title || a.fileName;
      const right = b.meta.title || b.fileName;
      return left.localeCompare(right, 'en-US');
    });
  }

  return grouped;
}

function anchorFromHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function generateMarkdown({ metadata, sections, grouped }) {
  const lines = [];
  lines.push('# Rill - Compiled Agent Guide');
  lines.push('');
  lines.push(`**Version ${metadata.version}**  `);
  lines.push(`${metadata.organization}  `);
  lines.push(`${metadata.date}`);
  lines.push('');
  lines.push('> This document is generated from modular rule files for AI agents.');
  lines.push('> It focuses on Rill project file authoring and operational workflows.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Abstract');
  lines.push('');
  lines.push(metadata.abstract || 'Rill reference for AI agents.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Table of Contents');
  lines.push('');

  for (const section of sections) {
    const sectionRules = grouped.get(section.id) || [];
    const sectionHeading = `${section.number}. ${section.title}`;
    lines.push(`${section.number}. [${section.title}](#${anchorFromHeading(sectionHeading)}) - **${section.impact}**`);

    let index = 1;
    for (const rule of sectionRules) {
      const heading = `${section.number}.${index} ${rule.meta.title}`;
      lines.push(`   - ${section.number}.${index} [${rule.meta.title}](#${anchorFromHeading(heading)})`);
      index += 1;
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  for (const section of sections) {
    const sectionRules = grouped.get(section.id) || [];
    const sectionHeading = `${section.number}. ${section.title}`;

    lines.push(`## ${sectionHeading}`);
    lines.push('');
    lines.push(`**Impact: ${section.impact}**`);
    lines.push('');
    if (section.description) {
      lines.push(section.description);
      lines.push('');
    }

    let index = 1;
    for (const rule of sectionRules) {
      const ruleHeading = `${section.number}.${index} ${rule.meta.title}`;
      lines.push(`### ${ruleHeading}`);
      lines.push('');
      lines.push(`Source: [${rule.meta.sourcePath}](${rule.meta.sourceUrl})`);
      lines.push('');
      lines.push(rule.body.trim());
      lines.push('');
      index += 1;
    }

    lines.push('---');
    lines.push('');
  }

  if (Array.isArray(metadata.references) && metadata.references.length > 0) {
    lines.push('## References');
    lines.push('');
    metadata.references.forEach((ref, idx) => {
      lines.push(`${idx + 1}. [${ref}](${ref})`);
    });
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillDir = path.resolve(args.skillDir);

  const sections = await getSections(skillDir);
  const rules = await getRules(skillDir);
  const grouped = groupBySection(rules);

  const metadataPath = path.join(skillDir, 'metadata.json');
  const metadataRaw = await readFile(metadataPath);
  const metadata = JSON.parse(metadataRaw);

  const output = generateMarkdown({ metadata, sections, grouped });
  const outputPath = path.join(skillDir, 'AGENTS.md');
  await fs.writeFile(outputPath, output, 'utf8');

  console.log(
    `Built ${outputPath} from ${rules.length} rules in ${sections.length} sections.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
