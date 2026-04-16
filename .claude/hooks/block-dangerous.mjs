#!/usr/bin/env node
// .claude/hooks/block-dangerous.mjs
// Blocks commands that could damage the WallCraft project

import { readFileSync } from 'fs'

const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const command = input?.tool_input?.command || ''

const BLOCKED = [
  /rm\s+-rf\s+\//,              // rm -rf /
  /DROP\s+TABLE/i,              // SQL DROP TABLE
  /DROP\s+DATABASE/i,           // SQL DROP DATABASE
  /prisma migrate reset/,       // resets entire DB
  /--force.*prod/,              // force push to prod
]

const WARNING = [
  /prisma migrate dev/,         // migration — warn but allow
]

for (const pattern of BLOCKED) {
  if (pattern.test(command)) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `Blocked dangerous command: ${command.slice(0, 80)}`
    }))
    process.exit(0)
  }
}

for (const pattern of WARNING) {
  if (pattern.test(command)) {
    // Allow but log warning
    console.error(`⚠️  Migration command detected: ${command.slice(0, 80)}`)
  }
}

process.exit(0)
