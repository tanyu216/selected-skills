#!/usr/bin/env node
// 将 entrypoint 记录的 results.tsv 转成 JUnit XML，供 CI 展示与归档。
import fs from 'node:fs';

const [, , tsvPath, outPath] = process.argv;

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
  }[char]));
}

function tailOf(file, lines = 80) {
  try {
    const content = fs.readFileSync(file, 'utf8').trimEnd().split('\n');
    return content.slice(-lines).join('\n');
  } catch {
    return '';
  }
}

let rows = [];
try {
  rows = fs.readFileSync(tsvPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, suite, status, time, log] = line.split('\t');
      return { name, suite, status, time: Number(time) || 0, log };
    });
} catch {
  rows = [];
}

const failures = rows.filter((row) => row.status !== 'passed');
const totalTime = rows.reduce((sum, row) => sum + row.time, 0);

const testcases = rows.map((row) => {
  const attrs = `name="${escapeXml(row.suite)}" classname="selected-skills-verify" time="${row.time}"`;
  if (row.status === 'passed') {
    return `    <testcase ${attrs} />`;
  }
  const output = escapeXml(tailOf(row.log));
  return [
    `    <testcase ${attrs}>`,
    `      <failure message="suite failed">${output}</failure>`,
    `    </testcase>`
  ].join('\n');
}).join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<testsuites name="selected-skills-verify" tests="${rows.length}" failures="${failures.length}" time="${totalTime}">`,
  `  <testsuite name="docker-verify" tests="${rows.length}" failures="${failures.length}" time="${totalTime}">`,
  testcases,
  '  </testsuite>',
  '</testsuites>',
  ''
].join('\n');

fs.writeFileSync(outPath, xml);
console.log(`JUnit: ${outPath} (${rows.length} suites, ${failures.length} failed)`);
