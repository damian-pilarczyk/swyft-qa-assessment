import { api } from '../support/api';
import { el } from '../support/selectors';
import { text } from '../support/texts';

describe('KPI Dashboard', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('renders and switches metric', () => {
        cy.get('h1').contains(text.dashboardTitle);
        cy.get(el.metricSelect).should('have.value', 'download');
        cy.get(el.chart).should('be.visible');
        cy.get(el.chart).then((initCanvas) => {
            const initialCanvas = (initCanvas[0] as HTMLCanvasElement).toDataURL();
            cy.selectMetricType('Latency');
            cy.get(el.chart).then((canvas) => {
                const newCanvas = (canvas[0] as HTMLCanvasElement).toDataURL();
                expect(newCanvas).to.not.eq(initialCanvas);
            });
        });
    });

    it('handles API failures gracefully', () => {
        let count = 0;
        cy.intercept(api.getLatencyMetrics.url, (req) => {
            count++;
            if (count < 2) {
                req.reply({
                    statusCode: 500,
                    body: { error: 'Internal Server Error (mocked)' },
                });
            } else {
                req.continue();
            }
        }).as(api.getLatencyMetrics.name);
        cy.selectMetricType('Latency');
        cy.get(api.getLatencyMetrics.alias).its('response.statusCode').should('eq', 500);
        cy.get(api.getLatencyMetrics.alias).its('response.statusCode').should('eq', 200);
        cy.wrap(null).then(() => {
            expect(count).to.eq(2);
        });
    });

    it('prevents XSS attacks', () => {
        const xssString = '<div data-cy="xss">XSS</div>';
        const endPoint = {
            url: new RegExp(`/api/metrics`),
            name: 'getMetrics',
            alias: '@getMetrics',
        };
        cy.intercept(endPoint.url).as(endPoint.name);
        cy.get(`${el.metricSelect} option[value="latency"]`).then(($option) => {
            ($option[0] as HTMLOptionElement).value = xssString;
        });
        cy.selectMetricType('Latency');
        cy.wait(endPoint.alias);
        cy.shouldPoll('[data-cy="xss"]', ['not.exist']);
    });
});
