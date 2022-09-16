import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodosBusinessLogic')

const listsAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return listsAccess.getAllForUser(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const newTodo: TodoItem = {
    userId,
    todoId: uuid.v4(),
    ...createTodoRequest,
    done: false,
    createdAt: new Date().toISOString()
  }

  await listsAccess.create(newTodo)

  return newTodo
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  await checkIfExists(userId, todoId)

  logger.info('Updating todo', { updateTodoRequest })

  await listsAccess.update(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(userId: string, todoId: string) {
  await checkIfExists(userId, todoId)

  await listsAccess.delete(userId, todoId)
}

async function getById(userId: string, todoId: string): Promise<TodoItem> {
  const todo = await listsAccess.getById(userId, todoId)
  if (!todo) {
    throw createError(404, JSON.stringify({
      error: 'TODO not found'
    }))
  }

  return todo
}

async function checkIfExists(userId: string, todoId: string) {
  await getById(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  const todo = await getById(userId, todoId)

  const presignedUrl = attachmentUtils.getUploadUrl(todoId)

  if (!todo.attachmentUrl) {
    await listsAccess.setAttachmentUrl(userId, todoId, attachmentUtils.getDownloadUrl(todoId))
  }

  return presignedUrl
}
