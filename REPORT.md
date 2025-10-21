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
