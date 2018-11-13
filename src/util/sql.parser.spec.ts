import test                         from 'blue-tape'
import {
  parseColumns,
  parseFrom,
  parseWhere,
  sqlParameterized,
}                                   from './sql-parser'

test('parseColumns', async t => {
  const sql = 'select count(*), name, age as linyimin from tablea where field1=12 and age=10 and name like "linyimin" and test="test" and score between 90 and 100 limit 10';
  const result = parseColumns(sql)
  const EXPECTED = [
    { name: 'count_0', type: 'others', alias: '' },
    { name: 'name', type: 'column', alias: '' },
    { name: 'age', type: 'column', alias: 'linyimin' },
  ]

  t.deepEqual(result, EXPECTED, 'parseColumns correct')
})


test('parsefrom', async t => {
  const sql = 'select count(*), name, age as linyimin from tablea where field1=12 and age=10 and name like "linyimin" and test="test" and score between 90 and 100 limit 10';
  const result = parseFrom(sql)
  const EXPECTED = [
    {
      "db": "",
      "table": "tablea",
      "as": null
    }
  ]

  t.deepEqual(result, EXPECTED, 'parseFrom correct')
})


test('parseWhere', async t => {
  const sql = 'select count(*), name, age as linyimin from tablea where field1=12 and age=10 and name like "linyimin" and test="test" and score between 90 and 100 limit 10';
  const result = parseWhere(sql)
  const EXPECTED = [
    {
      "table": "",
      "column": "field1",
      "defaultValue": "12"
    },
    {
      "table": "",
      "column": "age",
      "defaultValue": "10"
    },
    {
      "table": "",
      "column": "name",
      "defaultValue": "linyimin"
    },
    {
      "table": "",
      "column": "test",
      "defaultValue": "test"
    },
    {
      "table": "",
      "column": "score",
      "defaultValue": [
        "90",
        "100"
      ]
    }
  ]

  t.deepEqual(result, EXPECTED, 'parseWhere correct')
})

test('sqlparameterized', async t => {
  const sql = 'select count(*), name, age as linyimin from tablea where field1=12 and age=10 and name like "linyimin" and test="test" and score between 90 and 100 limit 10';
  const result = sqlParameterized(sql)
  const EXPECTED = 'SELECT COUNT(*), name, age AS linyimin FROM tablea WHERE field1 = ? AND age = ? AND name LIKE ? AND test = ? AND score BETWEEN ? AND ? LIMIT ?';

  t.deepEqual(result, EXPECTED, 'sqlparameterized correct')
})
