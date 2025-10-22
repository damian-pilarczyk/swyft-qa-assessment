# REPORT

Use this file to briefly document what you did, what you skipped, and why.
Include notes for:

- E2E scenarios & flakiness controls
- API findings (incl. intermittent 500 root cause)
- Performance (Lighthouse) results & 1 improvement
- Security: XSS vector & mitigation
- SQL query reasoning
- Optional: AI feature test strategy

### Core A — E2E Testing (Cypress)

I've added prettier - I'm too used to it to work without it

I haven’t worked with canvas before, so for the purpose of the test I decided to simply check if its data URL changed.

I don’t know why time mocking was mentioned, maybe it’s a bait :D But I don’t see any use for cy.clock() here. I would have to somehow pass the time value in the request body (after setting it to an odd minute), which would require changing the server code (`const now = req.query.time ? new Date(req.query.time) : Date.now()`) – and I don’t see a reason to do that just for testing purposes.

In the case of the last test, it could be tricky to check whether an element that didn’t exist before still doesn’t exist. Unfortunately, waiting with `cy.wait(requestAlias)` is not sufficient, because rendering the element can take a few milliseconds after the request finishes – so `cy.get(xss).should("not.exist")` could give a false positive result. That’s why I decided to create the shouldPoll command with a safe timeout of 500ms (10 attempts every 50ms) - maybe it is a bit too safe.

### Core B — Unit & Integration (Jest + TypeScript)

I'm not exactly sure how such a moving average should work, but from the error descriptions I suppose it should work as follows:
window 3, array [1, 2, 3, 4, 5]
[1] -> 1
[1, 2] -> 1.5
[1, 2, 3] -> 2
[2, 3, 4] -> 3
[3, 4, 5] -> 4
so the result is [1, 1.5, 2, 3, 4]
I've also added tests for combinations of different positive, negative, and zero values that check the function against this logic.
I've also added tests checking error handling when the window is less or equal 0 or when NaN appears in the input array.

### Core C — API Testing

I added protection to server.js so that the server can only accept metric values 'download', 'upload' or 'latency'. This is also additional protection against XSS. I removed the if statement that returned 500 for 'upload' and odd minutes.
I also noticed that my changes caused a "Cannot read properties of null (reading 'kpi')" error appearing on the frontend - I fixed it by changing the if in fetchGraphQL from `if(!r.ok)` to `if(!r.ok || !j.data)` - r.ok returns true if the server is running and there's no schema error, regardless of whether an exception was thrown in the server code.
Regarding tests, I added 3 for REST and GraphQL checking each metric (with expected generated in the same way as request handlers) and one with an invalid metric name. Since REST API and GraphQL handle responses differently, the expects differ slightly.
