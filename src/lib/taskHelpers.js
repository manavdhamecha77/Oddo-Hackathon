import { prisma } from './prisma';

// Task CRUD operations
export async function createTask(data) {
  const { projectId, title, description, assignedTo, priority, dueDate, estimatedHours, createdBy } = data;
  
  return await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      status: 'new',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours,
      createdBy,
    },
    include: {
      assignedUser: {
        select: { id: true, email: true, firstName: true, lastName: true }
      },
      project: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function getTaskById(taskId) {
  return await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUser: {
        select: { id: true, email: true, firstName: true, lastName: true }
      },
      project: {
        select: { id: true, name: true }
      },
      comments: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      attachments: true,
      timesheets: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        }
      }
    }
  });
}

export async function getTasksByProject(projectId) {
  return await prisma.task.findMany({
    where: { projectId },
    include: {
      assignedUser: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTasksByUser(userId) {
  return await prisma.task.findMany({
    where: { assignedTo: userId },
    include: {
      project: {
        select: { id: true, name: true }
      }
    },
    orderBy: { dueDate: 'asc' }
  });
}

export async function updateTask(taskId, data) {
  const updateData = {};
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
  if (data.blockerReason !== undefined) updateData.blockerReason = data.blockerReason;

  return await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignedUser: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });
}

export async function deleteTask(taskId) {
  return await prisma.task.delete({
    where: { id: taskId }
  });
}

// Task Comments
export async function addTaskComment(taskId, userId, comment) {
  return await prisma.taskComment.create({
    data: {
      taskId,
      userId,
      comment
    },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    }
  });
}

export async function getTaskComments(taskId) {
  return await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Task Attachments
export async function addTaskAttachment(taskId, fileName, filePath, fileSize, uploadedBy) {
  return await prisma.taskAttachment.create({
    data: {
      taskId,
      fileName,
      filePath,
      fileSize,
      uploadedBy
    }
  });
}

export async function getTaskAttachments(taskId) {
  return await prisma.taskAttachment.findMany({
    where: { taskId },
    orderBy: { uploadedAt: 'desc' }
  });
}

// Timesheet / Hour Logging
export async function logTaskHours(data) {
  const { taskId, userId, projectId, workDate, hours, isBillable, hourlyRate, description } = data;
  
  const timesheet = await prisma.timesheet.create({
    data: {
      taskId,
      userId,
      projectId,
      workDate: new Date(workDate),
      hours,
      isBillable: isBillable !== undefined ? isBillable : true,
      hourlyRate,
      description
    }
  });

  // Update task actual hours
  await prisma.task.update({
    where: { id: taskId },
    data: {
      actualHours: {
        increment: hours
      }
    }
  });

  return timesheet;
}

export async function getTaskTimesheets(taskId) {
  return await prisma.timesheet.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true }
      }
    },
    orderBy: { workDate: 'desc' }
  });
}
