import express from "express"
import server from "./app.js"
import dotenv from "dotenv"
dotenv.config()
import {dbconnection} from "./db/dbconnect.js"


server.listen(process.env.PORT, () => {
    console.log(`listening to the server ${process.env.PORT}`)
})


await dbconnection()



