Getting duplicate documents with find() & mongodb native driver

I'm getting twice as many documents back as are in the collection. 6 instead of 3.

The query is

```js
const a = await find(DATA_COLLECTION_NAME, {
    description: { $regex: '^CHECK #', $options: 'im' }
  })
```

The expected result is

```js
{
    _id: 5e35d3a249eb6922e18fe70d,
    date: '2019-01-30T08:00:00.000Z',
    description: 'CHECK # 2439      SOMETHING PAYMENT',
    debit: -140,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a249eb6922e18fe70e,
    date: '2019-02-07T08:00:00.000Z',
    description: 'CHECK # 2441      SOMETHING  CHECKPAYMT',
    debit: -119.57,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a249eb6922e18fe70f,
    date: '2019-02-26T08:00:00.000Z',
    description: 'CHECK # 2442      SOMETHING  CHECKPAYMT',
    debit: -121.12,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
```

The actual result is:

```js
{
    _id: 5e35d3a249eb6922e18fe70d,
    date: '2019-01-30T08:00:00.000Z',
    description: 'CHECK # 2439      SOMETHING PAYMENT',
    debit: -140,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a206b6f822e08feab7,
    date: '2019-01-30T08:00:00.000Z',
    description: 'CHECK # 2439      SOMETHING PAYMENT',
    debit: -140,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a249eb6922e18fe70e,
    date: '2019-02-07T08:00:00.000Z',
    description: 'CHECK # 2441      SOMETHING  CHECKPAYMT',
    debit: -119.57,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a206b6f822e08feab8,
    date: '2019-02-07T08:00:00.000Z',
    description: 'CHECK # 2441      SOMETHING  CHECKPAYMT',
    debit: -119.57,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a249eb6922e18fe70f,
    date: '2019-02-26T08:00:00.000Z',
    description: 'CHECK # 2442      SOMETHING  CHECKPAYMT',
    debit: -121.12,
    credit: null,
    typeOrig: 'CHECK_PAID'
  },
  {
    _id: 5e35d3a206b6f822e08feab9,
    date: '2019-02-26T08:00:00.000Z',
    description: 'CHECK # 2442      SOMETHING  CHECKPAYMT',
    debit: -121.12,
    credit: null,
    typeOrig: 'CHECK_PAID'
  }

```