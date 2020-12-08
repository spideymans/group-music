# Music Party

Welcome to Music Party, our distributed music player!
## Dependencies and Installation
1. This project utilizes NodeJS and NPM (Node Package Manager). If you do not already have NodeJS installed on your system, [download NodeJS here](https://nodejs.org/en/).
2. Our frontend is written in Angular. Please install Angular with `npm install -g @angular/cli`. Learn more about Angular installation [here](https://angular.io/guide/setup-local) .
3. Clone this git repository `https://github.com/spideymans/group-music.git`.
4. The frontend (client software) is located in the `my-app/` directory. Navigate to this directory and run `npm install` to install its dependencies.
5. Once its dependencies are installed, compile and run the frontend by running `ng serve` in the `my-app/` directory. Once compilation is complete, you'll see a CLI output similar to:
> Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200

Navigate to the given address (probably http://localhost:4200) in Google Chrome.

6. To start the server, navigate to `socket-io/` and run `node socket.js {port number}`. Replace `{port number}` with any open port to run the server on (note, this is different from the port used to host the Angular frontend). **Note:** If the server fails to run, you might need to run `npm install` in `socket-io/`, before running the server.
7. Everything should now be set up to use the application

## Usage
See steps 5 and 6 in the previous section for instructions on how to start the frontend and server.
### Connecting Clients to the Server
Clients must connect to the server before the application can be used. To connect to the server, enter your name and the port number of the server in the specified boxes, and then click 'Connect'.

Note that clients can only connect to servers on `localhost`.

If the connection is established, you'll see a green "Connection Successful" toast message in the bottom of the screen.

Repeat this procedure for however many clients you desire to connect to the server.

### Shared Song Queue
Before starting music playback, ensure that all clients are connected to the server.

#### Adding Songs

The music queue will initially be empty. To add a song to the queue, click the "Choose File" button, and select a `MP3` file to add to the queue. Please ensure that this is an `MP3` file (unfortunately we cannot yet play `PDF` files).

You'll get a toast message when the song is successfully uploaded and added to the queue. All connected clients will have the song added to their queue.

#### Deleting Songs
To delete a song, click the "Delete" button next to the song in the queue. The song will be removed from all clients connected to the server.

### Music Controls
This application supports the following playback controls:
* Play/Pause
* Skip/Back
* Scrubbing

All of these actions will be synchronized amongst the clients.

The Shuffle and Repeat functions are not supported
