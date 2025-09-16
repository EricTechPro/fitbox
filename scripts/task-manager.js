#!/usr/bin/env node

/**
 * FitBox Task Manager - Custom Command for Task Completion
 *
 * Usage:
 *   ./scripts/task-manager.js complete T015 T016 T017 "Enhanced with security features"
 *   ./scripts/task-manager.js status
 *   ./scripts/task-manager.js next
 *   ./scripts/task-manager.js summary
 */

/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

const TASKS_FILE = path.join(
  __dirname,
  '../specs/001-create-comprehensive-technical/tasks.md'
)

class TaskManager {
  constructor() {
    this.tasksContent = fs.readFileSync(TASKS_FILE, 'utf8')
  }

  /**
   * Mark tasks as complete with optional completion notes
   */
  completeTasks(taskIds, notes = '') {
    let updatedContent = this.tasksContent
    let completedCount = 0

    for (const taskId of taskIds) {
      const taskPattern = new RegExp(
        `- \\[ \\] (\\*\\*${taskId}\\*\\* 🔴.*?)\\n((?:  - .*\\n)*?)`,
        'g'
      )

      const match = taskPattern.exec(updatedContent)
      if (match) {
        const taskHeader = match[1]
        const taskDetails = match[2]

        // Add completion marker and notes
        const completionNote = notes ? `\n  - **COMPLETED**: ${notes}` : ''
        const newTask = `- [x] ${taskHeader} ✅${taskDetails}${completionNote}\n`

        updatedContent = updatedContent.replace(match[0], newTask)
        completedCount++
        console.log(`✅ Marked ${taskId} as complete`)
      } else {
        console.log(`⚠️  Task ${taskId} not found or already completed`)
      }
    }

    if (completedCount > 0) {
      fs.writeFileSync(TASKS_FILE, updatedContent)
      console.log(`\n🎉 Successfully updated ${completedCount} task(s)`)
    }

    return completedCount
  }

  /**
   * Get current status of all tasks
   */
  getStatus() {
    const lines = this.tasksContent.split('\n')
    const taskLines = lines.filter(line =>
      line.match(/- \[(x| )\] \*\*T\d+\*\*/)
    )

    const completed = taskLines.filter(line => line.includes('- [x]')).length
    const total = taskLines.length
    const remaining = total - completed

    console.log('\n📊 FitBox Project Status:')
    console.log(`   Total tasks: ${total}`)
    console.log(`   Completed: ${completed} ✅`)
    console.log(`   Remaining: ${remaining} 📋`)
    console.log(`   Progress: ${Math.round((completed / total) * 100)}%`)

    return { completed, total, remaining }
  }

  /**
   * Get next incomplete tasks
   */
  getNextTasks(limit = 5) {
    const lines = this.tasksContent.split('\n')
    const nextTasks = []

    for (let i = 0; i < lines.length && nextTasks.length < limit; i++) {
      const line = lines[i]
      if (line.match(/- \[ \] \*\*T\d+\*\*/)) {
        const taskMatch = line.match(/\*\*(T\d+)\*\* 🔴 (.*)/)
        if (taskMatch) {
          nextTasks.push({
            id: taskMatch[1],
            title: taskMatch[2],
            line: i + 1,
          })
        }
      }
    }

    console.log('\n🚀 Next Tasks to Complete:')
    nextTasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.id}: ${task.title}`)
    })

    return nextTasks
  }

  /**
   * Generate summary of completed work
   */
  generateSummary() {
    const phases = {
      'Setup & Configuration': [],
      'Database Setup & Core Models': [],
      'Basic Authentication': [],
      'Essential API Endpoints': [],
      'Essential UI': [],
    }

    const lines = this.tasksContent.split('\n')
    let currentPhase = ''

    for (const line of lines) {
      // Detect phase headers
      if (line.includes('### ')) {
        const phaseMatch = line.match(/### (.*?) \(/)
        if (phaseMatch) {
          currentPhase = phaseMatch[1]
        }
      }

      // Collect completed tasks
      if (
        line.match(/- \[x\] \*\*T\d+\*\*/) &&
        currentPhase &&
        phases[currentPhase]
      ) {
        const taskMatch = line.match(/\*\*(T\d+)\*\* 🔴 (.*?) ✅/)
        if (taskMatch) {
          phases[currentPhase].push({
            id: taskMatch[1],
            title: taskMatch[2],
          })
        }
      }
    }

    console.log('\n📈 Completion Summary by Phase:')
    for (const [phase, tasks] of Object.entries(phases)) {
      if (tasks.length > 0) {
        console.log(`\n   ${phase} (${tasks.length} completed):`)
        tasks.forEach(task => {
          console.log(`     ✅ ${task.id}: ${task.title}`)
        })
      }
    }

    return phases
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const taskManager = new TaskManager()

  switch (command) {
    case 'complete': {
      const taskIds = args.slice(1).filter(arg => arg.startsWith('T'))
      const notes =
        args.find(arg => !arg.startsWith('T') && arg !== 'complete') || ''

      if (taskIds.length === 0) {
        console.log('❌ Please provide task IDs to complete (e.g., T015 T016)')
        process.exit(1)
      }

      taskManager.completeTasks(taskIds, notes)
      break
    }

    case 'status':
      taskManager.getStatus()
      break

    case 'next': {
      const limit = parseInt(args[1]) || 5
      taskManager.getNextTasks(limit)
      break
    }

    case 'summary':
      taskManager.generateSummary()
      break

    default:
      console.log(`
🔧 FitBox Task Manager

Usage:
  ./scripts/task-manager.js complete T015 T016 "Enhanced security"
  ./scripts/task-manager.js status
  ./scripts/task-manager.js next [count]
  ./scripts/task-manager.js summary

Commands:
  complete  Mark tasks as complete with optional notes
  status    Show overall project progress
  next      Show next incomplete tasks (default: 5)
  summary   Generate completion summary by phase

Examples:
  ./scripts/task-manager.js complete T015 T016 T017
  ./scripts/task-manager.js complete T020 "API endpoints implemented"
  ./scripts/task-manager.js next 3
      `)
  }
}

if (require.main === module) {
  main()
}

module.exports = TaskManager
