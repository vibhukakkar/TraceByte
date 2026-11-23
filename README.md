
# TraceByte

### Trace every middleware. Test every route.

TraceByte is a Node.js-based tool designed to simplify Express.js API testing and middleware analysis.

It automatically detects API routes, analyzes middleware, generates sample request data, and tests APIs by sending HTTP requests.

## Features

- **Automatic Route Detection:** Finds GET, POST, PUT, PATCH and DELETE routes.
- **Middleware Analysis:** Identifies middleware functions used in API routes.
- **Authentication Detection:** Detects possible authentication checks.
- **Authorization Detection:** Identifies possible role and permission checks.
- **Validation Detection:** Detects common request validation patterns.
- **Automatic Payload Generation:** Generates sample request parameters and body data.
- **API Testing:** Sends HTTP requests to a running Express server.
- **Custom Headers:** Supports authorization tokens and other request headers.
- **Performance Tracking:** Measures API response time.
- **Test Reports:** Displays HTTP status codes and PASS/FAIL results.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Babel Parser
- Babel Traverse

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <your-repository-url>
cd tracebyte
npm install
```

## Usage

### Scan API Routes

```bash
node src/cli.js scan examples/sample-api
```

### Test API Routes

Start the sample server:

```bash
cd examples/sample-api
node server.js
```

Open another terminal and run:

```bash
node src/cli.js test examples/sample-api --url http://localhost:3000
```

### Test with Custom Headers

```bash
node src/cli.js test examples/sample-api --url http://localhost:3000 --header "Authorization=Bearer test-token"
```

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
├── index.js
├── package.json
└── README.md
```

## Future Improvements

- Advanced middleware tracing.
- Automated authorization testing.
- Smarter payload generation.
- HTML and JSON test reports.
- Support for more Express.js routing patterns.

## About

TraceByte is developed as an Advanced Programming project to make Express.js API testing and middleware analysis easier.
