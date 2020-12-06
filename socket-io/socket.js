const express = require("express");
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

let port = 4501;

app.use(cors());
app.use(express.static('public')); // To serve the static items in /public
app.use(fileUpload({
  createParentPath: true
}));

app.options('*', cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          //Use the name of the input field (i.e. "song") to retrieve the uploaded file
          let song = req.files.song;
          
          //Use the mv() method to place the file in upload directory (i.e. "uploads")
          song.mv('./public/' + song.name);

          //send response
          res.send({
              status: true,
              message: 'File is uploaded',
              data: {
                  name: song.name,
                  mimetype: song.mimetype,
                  size: song.size
              }
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
});


io.on('connection', function(socket) { 
    console.log("A user connected");

    socket.emit('test event', 'here is some data');

    socket.on("playEvent", () => { 
      console.log("Emitting play event");
      socket.broadcast.emit("playEvent");
    })

    socket.on("pauseEvent", () => { 
      console.log("Emitting play event");
      socket.broadcast.emit("pauseEvent");
    })

    socket.on("nextEvent", () => { 
      console.log("Emitting next event");
      socket.broadcast.emit("nextEvent");
    })

    socket.on("previousEvent", () => { 
      console.log("Emitting previous event");
      socket.broadcast.emit("previousEvent");
    })

    socket.on("sample message", () => { 
      console.log("Emitting sample message");
      socket.broadcast.emit("sample message");
    })

    socket.on("seekEvent", (newTime) => { 
      console.log(`Emitting seek event message ${newTime}`);
      socket.broadcast.emit("seekEvent");
    })

    socket.on("deleteEvent", (id) => { 
      console.log(`Emitting a delete event for item with id ${id}`);
      socket.broadcast.emit("deleteEvent", id);
    })

    socket.on("addEvent", (item) => { 
      console.log(`Emitting a add event for item ${item.title}`);
      socket.broadcast.emit("addEvent", item);
    })
    
})

server.listen(port, () => { 
    console.log(`Socket.io server is listening on port ${port}.`)
})