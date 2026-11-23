
function generatePayload(route) {
    const params = {};

    const matches = route.path.match(/:[A-Za-z0-9_]+/g) || [];

    for (const param of matches) {
        params[param.slice(1)] = "1";
    }

    let body;

    if (["POST", "PUT", "PATCH"].includes(route.method)) {
        body = {
            name: "TraceByte Test User",
            email: "tracebyte-test@example.com",
            title: "Sample test data"
        };
    }

    return { params, body };
}

function buildTestUrl(route, baseUrl) {
    const payload = generatePayload(route);

    let routePath = route.path.replace(
        /:([A-Za-z0-9_]+)/g,
        (_, name) => encodeURIComponent(payload.params[name])
    );

    return `${baseUrl.replace(/\/$/, "")}/${routePath.replace(/^\//, "")}`;
}

module.exports = { generatePayload, buildTestUrl };
