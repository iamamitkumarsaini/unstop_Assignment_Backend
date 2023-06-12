const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
    row: String,
    seatNumber: String,
    available: Boolean
},{
    versionKey: false
});


const TicketModel = mongoose.model("ticket", ticketSchema);

module.exports = { TicketModel };