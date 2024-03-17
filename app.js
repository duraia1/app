const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())
const dbPath = path.join(__dirname, 'userData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `
    SELECT * FROM user 
    WHERE username = '${username}'
    `
  const dbUser = await db.get(selectUserQuery)
  console.log(dbUser)
  if (dbUser === undefined) {
    const createUserQuery = `
          INSERT INTO user (username, name, password, gender, location)
          VALUES(
            username = '${username}',
            name = '${name}',
            password = '${hashedPassword}',
            gender = '${gender}',
            location = '${location}'
          )
        `
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      let newUserDetails = await db.run(createUserQuery)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
