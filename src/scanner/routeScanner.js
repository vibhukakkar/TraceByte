
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const METHODS = ["get", "post", "put", "patch", "delete"];

function getFiles(dir) {
    let files = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (
            entry.isDirectory() &&
            !["node_modules", ".git", "dist", "build"].includes(entry.name)
        ) {
            files.push(...getFiles(fullPath));
        } else if (entry.isFile() && /\.(js|cjs|mjs)$/.test(entry.name)) {
            files.push(fullPath);
        }
    }

    return files;
}

function parseFile(file) {
    try {
        return parser.parse(fs.readFileSync(file, "utf8"), {
            sourceType: "unambiguous",
            plugins: ["jsx", "typescript"]
        });
    } catch (error) {
        console.warn(`Skipping ${file}: ${error.message}`);
        return null;
    }
}

function resolveImport(source, file) {
    const base = path.resolve(path.dirname(file), source);
    const candidates = [
        base,
        `${base}.js`,
        `${base}.cjs`,
        `${base}.mjs`,
        path.join(base, "index.js")
    ];

    return candidates.find(candidate =>
        fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    );
}

function scanFile(file) {
    const ast = parseFile(file);
    if (!ast) return { routes: [], mounts: [] };

    const routes = [];
    const mounts = [];
    const imports = {};

    traverse(ast, {
        VariableDeclarator(p) {
            const { id, init } = p.node;

            if (
                id.type === "Identifier" &&
                init?.type === "CallExpression" &&
                init.callee.type === "Identifier" &&
                init.callee.name === "require" &&
                init.arguments[0]?.type === "StringLiteral"
            ) {
                imports[id.name] = init.arguments[0].value;
            }
        },

        CallExpression(p) {
            const { callee, arguments: args } = p.node;

            if (
                callee.type !== "MemberExpression" ||
                callee.computed ||
                callee.property.type !== "Identifier"
            ) return;

            const method = callee.property.name.toLowerCase();

            if (METHODS.includes(method)) {
                if (args[0]?.type !== "StringLiteral" || args.length < 2) {
                    return;
                }

                const handlers = args.slice(1).map(arg => {
                    if (arg.type === "Identifier") return arg.name;
                    if (arg.type === "CallExpression") {
                        return arg.callee.type === "Identifier"
                            ? `${arg.callee.name}()`
                            : "inline middleware";
                    }
                    if (
                        arg.type === "ArrowFunctionExpression" ||
                        arg.type === "FunctionExpression"
                    ) return "inline handler";

                    return "unknown";
                });

                routes.push({
                    method: method.toUpperCase(),
                    path: args[0].value,
                    handlers,
                    file
                });
            }

            if (
                method === "use" &&
                args[0]?.type === "StringLiteral" &&
                args[1]?.type === "Identifier"
            ) {
                const source = imports[args[1].name];
                if (!source) return;

                const targetFile = resolveImport(source, file);
                if (targetFile) {
                    mounts.push({
                        prefix: args[0].value,
                        targetFile
                    });
                }
            }
        }
    });

    return { routes, mounts };
}

function joinPaths(prefix, routePath) {
    const result = `/${prefix}/${routePath}`.replace(/\/+/g, "/");
    return result.length > 1 ? result.replace(/\/$/, "") : result;
}

function scanRoutes(directory) {
    const root = path.resolve(directory);

    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new Error(`Directory not found: ${root}`);
    }

    const files = getFiles(root);
    const results = new Map();

    for (const file of files) {
        results.set(file, scanFile(file));
    }

    const mounts = new Map();

    for (const result of results.values()) {
        for (const mount of result.mounts) {
            if (!mounts.has(mount.targetFile)) {
                mounts.set(mount.targetFile, []);
            }
            mounts.get(mount.targetFile).push(mount.prefix);
        }
    }

    const routes = [];

    for (const [file, result] of results) {
        const prefixes = mounts.get(file) || [""];

        for (const route of result.routes) {
            for (const prefix of prefixes) {
                routes.push({
                    ...route,
                    path: joinPaths(prefix, route.path)
                });
            }
        }
    }

    return routes;
}

module.exports = { scanRoutes, getFiles, parseFile };
