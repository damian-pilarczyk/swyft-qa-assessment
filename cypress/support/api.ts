const name = (param: string) => `get${param}Metrics`;
const alias = (param: string) => `@${name(param)}`;
export const metricUrlBase = '/api/metrics?metric=';

export const api = {
    getLatencyMetrics: {
        name: name('Latency'),
        alias: alias('Latency'),
        url: `${metricUrlBase}latency`,
    },
    getDownloadMetrics: {
        name: name('Download'),
        alias: alias('Download'),
        url: `${metricUrlBase}download`,
    },
};
