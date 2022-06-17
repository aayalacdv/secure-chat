import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { genData } from './test'
import { getRSAPublicKey, serializeBigIntPayload } from './helpers/data-helpers'
import { RSA_DATA } from './data/rsa-data'


const PORT: number = 8080
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


interface IMessage {
    userName: string,
    message: string,
}
//mock database
interface Room {
    id: string
    messages: IMessage[]
}


interface IUser {
    id: string, 
    userName : string, 
    publicKey: any

}
let CONNECTED_USERS: IUser[] = []
let ROOMS: Room[] = []


io.on('connection', (socket: Socket) => {


    //publish the public key to other users for now just connect
    socket.on('user-auth', (value) => {
        console.log(value)
        const { userName, publicKey } = value
        //@ts-ignore
        socket.userName = userName;

        let p = {}
        RSA_DATA.forEach((data) => {
            if(data.userName == userName) {
                p = data.publicKey
            }
        })
        console.log(`pubKey ${p}`)
        //@ts-ignore
        socket.publicKey = {n : p.n.toString(), e : p.e.toString()};

        //@ts-ignore
        console.log(`New connection user: ${socket.userName}`)
        //@ts-ignore
        console.log(`New connection key: ${serializeBigIntPayload(socket.publicKey)}`)

        //@ts-ignore
        CONNECTED_USERS.push({userName: socket.userName, publicKey: {...socket.publicKey}, id: socket.id})

        io.emit('user-connected', CONNECTED_USERS)
    })



    socket.on('private-message', ({to, message, prev}) =>{
        console.log(prev)

        socket.to(to).emit("private-message", {
            message: message,
            from: socket.id,
          }, prev);
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
            if (r.id == room) {
                r.messages.push({ userName: sender, message: message })
                console.log(r.messages)
                socket.to(room).emit('room-messages', r.messages)
            }
        })


    })

})

server.listen(PORT, HOST, () => {
    console.log(`Server listening at http://${HOST}:${PORT}`)
})






