const { sendResponse } = require("../response");
const { validateToken } = require("../middleware/auth");
const { DynamoDBClient, ReturnValue } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const middy = require("@middy/core");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const baseHandler= async (event) => {
  const noteId = event.queryStringParameters?.noteId;

  if (!noteId) {
    return sendResponse(400, {message: "NoteId not Provided or undefined"})
  }

  const note = await db.send(
    new GetCommand({
      TableName: "users-dbb",
      Key: {
        PK: `USER#${event.userId}`,
        SK: `NOTE#${noteId}`
      }
    })
  )

  if (!note.Item) {
    return sendResponse(404, {success: false, Message: "Note not found"})
  };

  const updateAttributes = {
    ...JSON.parse(event.body),
    LastEditedAt: new Date().toISOString()
  }

  const updateExpression = "SET " + Object.keys(updateAttributes)
  .map((attribute) => `#${attribute} = :${attribute}`)
  .join(",");

  const expressionAttributeValues = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
    values[`:${attributeName}`] = updateAttributes[attributeName];
    return values;
    },
    {}
  );

  const expressionAttributeNames = Object.keys(updateAttributes).reduce(
			(names, attributeName) => {
				names[`#${attributeName}`] = attributeName;
				return names;
			},
			{}
		);

    const updatedNote = await db.send(
      new UpdateCommand({
        TableName: "users-dbb",
        Key: {
          PK: `USER#${event.userId}`,
          SK: `NOTE#${noteId}`
        },
        ReturnValues: "ALL_NEW",
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
        })
        
      );

      return sendResponse(200, {success: true, updatedNote })
};

module.exports.handler = middy(baseHandler).use(validateToken);
