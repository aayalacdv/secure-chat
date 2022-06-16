import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'


const PORT: number = 8000
const HOST: string = 'localhost'
const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).send({ message: 'Helloooooo' })
})



const server = createServer(app)
const io = new Server(server, { cors: { origin: "http://localhost:3000" } })


interface IMessage{
    userName: string, 
    message: string,
}
//mock database
interface Room {
    id: string
    messages: IMessage[]
}


let CONNECTED_USERS: string[] = []
let ROOMS: Room[] = []




io.on('connection', (socket: Socket) => {
    console.log(`New connection : ${socket.id}`)

    //publish the public key to other users for now just connect
    socket.on('user-auth', (username) => {
        CONNECTED_USERS.push(username)
        socket.emit('user-connected', CONNECTED_USERS)
    })


    socket.on('user-join-room', (room: string) => {
        console.log(`user-joined room ${room}`)
        socket.join(room)

        let found = false
        ROOMS.forEach(r => {
            if (r.id == room) {
                console.log('xdddd')
                found = true
            }
        })

        if (!found) {
            ROOMS.push({ id: room, messages: [] })
            console.log(ROOMS)
            socket.emit('connected-to-room', room)

        }

    })


    socket.on('room-message', (room, message, sender) => {
        console.log(`sender: ${sender}, msg: ${message}, room: ${room}`)
        ROOMS.forEach((r) => {
            if(r.id == room) {
                r.messages.push({userName: sender, message: message})
                console.log(r.messages)
                socket.to(room).emit('room-messages', r.messages)
            }
        })


    })

})

server.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`)
})






