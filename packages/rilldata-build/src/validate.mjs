#!/usr/bin/env node
import path from 'node:path';
import { getRules, getSections } from './lib.mjs';

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

function requiredMeta(rule, key, errors) {
  const value = rule.meta[key];
  if (value === undefined || value === null || value === '') {
    errors.push(`${rule.fileName}: missing '${key}' in frontmatter`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillDir = path.resolve(args.skillDir);
  const sections = await getSections(skillDir);
  const rules = await getRules(skillDir);

  const errors = [];
  const sectionIds = new Set(sections.map((s) => s.id));

  if (sections.length === 0) {
    errors.push('No sections found in rules/_sections.md');
  }

  if (rules.length === 0) {
    errors.push('No rule files found in rules/');
  }

  for (const rule of rules) {
    requiredMeta(rule, 'title', errors);
    requiredMeta(rule, 'section', errors);
    requiredMeta(rule, 'sourcePath', errors);
    requiredMeta(rule, 'sourceUrl', errors);

    if (!rule.body.trim()) {
      errors.push(`${rule.fileName}: empty body`);
    }

    const section = rule.meta.section;
    if (section && !sectionIds.has(section)) {
      errors.push(
        `${rule.fileName}: section '${section}' not declared in rules/_sections.md`
      );
    }

    const sourceUrl = rule.meta.sourceUrl;
    if (sourceUrl && !/^https:\/\//.test(sourceUrl)) {
      errors.push(`${rule.fileName}: sourceUrl must be an absolute https URL`);
    }
  }

  if (errors.length > 0) {
    console.error('Validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Validation passed: ${rules.length} rules across ${sections.length} sections.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
