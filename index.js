const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connection } = require("./config/db");
const { ticketRoutes } = require("./Routes/Ticket.route");


const app = express();

app.use(cors({
    origin: "*"
}));

app.use(express.json());


app.get("/", (req,res) => {

    res.status(200).send({message:"Welcome to TicketBooking.com"});
});


app.use("/", ticketRoutes);



app.listen(process.env.port, async(req,res) => {

    try {
        await connection;
        console.log("Connection to DB success");
    } 
    
    catch (err) {
       console.log("Connection to DB failed");
       console.log(err)
    }
});