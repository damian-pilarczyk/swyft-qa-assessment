/// <reference types="cypress" />
import { MetricType } from './types';

declare global {
    namespace Cypress {
        interface Chainable {
            selectMetricType(metricType: MetricType): Chainable;
            shouldPoll(
                selector: string,
                matcher: string[],
                times?: number,
                interval?: number,
            ): Chainable<void>;
        }
    }
}
