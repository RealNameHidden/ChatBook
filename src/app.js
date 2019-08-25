const express = require('express')
const app = express()
const http = require('http')
const port = process.env.PORT || 8080
const path = require('path')
const publicDirectory = path.join(__dirname, '../public')
const server = http.createServer(app)
const socketio = require('socket.io')
const Filter = require('bad-words')
const io = socketio(server)
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { generateMessage, generateLocation }= require('./utils/messages')
app.use(express.static(publicDirectory))

app.get('', (req, res) => {
    res.render(index)

})

io.on("connection", (socket) => {
    console.log("New web socket connection")
    socket.on("join",({username,room}, callback)=>{

        const { error, user } = addUser({ id : socket.id, username, room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(user.username,"Welcome !")) //socket.emit is used to send to a specific client
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} joined the chat!`)) // broadcast is used to sed to al the users except the one triggering it
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sentMessage", (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('location', (loc,callback) => {
        const user = getUser(socket.io)
        io.to(user.room).emit('locationMessage', generateLocation(user.username,`https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        callback()
    })
    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.username).emit('message', generateMessage(user.username,`${user.username} has left !`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                user: getUsersInRoom(user.room)
            })
        }
    })
    
})

server.listen(port, () => {
    console.log(`Server is up and running on port ${port}!`);
})

