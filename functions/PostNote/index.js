const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { sendResponse } = require("../response");
const { v4: uuid } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const baseHandler = async (event) => {
  try {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  const {title, content} = JSON.parse(event.body)
  const userId = event.userId;
    if (!title || !content) {
      return sendResponse(400, {message: "Please provide title and content"});
    }

    const noteId = uuid();
    

    await db.send(
      new PutCommand({
        TableName: "users-dbb",
        Item: {
          PK: `USER#${userId}`,
          SK: `NOTE#${noteId}`,
          title,
          content,
          noteId,
          userId,
          createdAt: new Date().toISOString()
        }
      })
    );

    return sendResponse (200, {success: true, noteId, userId})

    

  } catch (err) {
    console.error(err)
    return sendResponse(500, {success: false})

  }
};

module.exports.handler = middy(baseHandler).use(validateToken);
