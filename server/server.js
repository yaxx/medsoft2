const express = require( 'express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const api = require('./routes/api')
// const history = require('connect-history-api-fallback');
const Connection = require('./models/schemas/connection')
const Messages = require('./models/schemas/messageschema')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const graphQlHttp = require('express-graphql')
const {buildSchema} = require('graphql')
const graphQlSchema = require('./graphql/schemas/index')
const graphQlResolvers = require('./graphql/resolvers/index')
app.use('/graphql', graphQlHttp({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}))

// app.use(cors({
//   origin:"http://localhost:4200", 
//   credentials: false
// }))
app.use(cors({
  origin:"*",
  credentials: true
}))
app.use(express.static(path.join(__dirname,'dist','client')))
// app.use(history());
app.use(require('morgan')('dev'))
app.use(bodyParser.json())
app.use(require('cookie-parser')('blackfly'))
// app.use('/api/*', api.verify, (req, res, next) => {
//   next()
// })
var connections = [];
var logins = [];
io.sockets.on('connection', (socket) => {
  connections.push(socket)
  socket.on('login', (data) => {
    data.si = socket.id;
    logins.push({
      ui: data.ui, si: socket.id
    })
    socket.broadcast.emit('online', data.ui)
})
  socket.on('new message', (data) => {
   logins.forEach(function (user) {
    if (user.ui === data.reciever) {
      socket.to(user.si).emit('new message', data)
    }
  })
})
  socket.on('record update', (update) => {
    socket.broadcast.emit('record update', update);  
})
  socket.on('store update', changes => {
    socket.broadcast.emit('store update', changes);
})
socket.on('check', (data) => {
    logins.forEach(function (user) {
      if (user.username === data.username) {
        socket.to(user.id).emit('newnotification', {})
      } else {}
    })
  })
})

app.get('/', (req, res) => {
    // res.render('index')
    res.sendFile(path.join(__dirname,'dist', 'client', 'index.html'));
})

app.get('/api/client', api.verify,  api.getClient)  
app.get('/api/patients/:type', api.verify, api.getPatients)
app.get('/api/myaccount', api.verify, api.getMyAccount)
app.get('/api/trans/:date',  api.verify,  api.getTransactions)
app.get('/dp/:id', api.getDp)
app.get('/api/products', api.verify, api.getProducts)
app.get('/api/history/:id', api.verify, api.getHistory)
app.get('/api/notifications',  api.verify, api.getNotifications)
app.post('/api/update-stocks', api.verify,  api.updateStocks)
app.post('/api/update-msg', api.verify, api.updateMessages)
app.post('/api/new-client',  api.verify,  api.addClient)
app.post('/api/new-patient', api.verify, api.addPerson)
app.post('/api/new-product', api.verify,  api.addProduct)
app.post('/api/person', api.verify,  api.addPerson)
app.post('/api/updatenote', api.verify, api.updateNote)
app.post('/api/addnotification', api.addNotifications)
app.post('/upload', api.uploadFile)
app.post('/api/upload-scans', api.verify,  api.uploadScans)
app.post('/api/download', api.verify,  api.downloadFile)
app.post('/api/update-history', api.verify, api.verify, api.updateHistory)
app.post('/api/update-record',  api.verify,  api.updateRecord)
app.post('/api/update-info',  api.verify,  api.updateInfo)
app.post('/api/updateclient',  api.verify,  api.updateClient)
app.post('/api/update-dept',  api.verify, api.updateDept)
app.post('/login', api.login)
app.post('/api/transaction',  api.verify, api.runTransaction)
server.listen(5000, (err) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log('Server is up and running')
  }
})
