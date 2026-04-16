#!/usr/bin/env node
// .claude/hooks/lint-on-save.mjs
// Runs after every file write — auto-fixes lint errors

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const filePath = input?.tool_input?.file_path || input?.tool_input?.path || ''

if (!filePath) process.exit(0)

const isFrontend = filePath.includes('frontend/src') && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))
const isBackend = filePath.includes('backend/src') && filePath.endsWith('.ts')

try {
  if (isFrontend) {
    execSync(`npx eslint "${filePath}" --fix --quiet`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    })
    execSync(`npx prettier --write "${filePath}"`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    })
  }

  if (isBackend) {
    execSync(`npx eslint "${filePath}" --fix --quiet`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    })
    execSync(`npx prettier --write "${filePath}"`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    })
  }
} catch {
  // Lint errors are advisory — don't block Claude
}

process.exit(0)
