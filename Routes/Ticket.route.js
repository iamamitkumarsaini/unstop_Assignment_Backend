const express = require("express");
const { TicketModel } = require("../Models/Ticket.model");

const ticketRoutes = express.Router();


// Inserting all the 80 Tickets at once using insertmany()
// ticketRoutes.post("/add", async(req,res) => {

//     const payload = req.body;

//     try { 
//         const tickets = await TicketModel.insertMany(payload);
//         res.status(201).send({message:"Ticket Inserted", tickets});
//     } 
    
//     catch (err) {
//         console.log(err);
//         res.status(500).send({ message: "Internal Server Error" });
//     }
// });


// Function to returning the nearest available seat from multiple rows

function findNearestAvailabelSeat(arr, K) {
    let i = 0;
    let j = K - 1;
  
    let minI;
    let minJ;
    let newArr = [];
  
    let minDiff = Infinity;
  
    while (j < arr.length) {
      let diff = Number(arr[j].row) - Number(arr[i].row);
  
      if (diff < minDiff) {
        minI = i;
        minJ = j;
        minDiff = diff;
      }
  
      if (j < arr.length - 1) {
        i++;
        j++;
      } else {
        break;
      }
    }
  
    if (minI !== undefined && minJ !== undefined) {
      for (let a = minI; a <= minJ; a++) {
        newArr.push(arr[a]);
      }
      console.log("newArr", newArr);
      return newArr;
    } else {
      return null;
    }
  };



// Get request API to send all the seats data to the client side

ticketRoutes.get("/alltickets", async (req, res) => {
    try {
      const tickets = await TicketModel.find();
      tickets.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
      res.status(200).send(tickets);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });



// Post Request to book the seats if availble and sending the boooked seat's Number as a response,
//  if seat is not available sending appropriate response.
  ticketRoutes.post("/booktickets", async (req, res) => {

    const { numTickets } = req.body;
  
    try {
    // Blocking user to book more than 7 seats at once, 
      if (numTickets > 7) {
        res.send({ message: "You can book maximum of 7 tickets at a time" });
      } 
      
      else {

        let seatsAvailabel = await TicketModel.find({ available: true });
  
    //  Checking if total number of Seats user tries to book are available or not. 
    //  If Available Seats are equal to user required seats it will go inside this if condition   
        if (seatsAvailabel.length >= numTickets) {
          let count = 1;
          let arr = [];
          let ansArr = [];
          let flag = false;
          let totalSeats = 80;
          let seatsInARow = 7;
          let totalRows = Math.ceil(totalSeats / seatsInARow);
  
        // Checking available seats row wise first.   
          for (let i = 0; i < totalRows; i++) {
            arr = await TicketModel.find({ available: true, row: count });
  
            if (arr.length >= numTickets) {
              arr = arr.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
              break;
            } else if (count < totalRows) {
              count++;
            } else if (count == totalRows) {
              flag = true;
            }
          }
  
        // If single row has the required seats available. then it will be booked from that single row  
          if (flag == false) {
            for (let i = 0; i < numTickets; i++) {
              let resArr = await TicketModel.findByIdAndUpdate(arr[i]._id, {
                available: false,
              });
              ansArr.push(resArr);
            }
  
            res.status(200).send({
              message: "Tickets are booked successfully",
              data: ansArr,
            });
          } 
          
        // If a single row does not have the required tickets, it will be selected from the multiple nearest row.
          else {
            seatsAvailabel = seatsAvailabel.sort((a, b) =>
              a.seatNumber.localeCompare(b.seatNumber)
            );
  
            let newArr = findNearestAvailabelSeat(seatsAvailabel, numTickets);
  
            res.status(200).send({
              message: "Tickets are booked successfully",
              data: newArr,
            });
          }
        }
        
    // If total number of available seats are less than the required seats then sending the appropriate response
    // With number of availbe seats
        else {
          res.send({ message: seatsAvailabel.length==0 ? "No Seats are Available currently" :  `Only ${seatsAvailabel.length} Seats are available` });
        }
  
      }
    } 
    
    catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
    
  });


// To cancel the ticket booking, Incase all the tickets are booked, 
// and not a single ticket is availble to test the code.
  ticketRoutes.patch("/cancelticket/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const cancelTicket = await TicketModel.findByIdAndUpdate(id, {
        available: true,
      });
      res.status(200).send({ message: "Ticket Cancelled" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

module.exports = { ticketRoutes };