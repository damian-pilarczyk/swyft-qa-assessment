export function movingAverage(series: number[], window: number): number[] {
    if (window <= 0) {
        throw new Error('Window size must be positive');
    }
    if (series.some((x) => Number.isNaN(x))) {
        throw new Error('Series contains NaN');
    }

    const averages: number[] = [];
    series.forEach((_, i) => {
        const windowSlice = series.slice(Math.max(0, i - window + 1), i + 1);
        const sum = windowSlice.reduce((acc, val) => acc + val, 0);
        averages.push(sum / windowSlice.length);
    });

    return averages;
}
