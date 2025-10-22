import { metricUrlBase as restApiEndpoint } from '../support/api';
import { MetricPoint } from '../support/types';

const testCases = [
    { metric: 'download', expectedPoints: Array.from({ length: 12 }, (_, i) => 50 + i * 3) },
    { metric: 'upload', expectedPoints: Array.from({ length: 12 }, (_, i) => 20 + i * 2) },
    { metric: 'latency', expectedPoints: Array.from({ length: 12 }, (_, i) => 30 + (i % 5)) },
];

describe('REST API Testing', () => {
    testCases.forEach(({ metric, expectedPoints }) => {
        it(`should fetch ${metric} data successfully`, () => {
            cy.request(`${restApiEndpoint}${metric}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.metric).to.equal(metric);
                expect(response.body.description).to.equal(`<b>${metric}</b> metric`);
                (response.body.points as MetricPoint[]).forEach((point, i) => {
                    expect(point.t).to.equal(i);
                    expect(point.v).to.equal(expectedPoints[i]);
                });
            });
        });
    });

    it('should return 400 for invalid metric', () => {
        cy.request({
            url: `${restApiEndpoint}invalidMetric`,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.equal('Invalid metric');
        });
    });
});

describe('GraphQL API Testing', () => {
    const requestOptions = (metric: string) => ({
        method: 'POST',
        url: '/graphql',
        body: {
            query: `query($m:String!){ kpi(metric:$m){ t v } }`,
            variables: { m: metric },
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });

    testCases.forEach(({ metric, expectedPoints }) => {
        it(`should fetch ${metric} data successfully`, () => {
            cy.request(requestOptions(metric)).then((response) => {
                expect(response.status).to.eq(200);
                (response.body.data.kpi as MetricPoint[]).forEach((point, i) => {
                    expect(point.t).to.equal(i);
                    expect(point.v).to.equal(expectedPoints[i]);
                });
            });
        });
    });

    it('should return error for invalid metric', () => {
        cy.request(requestOptions('invalidMetric')).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.errors[0].message).to.equal('Invalid metric');
        });
    });
});
