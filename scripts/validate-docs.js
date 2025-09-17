#!/usr/bin/env node

/**
 * Documentation Structure Validator
 * Prevents scattered documentation files and enforces organized structure
 */

// const fs = require('fs');
// const path = require('path');
const { execSync } = require('child_process')

// Allowed documentation locations
const ALLOWED_DOCS = [
  'README.md',
  'docs/development/',
  'docs/design/',
  'docs/specifications/',
  'docs/guides/',
]

// Forbidden documentation patterns
const FORBIDDEN_PATTERNS = [
  /^CLAUDE\.md$/,
  /^TESTING_GUIDE\.md$/,
  /^DOCUMENTATION\.md$/,
  /^GUIDE\.md$/,
  /^SPEC\.md$/,
  /^README_.*\.md$/,
  /^memory\//,
  /^templates\//,
  /^design-docs\//,
  /^\.claude\//,
  /^dev-docs\//,
  /.*\/README_temp\.md$/,
  /.*\/temp_.*\.md$/,
  /.*\/draft_.*\.md$/,
  /.*\/backup_.*\.md$/,
]

// Get list of staged .md files
function getStagedMarkdownFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=A', {
      encoding: 'utf8',
    })
    return output
      .split('\n')
      .filter(file => file.trim())
      .filter(file => file.endsWith('.md') || file.includes('/README.md'))
  } catch (error) {
    return []
  }
}

// Check if file is in allowed location
function isAllowedLocation(filePath) {
  // Check if it's the main README
  if (filePath === 'README.md') return true

  // Check if it's in allowed docs directories
  return ALLOWED_DOCS.some(allowedPath => {
    if (allowedPath.endsWith('/')) {
      return filePath.startsWith(allowedPath)
    }
    return filePath === allowedPath
  })
}

// Check if file matches forbidden patterns
function isForbiddenPattern(filePath) {
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(filePath))
}

// Validate documentation structure
function validateDocumentationStructure() {
  const stagedFiles = getStagedMarkdownFiles()
  const violations = []

  for (const file of stagedFiles) {
    // Check forbidden patterns
    if (isForbiddenPattern(file)) {
      violations.push({
        file,
        type: 'forbidden_pattern',
        message: `File matches forbidden pattern. Use organized docs/ structure instead.`,
      })
      continue
    }

    // Check allowed locations
    if (!isAllowedLocation(file)) {
      violations.push({
        file,
        type: 'wrong_location',
        message: `Documentation must be in designated locations only. Move to docs/ structure.`,
      })
    }
  }

  return violations
}

// Check for duplicate documentation
function checkDuplicateDocumentation() {
  const violations = []
  const stagedFiles = getStagedMarkdownFiles()

  // Check for multiple README files
  const readmeFiles = stagedFiles.filter(
    file => file.includes('README.md') && file !== 'README.md'
  )

  if (readmeFiles.length > 0) {
    violations.push({
      files: readmeFiles,
      type: 'duplicate_readme',
      message:
        'Multiple README files detected. Consolidate into organized docs/ structure.',
    })
  }

  return violations
}

// Main validation function
function main() {
  /* eslint-disable no-console */
  console.log('🔍 Validating documentation structure...')

  const structureViolations = validateDocumentationStructure()
  const duplicateViolations = checkDuplicateDocumentation()
  const allViolations = [...structureViolations, ...duplicateViolations]

  if (allViolations.length === 0) {
    console.log('✅ Documentation structure validation passed!')
    process.exit(0)
  }

  console.log('❌ Documentation structure violations found:\n')

  allViolations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.type.toUpperCase()}`)
    if (violation.file) {
      console.log(`   File: ${violation.file}`)
    }
    if (violation.files) {
      console.log(`   Files: ${violation.files.join(', ')}`)
    }
    console.log(`   Error: ${violation.message}\n`)
  })

  console.log('📋 ALLOWED documentation locations:')
  ALLOWED_DOCS.forEach(location => {
    console.log(`   ✅ ${location}`)
  })

  console.log('\n🚫 FORBIDDEN patterns:')
  console.log('   ❌ Root-level .md files (except README.md)')
  console.log('   ❌ Scattered README files')
  console.log('   ❌ memory/, templates/, .claude/ directories')
  console.log('   ❌ Temporary or backup documentation files')

  console.log('\n💡 Solution: Move documentation to organized docs/ structure')
  console.log('   docs/development/    - Development guides')
  console.log('   docs/design/         - Design system')
  console.log('   docs/specifications/ - Technical specs')
  console.log('   docs/guides/         - User guides')

  process.exit(1)
  /* eslint-enable no-console */
}

// Run validation
if (require.main === module) {
  main()
}

module.exports = {
  validateDocumentationStructure,
  checkDuplicateDocumentation,
  isAllowedLocation,
  isForbiddenPattern,
}
