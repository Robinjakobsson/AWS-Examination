const { sendResponse } = require("../response");
const { validateToken } = require("../middleware/auth");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const middy = require("@middy/core");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

baseHandler = async (event) => {
  try {

    const userId = event.userId;

    const notes = await db.send(
      new QueryCommand({
        TableName: "users-dbb",
        KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
        ExpressionAttributeValues: {
        ":PK": `USER#${userId}`,
        ":SK": "NOTE#"
    }
  })
);

return sendResponse(200, notes.Items);


  } catch (err) {
    console.error("CATCHBLOCK")
    console.error(err)
    return sendResponse(500, {success: false, err})
  }
  
};


module.exports.handler = middy(baseHandler).use(validateToken);