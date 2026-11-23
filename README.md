# TraceByte

### Trace every middleware. Test every route.

[![npm version](https://img.shields.io/npm/v/tracebyte)](https://www.npmjs.com/package/tracebyte)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**TraceByte** is a Node.js CLI toolkit for Express.js API route discovery, middleware analysis, and local API testing.

It scans Express applications to discover routes, examines middleware patterns, generates sample request data, and executes HTTP requests against locally running APIs. It then reports response status, execution time, and test results.

## Features

- **Automatic Route Discovery:** Detects GET, POST, PUT, PATCH, and DELETE routes.
- **Middleware Analysis:** Identifies middleware functions associated with API routes.
- **Authentication Detection:** Recognizes common authentication-related patterns.
- **Authorization Detection:** Identifies possible role and permission checks.
- **Validation Detection:** Detects common request validation patterns.
- **Sample Data Generation:** Generates sample route parameters and request payloads.
- **Automated API Testing:** Sends HTTP requests to a running local Express API.
- **Custom Headers:** Supports authorization tokens and other HTTP headers.
- **Performance Tracking:** Measures API response time.
- **Test Reports:** Displays HTTP status codes and PASS/FAIL results.

## Installation

Install TraceByte globally using npm:

```bash
npm install -g tracebyte
```

Verify the installation:

```bash
tracebyte help
```

**Requirements:** Node.js 20 or later.

## Usage

### 1. Scan Express API Routes

Run the scanner against your Express project:

```bash
tracebyte scan ./path-to-your-project
```

This discovers supported API routes and analyzes their associated middleware patterns.

### 2. Test API Routes

Start your Express API server.

For example, run the included sample server:

```bash
cd examples/sample-api
node server.js
```

In another terminal, execute:

```bash
tracebyte test ./examples/sample-api --url http://localhost:3000
```

TraceByte sends generated requests and reports the results.

### 3. Test with Custom Headers

Pass custom headers when testing protected endpoints:

```bash
tracebyte test ./examples/sample-api --url http://localhost:3000 --header "Authorization=Bearer test-token"
```

### 4. Run Tests

To run the project's automated test suite:

```bash
npm test
```

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Babel Parser
- Babel Traverse
- Native Fetch API

## Project Structure

```text
tracebyte/
├── src/
│   ├── scanner/
│   ├── analyzer/
│   ├── generator/
│   ├── runner/
│   ├── reporter/
│   └── cli.js
├── examples/
│   └── sample-api/
├── test/
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## How It Works

1. **Scan:** Parses the Express application and discovers supported routes.
2. **Analyze:** Examines route handlers and middleware patterns.
3. **Generate:** Creates sample parameters and request payloads.
4. **Execute:** Sends HTTP requests to the running local API.
5. **Report:** Displays response status, execution time, and test results.

## Limitations

- Middleware and authentication detection are heuristic-based and may not identify every implementation.
- Route discovery supports common Express routing patterns; complex or dynamically constructed routes may not be detected.
- API testing is restricted to localhost addresses for safety.
- Generated request data may need customization for application-specific validation requirements.

TraceByte is intended as a developer testing and analysis aid, not a replacement for comprehensive security testing.

## Future Improvements

- More advanced middleware tracing.
- Improved authorization testing.
- Smarter payload generation.
- HTML and JSON test reports.
- Support for additional Express routing patterns.

## Author

**Vibhu Kakkar**

- GitHub: [@vibhukakkar](https://github.com/vibhukakkar)
- npm: [tracebyte](https://www.npmjs.com/package/tracebyte)

## License

This project is licensed under the ISC License.