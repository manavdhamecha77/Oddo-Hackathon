import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const useProjectTour = (projectName, isReady = true) => {
  useEffect(() => {
    console.log('Tour hook - projectName:', projectName, 'isReady:', isReady)
    
    if (!isReady) {
      console.log('Tour not ready yet')
      return
    }

    // Check if tour has been shown before
    const tourKey = 'admin-project-tour-completed'
    const hasSeenTour = localStorage.getItem(tourKey)

    console.log('Tour check - hasSeenTour:', hasSeenTour)
    
    if (hasSeenTour) {
      console.log('Tour already completed, skipping')
      return
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log('Starting tour for project:', projectName)
      
      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: [
          {
            element: 'body',
            popover: {
              title: `Welcome to ${projectName}! 🎉`,
              description: 'Let me show you around the project dashboard. This tour will help you understand all the features available.',
              side: 'center',
              align: 'center'
            }
          },
          {
            element: '[data-tour="back-button"]',
            popover: {
              title: 'Back to Projects',
              description: 'Click here to return to the projects list whenever you need to.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="add-task-button"]',
            popover: {
              title: 'Add New Tasks',
              description: 'Create new tasks for your project team. You can assign priorities, set deadlines, and assign team members.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="revenue-card"]',
            popover: {
              title: 'Revenue Tracking',
              description: 'Monitor the total revenue generated from sales orders associated with this project.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="costs-card"]',
            popover: {
              title: 'Cost Management',
              description: 'Track all project costs including vendor bills and expenses.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="profit-card"]',
            popover: {
              title: 'Profit Analysis',
              description: 'See your project profitability at a glance. This is calculated as Revenue minus Costs.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="progress-card"]',
            popover: {
              title: 'Project Progress',
              description: 'Track overall project completion based on task status.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="links-panel"]',
            popover: {
              title: 'Quick Actions',
              description: 'Access sales orders, vendor bills, and other project-related features from here.',
              side: 'top',
              align: 'start'
            }
          },
          {
            element: '[data-tour="task-filter"]',
            popover: {
              title: 'Filter Tasks',
              description: 'Toggle between viewing all tasks or just the tasks assigned to you.',
              side: 'left',
              align: 'end'
            }
          },
          {
            element: '[data-tour="todo-column"]',
            popover: {
              title: 'To Do Column',
              description: 'New tasks start here. Drag and drop tasks between columns to update their status.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '[data-tour="inprogress-column"]',
            popover: {
              title: 'In Progress Column',
              description: 'Tasks currently being worked on. Team members can assign themselves to tasks.',
              side: 'right',
              align: 'start'
            }
          },
          {
            element: '[data-tour="review-column"]',
            popover: {
              title: 'Review Column',
              description: 'Tasks that are blocked or need review before completion.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="done-column"]',
            popover: {
              title: 'Done Column',
              description: 'Completed tasks. Great job on finishing these!',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: 'body',
            popover: {
              title: `All the best with ${projectName}! 🚀`,
              description: 'You\'re all set! Feel free to explore and manage your project. If you need to see this tour again, clear your browser\'s local storage.',
              side: 'center',
              align: 'center'
            }
          }
        ],
        onDestroyed: () => {
          // Mark tour as completed
          localStorage.setItem(tourKey, 'true')
        }
      })

      driverObj.drive()
    }, 500)

    return () => clearTimeout(timer)
  }, [projectName, isReady])
}
