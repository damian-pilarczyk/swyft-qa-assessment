import { el } from './selectors';
import { MetricType } from './types';

Cypress.Commands.add('selectMetricType', (metricType: MetricType) => {
    cy.get(el.metricSelect).select(metricType);
});

Cypress.Commands.add(
    'shouldPoll',
    (selector: string, matcher: string[], times = 10, interval = 50) => {
        cy.get(selector, { timeout: 10 }).should(matcher[0], ...matcher.slice(1));
        if (times > 1) {
            cy.wait(interval).then(() => cy.shouldPoll(selector, matcher, times - 1, interval));
        }
    },
);
