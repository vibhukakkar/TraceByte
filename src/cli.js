#!/usr/bin/env node
const { scanRoutes } = require("./scanner/routeScanner");
const { analyzeMiddleware } = require("./analyzer/middlewareAnalyzer");
const { runRequests } = require("./runner/requestRunner");
const {
    showRouteReport,
    showTestReport
} = require("./reporter/consoleReporter");

// Parse custom headers
function parseHeaders(args) {
    const headers = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--header") {
            const headerValue = args[i + 1];

            if (!headerValue || !headerValue.includes("=")) {
                throw new Error(
                    'Invalid header format. Use --header "Key=Value"'
                );
            }

            const separatorIndex = headerValue.indexOf("=");

            const key = headerValue.slice(0, separatorIndex).trim();
            const value = headerValue.slice(separatorIndex + 1).trim();

            if (!key || !value) {
                throw new Error("Header name and value cannot be empty.");
            }

            headers[key] = value;
            i++;
        }
    }

    return headers;
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === "help") {
        console.log(`
TraceByte - Intelligent Express API Testing

Usage:
  tracebyte scan <directory>
  tracebyte test <directory> --url <base-url> [--header "Key=Value"]

Commands:
  scan    Discover routes and analyze middleware
  test    Send generated requests to your API
  help    Show this help message

Options:
  --url       Base URL of your local API
  --header    Add a custom request header (repeatable)
        `);
        return;
    }

    const directory = args[1] || ".";

    try {
        const routes = scanRoutes(directory);
        const middleware = analyzeMiddleware(routes, directory);

        if (command === "scan") {
            showRouteReport(routes, middleware);
            return;
        }

        if (command === "test") {
            const urlIndex = args.indexOf("--url");

            if (urlIndex === -1 || !args[urlIndex + 1]) {
                throw new Error("Please provide a base URL using --url");
            }

            const baseUrl = args[urlIndex + 1];
            const parsedUrl = new URL(baseUrl);

            if (
                !["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname)
            ) {
                throw new Error(
                    "For this MVP, TraceByte only sends test requests to localhost."
                );
            }

            const customHeaders = parseHeaders(args);

            const results = await runRequests(
                routes,
                baseUrl,
                customHeaders
            );

            showTestReport(results);
            return;
        }

        throw new Error(`Unknown command: ${command}`);

    } catch (error) {
        console.error(`TraceByte error: ${error.message}`);
        process.exitCode = 1;
    }
}

main();
