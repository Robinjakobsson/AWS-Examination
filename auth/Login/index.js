const { sendResponse } = require("../../functions/response");
const bcrypt = require("bcryptjs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "hemlig_nyckel";
const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
exports.handler = async (event) => {
  
  const { email, password } = JSON.parse(event.body);
  try {
    if (!email || !password) {
      return  sendResponse(200, {message: "Email and password required"})
    }

    const user = await db.send(
      new QueryCommand({
        TableName: "users-dbb",
        IndexName: "emailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email }
  })
);
    if (!user.Items || user.Items.length === 0) {
    return sendResponse(401, { message: "Wrong email or password" });
    }

    const foundUser = user.Items[0];

    const isMatch = await bcrypt.compare(password, foundUser.password)
    if (!isMatch) {
      return sendResponse(401, {Message: "Wrong email or username"})
    }

    console.log("Found user:", foundUser);
    console.log("Signing JWT with userId:", foundUser.userId);

    const token = await jwt.sign({ userId: foundUser.userId}, JWT_SECRET, {expiresIn: "1h"})

    return sendResponse(200, {success: true, token})

    } catch (err) {
      console.error(err)
      return sendResponse(500, {message: "Internal server error"})
    }


};
