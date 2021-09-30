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

    await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    expect(context.res.body.pair).toBeTruthy();
});

test('Do not match pair if any of the members have already been matched in the past 9000 days', async () => {
    const request = {
        query: {
            freshness: 9000
        }
    };

    context.bindings.entries = [
        {
            PartitionKey: 'Kim Kardashian',
            RowKey: 'kim@kardashian.com',
            Location: 'United States',
            MatchedOn: '08/2021'
        },
        {
            PartitionKey: 'Khloe Kardashian',
            RowKey: 'khloe@kardashian.com',
            Location: 'Japan',
            MatchedOn: '08/2021'
        }
    ];

    await httpTrigger(context, request, context.bindings.history, context.bindings.entries);
    expect(context.res.status).toBe(417);

});