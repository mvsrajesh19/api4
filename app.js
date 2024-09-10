const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null
const intilize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
  }
}
intilize()
//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
  SELECT 
  *
  FROM 
  todo
  WHERE 
  id=${todoId}
  `
  const res = await db.get(query)
  response.send(res)
})
//API 3
app.post('/todos/', async (request, response) => {
  const body = request.body
  const {id, todo, priority, status} = body
  const query = `
  INSERT INTO todo(id,todo,priority,status)
  VALUES (
    ${id},
    '${todo}',
    '${priority}',
    '${status}'
  );
  `
  const res = await db.run(query)
  response.send('Todo Successfully Added')
})
//API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
  DELETE 
  FROM todo
  WHERE id=${todoId}
  `
  const res = await db.run(query)
  response.send('Todo Deleted')
})
//API 1
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})
module.exports = app
//API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {id} = request.params
  const body = request.body
  let col = ''
  switch (true) {
    case body.priority !== undefined:
      col = 'priority'
      break
    case body.todo !== undefined:
      col = 'todo'
      break
    case body.status !== undefined:
      col = 'status'
      break
  }
  const query = `
  UPDATE todo
  SET 
  (
    ${col}='${body.col}'
  )
  WHERE id=${id}
  `
  const res = db.run(query)
  response.send(res)
})
