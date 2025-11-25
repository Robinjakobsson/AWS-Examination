const { sendResponse } = require("../response");
const { validateToken } = require("../middleware/auth");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const middy = require("@middy/core");
const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const baseHandler = async (event) => {
  const { noteId } = JSON.parse(event.body);

  if (!noteId) {
    return sendResponse(400, {message: "noteId not provided!"})
  }

  const userId = event.userId

  const note = await db.send(
    new DeleteCommand({
      TableName: "users-dbb",
      Key: {
        PK: `USER#${userId}`,
        SK: `NOTE#${noteId}`
      }
    })
  )

  return sendResponse(200, {success: true})
  
};

module.exports.handler = middy(baseHandler).use(validateToken);
