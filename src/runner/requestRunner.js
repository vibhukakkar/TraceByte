
const { generatePayload, buildTestUrl } = require("../generator/payloadGenerator");

async function runRequests(routes, baseUrl, customHeaders = {}) {
    const results = [];

    for (const route of routes) {
        const payload = generatePayload(route);
        const url = buildTestUrl(route, baseUrl);

        const options = {
            method: route.method,
            headers: {
                "Content-Type": "application/json",
                ...customHeaders
            }
        };

        if (payload.body) {
            options.body = JSON.stringify(payload.body);
        }

        const start = Date.now();

        try {
            const response = await fetch(url, options);
            const responseText = await response.text();

            results.push({
                method: route.method,
                path: route.path,
                status: response.status,
                success: response.ok,
                duration: Date.now() - start,
                response: responseText.slice(0, 500)
            });

        } catch (error) {
            results.push({
                method: route.method,
                path: route.path,
                status: "ERROR",
                success: false,
                duration: Date.now() - start,
                response: error.message
            });
        }
    }

    return results;
}

module.exports = { runRequests };
