import httpTrigger from './index';
const context = require('../testing/defaultContext');

test('maxOffset should default to 240 minutes', async () => {
    const request = {
        query: {
            // not passing maxoffset as query parameter
            // should default to 240 minutes
        }
    };

    await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    expect(context.res.body.debug.maxOffset).toBe(240);
});

test('Check maxOffset is set via query parameter', async () => {
    const request = {
        query: {
            maxoffset: 123
        }
    };

    await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    expect(context.res.body.debug.maxOffset).toBe(123);
});

test('We should get a match for maxoffset 60 minutes', async () => {
    const request = {
        query: {
            maxoffset: 60
        }
    };

    while (context.res.body.pair.length !== 2) {
        await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    }
    expect(context.res.body.pair).toHaveLength(2);
    expect(context.res.body.pair).toEqual(expect.arrayContaining([
        {
            email: 'kourtney@kardashian.com',
            location: 'Denmark',
            name: 'Kourtney Kardashian'
        },
        {
            email: 'rob@kardashian.com',
            location: 'Greece',
            name: 'Rob Kardashian'
        }
    ]));
});

test('Do not match pair in history', async () => {
    const request = {
        query: {}
    };

    context.bindings.entries = [
        {
            PartitionKey: 'Kim Kardashian',
            RowKey: 'kim@kardashian.com',
            Location: 'United States'
        },
        {
            PartitionKey: 'Khloe Kardashian',
            RowKey: 'khloe@kardashian.com',
            Location: 'Japan'
        }
    ];

    await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    expect(context.res.body.pair).toHaveLength(0);
});