module.exports = {
    log: jest.fn(),
    bindings: {
        entries: [
            {
                PartitionKey: 'Kim Kardashian',
                RowKey: 'kim@kardashian.com',
                Location: 'United States',
                MatchedOn: '08/2021'
            },
            {
                PartitionKey: 'Kourtney Kardashian',
                RowKey: 'kourtney@kardashian.com',
                Location: 'Denmark',
                MatchedOn: '08/2021'
            },
            {
                PartitionKey: 'Khloe Kardashian',
                RowKey: 'khloe@kardashian.com',
                Location: 'Japan',
                MatchedOn: '08/2021'
            },
            {
                PartitionKey: 'Rob Kardashian',
                RowKey: 'rob@kardashian.com',
                Location: 'Greece',
                MatchedOn: '08/2021'
            }
        ],
        history: [
            {
                PartitionKey: 'kim@kardashian.comkhloe@kardashian.com',
                RowKey: 'khloe@kardashian.comkim@kardashian.com'
            }
        ]
    }
};