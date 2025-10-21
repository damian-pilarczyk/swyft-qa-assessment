import { describe, expect, test } from '@jest/globals';
import { movingAverage } from './metrics';

describe('movingAverage', () => {
    describe('correctness tests', () => {
        const testCases = [
            {
                name: 'basic window average',
                input: [2, 4, 6, 8],
                window: 2,
                expected: [2, 3, 5, 7],
            },
            {
                name: 'negative numbers',
                input: [-1, -2, -3, -4, -5],
                window: 4,
                expected: [-1, -1.5, -2, -2.5, -3.5],
            },
            {
                name: 'mixed numbers',
                input: [-1, 3, 5, 0, 0],
                window: 2,
                expected: [-1, 1, 4, 2.5, 0],
            },
            {
                name: 'zeroes',
                input: [0, 0, 0, 0, 0],
                window: 3,
                expected: [0, 0, 0, 0, 0],
            },
            {
                name: 'window size larger than data length',
                input: [1, 2, 3],
                window: 5,
                expected: [1, 1.5, 2],
            },
            {
                name: 'window size of 1',
                input: [5, 10, 15],
                window: 1,
                expected: [5, 10, 15],
            },
            {
                name: 'window size of array size',
                input: [5, 10, 15],
                window: 3,
                expected: [5, 7.5, 10],
            },
            {
                name: 'empty array returns empty array',
                input: [],
                window: 3,
                expected: [],
            },
            {
                name: 'single element array',
                input: [42],
                window: 1,
                expected: [42],
            },
        ];

        testCases.forEach(({ name, input, window, expected }) => {
            test(name, () => {
                expect(movingAverage(input, window)).toEqual(expected);
            });
        });
    });

    describe('error handling tests', () => {
        const testCases = [
            {
                name: 'throws error for NaN in series',
                input: [1, 2, NaN],
                window: 2,
                errorMessage: 'Series contains NaN',
            },
            {
                name: 'throws error for non-positive window size (zero)',
                input: [1, 2, 3],
                window: 0,
                errorMessage: 'Window size must be positive',
            },
            {
                name: 'throws error for non-positive window size (negative)',
                input: [1, 2, 3],
                window: -2,
                errorMessage: 'Window size must be positive',
            },
        ];

        testCases.forEach(({ input, window, errorMessage }) => {
            test(`throws error for invalid input: ${errorMessage}`, () => {
                expect(() => movingAverage(input, window)).toThrow(errorMessage);
            });
        });
    });
});
