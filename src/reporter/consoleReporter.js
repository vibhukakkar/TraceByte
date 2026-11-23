
function showRouteReport(routes, middleware) {
    console.log("\n================================");
    console.log("       TRACEBYTE SCAN REPORT");
    console.log("================================\n");

    if (routes.length === 0) {
        console.log("No Express routes detected.");
        return;
    }

    routes.forEach((route, index) => {
        console.log(
            `${index + 1}. ${route.method} ${route.path}`
        );
        console.log(`   Handlers: ${route.handlers.join(", ")}`);
        console.log(`   File: ${route.file}\n`);
    });

    console.log(`Total routes detected: ${routes.length}`);

    console.log("\n---------- MIDDLEWARE ANALYSIS ----------\n");

    if (middleware.length === 0) {
        console.log("No named middleware detected.");
        return;
    }

    middleware.forEach(item => {
        console.log(`${item.name}`);

        if (!item.found) {
            console.log("  Implementation: Not found");
            console.log("  Analysis: Unable to inspect\n");
            return;
        }

        console.log(`  File: ${item.file}`);
        console.log(`  Authentication: ${item.authentication}`);
        console.log(`  Authorization: ${item.authorization}`);
        console.log(`  Validation: ${item.validation}`);
        console.log(`  next(): ${item.callsNext}\n`);
    });
}

function showTestReport(results) {
    console.log("\n================================");
    console.log("       TRACEBYTE TEST REPORT");
    console.log("================================\n");

    let passed = 0;
    let failed = 0;

    results.forEach((result, index) => {
        const status = result.success ? "PASS" : "FAIL";

        if (result.success) passed++;
        else failed++;

        console.log(
            `${index + 1}. ${result.method} ${result.path} - ${status}`
        );
        console.log(`   Status: ${result.status}`);
        console.log(`   Time: ${result.duration} ms`);
        console.log(`   Response: ${result.response}\n`);
    });

    console.log("--------------------------------");
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
}

module.exports = { showRouteReport, showTestReport };
