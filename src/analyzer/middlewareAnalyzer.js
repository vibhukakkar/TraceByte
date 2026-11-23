
const fs = require("fs");
const path = require("path");
const { getFiles, parseFile } = require("../scanner/routeScanner");
const traverse = require("@babel/traverse").default;

function analyzeMiddleware(routes, directory) {
    const files = getFiles(path.resolve(directory));
    const definitions = new Map();

    // Step 1: Find middleware function definitions
    for (const file of files) {
        const ast = parseFile(file);
        if (!ast) continue;

        traverse(ast, {
            FunctionDeclaration(p) {
                const name = p.node.id?.name;

                if (name) {
                    definitions.set(name, {
                        file,
                        start: p.node.start,
                        end: p.node.end
                    });
                }
            },

            VariableDeclarator(p) {
                const name = p.node.id?.name;
                const init = p.node.init;

                if (
                    name &&
                    init &&
                    ["ArrowFunctionExpression", "FunctionExpression"].includes(
                        init.type
                    )
                ) {
                    definitions.set(name, {
                        file,
                        start: init.start,
                        end: init.end
                    });
                }
            }
        });
    }

    // Step 2: Identify middleware used in routes
    const usedNames = new Set();

    for (const route of routes) {
        // The final handler is treated as the route controller.
        route.handlers.slice(0, -1).forEach(name => {
            if (name && name !== "unknown") {
                usedNames.add(name);
            }
        });
    }

    // Step 3: Analyze middleware implementations
    const report = [];

    for (const name of usedNames) {
        const definition = definitions.get(name);

        if (!definition) {
            report.push({
                name,
                found: false,
                file: null,
                authentication: "Unknown",
                authorization: "Unknown",
                validation: "Unknown",
                callsNext: "Unknown"
            });

            continue;
        }

        const code = fs.readFileSync(definition.file, "utf8")
            .slice(definition.start, definition.end);

        const authenticationDetected =
            /\bauthorization\b|\bbearer\b|\btoken\b|\bjwt\b|\breq\.user\b|\bauthenticate\b/i.test(code);

        const authorizationDetected =
            /\brole(s)?\b|\bpermission(s)?\b|\bisAdmin\b|\bauthorize\b|\bhasRole\b|\bhasPermission\b|req\.user\.(role|permissions)/i.test(code);

        const validationDetected =
            /\bvalidate\b|\bschema\b|\bjoi\b|\bzod\b|\bbody\s*\(|\bcheck\s*\(/i.test(code);

        const callsNextDetected =
            /\bnext\s*\(/.test(code);

        report.push({
            name,
            found: true,
            file: definition.file,

            authentication: authenticationDetected
                ? "Possible check detected"
                : "No obvious check detected",

            authorization: authorizationDetected
                ? "Possible check detected"
                : "No obvious check detected",

            validation: validationDetected
                ? "Possible validation detected"
                : "No obvious validation detected",

            callsNext: callsNextDetected
                ? "Detected"
                : "Not detected"
        });
    }

    return report;
}

module.exports = { analyzeMiddleware };
