import { Component, OnInit, ViewChild } from '@angular/core';
import { AngMusicPlayerComponent } from 'ang-music-player';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { WebSocketService } from './web-socket.service';
import { interval } from 'rxjs';
import { filter, map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'my-app';

  @ViewChild(AngMusicPlayerComponent) musicPlayerComponent: AngMusicPlayerComponent;
  filterEvents: boolean = false;
  fileToUpload: File = null;
  audioList: QueueItem[] = [
    {
      id: 1,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      title: "Smaple 1",
      cover: "https://i1.sndcdn.com/artworks-000249294066-uow7s0-t500x500.jpg"
    },
    {
      id: 2,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      title: "Sample 2",
      cover: "https://i1.sndcdn.com/artworks-000249294066-uow7s0-t500x500.jpg"
    },
    {
      id: 3,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
      title: "Sample 3",
      cover: "https://i1.sndcdn.com/artworks-000249294066-uow7s0-t500x500.jpg"
    }
  ];

  constructor(private webSocketService: WebSocketService, private httpClient: HttpClient) { 

  }

  ngOnInit() { 
    console.log("Initializing connection");
    this.webSocketService.listen('test event').subscribe((data) => { 
      console.log(`Connected with id: ${this.webSocketService.socket.id}`)
    });

  this.webSocketService.listen("playEvent").subscribe((data) => {
    console.log(`playEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.play();
    });

  this.webSocketService.listen("pauseEvent").subscribe((data) => {
    console.log(`pauseEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.pause();
  });

  this.webSocketService.listen("nextEvent").subscribe((data) => {
    console.log(`nextEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.nextAudio();
  });

  this.webSocketService.listen("previousEvent").subscribe((data) => {
    console.log(`previousEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.previousAudio();
  });

  this.webSocketService.listen("seekEvent").subscribe((data) => {
    console.log("Seek event recieved!");
    // if(!this.filterEvents) {
    //   this.musicPlayerComponent.nextAudio();
    // }dr
  });

  this.webSocketService.listen("deleteEvent").subscribe((id) => { 
    console.log(`Delete event recieved for id ${id}`)
    this.audioList = this.audioList.filter((element) => element.id != id)
  })

  this.webSocketService.listen("addEvent").subscribe((metadata) => { 
    console.log(`Add event recieved for ${metadata.title}`);
    this.audioList.push(metadata);
  })

  this.webSocketService.listen("sample message").subscribe((data) => {
    console.log("sample message recieved!");
    // this.musicPlayerComponent.pause();
  });

  }

  playEvent() {
    if (!this.filterEvents) { 
      console.log("Emitting playEvent")
      this.webSocketService.emit("playEvent", { senderID: this.webSocketService.socket.id });
    }
  }

  pauseEvent() {
    if (!this.filterEvents) {
      console.log("Emitting pauseEvent")
      this.webSocketService.emit("pauseEvent", { senderID: this.webSocketService.socket.id });
    }
  }

  nextEvent() { 
    if (!this.filterEvents) { 
      console.log("Emitting nextEvent")
      this.webSocketService.emit("nextEvent", { senderID: this.webSocketService.socket.id });
    }
  }

  previousEvent() {
    if (!this.filterEvents) { 
      console.log("Emitting previousEvent")
      this.webSocketService.emit("previousEvent", { senderID: this.webSocketService.socket.id });
    }
  }

  seekEvent() {
    const newTime = this.musicPlayerComponent.audioPlayer.nativeElement.currentTime;
    this.webSocketService.emit("seekEvent", newTime);
    this.timeout();
  }

  sendMsg() { 
    this.webSocketService.emit("sample message", { senderID: this.webSocketService.socket.id });
  }
  
  timeout() { 
    this.filterEvents = true;
    setInterval(()=>{
      this.filterEvents = false;
    }, 400)
  }

  addToQueue(title: String, url: String) {
    const item: QueueItem = {
      id: Math.floor((Math.random() * 1000000) + 1),
      url: url,
      title: title,
      cover: "https://i1.sndcdn.com/artworks-000249294066-uow7s0-t500x500.jpg"
    };
    this.audioList.push(item);
    this.webSocketService.emit("addEvent", { senderID: this.webSocketService.socket.id });
  }
  
  delete(id: number) { 
    console.log("DELETE" + id);
    this.audioList = this.audioList.filter((element) => element.id != id)
    this.webSocketService.emit("deleteEvent", { senderID: this.webSocketService.socket.id });
  }

  handleFileInput(files: FileList) {
    const file = files.item(0)
    if (file == null) { return }

    const formData = new FormData();
    formData.append('song', file);
   
    this.httpClient.post(`http://localhost:${this.webSocketService.port}/`, formData)
      .subscribe(res => {
        console.log(res);
        alert('Added song to queue successfully.');

        this.addToQueue(file.name ,`http://localhost:${this.webSocketService.port}/${file.name}`)
      })
  }
}

export interface Message { 
  message: String
}

export interface QueueItem {
  id: number,
  url: String,
  title: String,
  cover: String
}