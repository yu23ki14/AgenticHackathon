import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors())

app.use(express.json())
app.use(cookieParser())

app.use("/hello", (_req, res) => {
  res.send("Hello, World!")
})

app.use((_req, res) => {
  res.status(404).send("Not Found")
})

app.listen(3001, () => {
  console.log("Server listening on port 3001")
})
