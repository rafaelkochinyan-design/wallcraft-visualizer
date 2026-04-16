#!/usr/bin/env node
// .claude/hooks/verify-build.mjs
// Runs after Claude stops — reminds to check build if files were changed

import { readFileSync } from 'fs'

const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const hasEdits = input?.tool_uses?.some(t =>
  ['Write', 'Edit', 'MultiEdit'].includes(t?.name)
)

if (hasEdits) {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FILES CHANGED — Verify before closing:
   cd frontend && npx tsc --noEmit
   cd frontend && npm run build
   cd backend  && npx tsc --noEmit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

process.exit(0)
