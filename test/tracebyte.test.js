
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const http = require("node:http");

const { scanRoutes } = require("../src/scanner/routeScanner");
const { analyzeMiddleware } = require("../src/analyzer/middlewareAnalyzer");

const {
    generatePayload,
    buildTestUrl
} = require("../src/generator/payloadGenerator");

const { runRequests } = require("../src/runner/requestRunner");

const sampleDirectory = path.resolve(__dirname, "../examples/sample-api");

// TEST 1: Route detection
test("Should detect all Express routes", () => {
    const routes = scanRoutes(sampleDirectory);

    assert.equal(routes.length, 4);

    assert.deepEqual(
        routes.map(route => route.method),
        ["GET", "POST", "PUT", "DELETE"]
    );
});

// TEST 2: Router prefix detection
test("Should detect mounted router paths", () => {
    const routes = scanRoutes(sampleDirectory);

    const paths = routes.map(route => route.path);

    assert.ok(paths.includes("/users"));
    assert.ok(paths.includes("/users/:id"));
});

// TEST 3: Middleware analysis
test("Should identify authentication middleware", () => {
    const routes = scanRoutes(sampleDirectory);

    const report = analyzeMiddleware(routes, sampleDirectory);

    const auth = report.find(
        item => item.name === "authMiddleware"
    );

    assert.ok(auth);
    assert.equal(auth.found, true);
    assert.equal(
        auth.authentication,
        "Possible check detected"
    );
    assert.equal(
        auth.authorization,
        "No obvious check detected"
    );
    assert.equal(auth.callsNext, "Detected");
});

// TEST 4: Payload generation
test("Should generate sample payload for POST requests", () => {
    const route = {
        method: "POST",
        path: "/users"
    };

    const payload = generatePayload(route);

    assert.ok(payload.body);
    assert.equal(payload.body.name, "TraceByte Test User");
    assert.equal(
        payload.body.email,
        "tracebyte-test@example.com"
    );
});

// TEST 5: Dynamic URL generation
test("Should replace route parameters in URL", () => {
    const route = {
        method: "GET",
        path: "/users/:id"
    };

    const url = buildTestUrl(
        route,
        "http://localhost:3000"
    );

    assert.equal(
        url,
        "http://localhost:3000/users/1"
    );
});

// TEST 6: Successful API request with custom headers
test("Should successfully send API requests with custom headers", async () => {
    const server = http.createServer((req, res) => {
        if (
            req.headers.authorization === "Bearer test-token"
        ) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                message: "Authorized"
            }));
        } else {
            res.writeHead(401);

            res.end(JSON.stringify({
                message: "Unauthorized"
            }));
        }
    });

    await new Promise(resolve => {
        server.listen(0, "127.0.0.1", resolve);
    });

    try {
        const port = server.address().port;

        const results = await runRequests(
            [{ method: "GET", path: "/users" }],
            `http://127.0.0.1:${port}`,
            {
                Authorization: "Bearer test-token"
            }
        );

        assert.equal(results[0].status, 200);
        assert.equal(results[0].success, true);

    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

// TEST 7: Unauthorized API request
test("Should detect unauthorized API requests", async () => {
    const server = http.createServer((req, res) => {
        res.writeHead(401);
        res.end("Unauthorized");
    });

    await new Promise(resolve => {
        server.listen(0, "127.0.0.1", resolve);
    });

    try {
        const port = server.address().port;

        const results = await runRequests(
            [{ method: "GET", path: "/users" }],
            `http://127.0.0.1:${port}`
        );

        assert.equal(results[0].status, 401);
        assert.equal(results[0].success, false);

    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
