const { error } = require("console");
const { after } = require("node:test");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../response");
const validateToken = {
    before: async (request) => {
        try {
            const token = request.event.headers.authorization.replace('Bearer ', '')

            if (!token ) {
                return sendResponse(401, {error: "Missing token"})
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            request.event.userId = decoded.userId

        } catch (err) {
            return sendResponse(401, { error: "Invalid token" });
        }
    },

    onerror: async (request) => {
        return sendResponse(500, { error: "Internal server error" });
    }
}

module.exports = { validateToken };