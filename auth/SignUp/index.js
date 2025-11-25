const { sendResponse } = require("../../functions/response");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, PutCommand,} = require("@aws-sdk/lib-dynamodb");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const {email, password} = JSON.parse(event.body)

    if (!email || !password) {
        return sendResponse(400, {message: "Email and password required!"})
    }

    const userId = uuid();

    const hashedPassword = await bcrypt.hash(password,10);


    await db.send(
        new PutCommand({
            TableName: "users-dbb",
            Item: {
                PK: `USER#${email}`,
                SK: "PROFILE",
                userId,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            },
        })
    );
    return sendResponse(200, {message: "User created", userId })
};
