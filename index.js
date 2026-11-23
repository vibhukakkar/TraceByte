
const { scanRoutes } = require("./src/scanner/routeScanner");
const { analyzeMiddleware } = require("./src/analyzer/middlewareAnalyzer");
const { generatePayload } = require("./src/generator/payloadGenerator");
const { runRequests } = require("./src/runner/requestRunner");

module.exports = {
    scanRoutes,
    analyzeMiddleware,
    generatePayload,
    runRequests
};
