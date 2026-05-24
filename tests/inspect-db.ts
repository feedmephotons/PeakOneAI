import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Inspecting Database ---')
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true, name: true }
  })
  console.log('Users:', users)

  const workspaces = await prisma.workspace.findMany({
    take: 10,
    select: { id: true, name: true, slug: true }
  })
  console.log('Workspaces:', workspaces)

  const projects = await prisma.project.findMany({
    take: 10,
    select: { id: true, name: true, workspaceId: true }
  })
  console.log('Projects:', projects)

  const tasksCount = await prisma.task.count()
  console.log('Total Tasks in DB:', tasksCount)
}

main()
  .catch(e => {
    console.error('Error inspecting database:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
