module.exports = {
    log: jest.fn(),
    bindings: {
        entries: [
            {
                PartitionKey: 'Kim Kardashian',
                RowKey: 'kim@kardashian.com',
                Location: 'United States'
            },
            {
                PartitionKey: 'Kourtney Kardashian',
                RowKey: 'kourtney@kardashian.com',
                Location: 'Denmark'
            },
            {
                PartitionKey: 'Khloe Kardashian',
                RowKey: 'khloe@kardashian.com',
                Location: 'Japan'
            },
            {
                PartitionKey: 'Rob Kardashian',
                RowKey: 'rob@kardashian.com',
                Location: 'Greece'
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