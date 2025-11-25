exports.sendResponse = (code, response) => ({
	statusCode: code,
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(response),
});
