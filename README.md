


## Case insensitve search

Goal: find all strings in the 'type' field that start with 'Dog' or 'dog'


Case insensitive searches can be done on fields case insensitive indexes. However, it matches the whole field. For example ...

```js
{ type: 'dog' }
```

... would work if the value of the field were 'Dog' or 'Dog'. However, if the value of the field is 'Dog is nice' there will be no matches.

To satisfy the 'starts with' condition you can use `$regex`. In this case you do not need an index. You must include `$options: 'i'` to specify case insensitive.

```js
{ type: { $regex: '^dog', $options: 'i' }}
```

- if you are using `$regex` it does not appear to use the index and queries are still case sensitive.
- without `$regex` 

