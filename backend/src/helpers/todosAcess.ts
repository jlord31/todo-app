import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
      private readonly todosClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {}
  
    async getAllForUser(userId: string): Promise<TodoItem[]> {
      logger.info('Getting all todos', {
        userId
      })
  
      const result = await this.todosClient
        .query({
          TableName: this.todosTable,
          IndexName: this.createdAtIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
  
      const items = result.Items
      return items as TodoItem[]
    }
  
    async getById(userId: string, todoId: string): Promise<TodoItem> {
      logger.info('Getting a todo by id', {
        userId,
        todoId
      })
  
      const result = await this.todosClient.get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()
  
      const item = result.Item
      return item as TodoItem
    }
  
    async create(todo: TodoItem) {
      await this.todosClient
        .put({
          TableName: this.todosTable,
          Item: todo
        })
        .promise()
    }
  
    async update(userId: string, todoId: string, todoUpdate: TodoUpdate) {
      await this.todosClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      }).promise()
    }
  
    async setAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
      await this.todosClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()
    }
  
    async delete(userId: string, todoId: string) {
      await this.todosClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
      }).promise()
    }
  }