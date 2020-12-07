import { Component, OnInit, ViewChild } from '@angular/core';
import { AngMusicPlayerComponent } from 'ang-music-player';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { WebSocketService } from './web-socket.service';
import { interval } from 'rxjs';
import { filter, map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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
  public userName = ""
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

  constructor(private webSocketService: WebSocketService, private httpClient: HttpClient, private toastr: ToastrService) { 

  }

  ngOnInit() { 
    console.log("Initializing connection");
    this.webSocketService.listen('test event').subscribe((data) => { 
      console.log(`Connected with id: ${this.webSocketService.socket.id}`)
      this.toastr.success('Connection Successful', null, {
        closeButton: true,
        positionClass:'bottom-left'
      });
    });

    // ---- Incoming events ---- 

  this.webSocketService.listen("playEvent").subscribe((data) => {
    console.log(`playEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.play();
    this.toast(`${data.userName} played`)
    });

  this.webSocketService.listen("pauseEvent").subscribe((data) => {
    console.log(`pauseEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.pause();
    this.toast(`${data.userName} paused`)
  });

  this.webSocketService.listen("nextEvent").subscribe((data) => {
    console.log(`nextEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.nextAudio();
    this.toast(`${data.userName} skipped`)
  });

  this.webSocketService.listen("previousEvent").subscribe((data) => {
    console.log(`previousEvent recieved. Sender: ${data.senderID}`);
    this.timeout();
    this.musicPlayerComponent.previousAudio();
    this.toast(`${data.userName} played previous song`)
  });

  this.webSocketService.listen("seekEvent").subscribe((data) => {
    console.log("Seek event recieved!");
    // if(!this.filterEvents) {
    //   this.musicPlayerComponent.nextAudio();
    // }dr
  });

  this.webSocketService.listen("deleteEvent").subscribe((data) => { 
    console.log(`Delete event recieved for song with ID ${data.songID}. Sender: ${data.senderID}`)
    this.audioList = this.audioList.filter((element) => element.id != data.songID)
    this.toast(`${data.userName} deleted a song.`)
  })

  this.webSocketService.listen("addEvent").subscribe((data) => { 
    console.log(`Add event recieved for song with ID ${data.songMetadata.id}. Sender: ${data.senderID}`);
    this.audioList.push(data.songMetadata);
    this.toast(`${data.userName} added song.`)
  })

  this.webSocketService.listen("sample message").subscribe((data) => {
    console.log("sample message recieved!");
    // this.musicPlayerComponent.pause();
  });

  }

  
    // ---- AngMusicPlayer events ---- 
    // These events are triggered by AngMusicPlayer when the corresponding actions are taken

  playEvent() {
    console.log(this.userName)
    if (!this.filterEvents) { 
      console.log("Emitting playEvent")
      this.webSocketService.emit("playEvent", { senderID: this.webSocketService.socket.id, userName: this.userName });
    }
  }

  pauseEvent() {
    if (!this.filterEvents) {
      console.log("Emitting pauseEvent")
      this.webSocketService.emit("pauseEvent", { senderID: this.webSocketService.socket.id, userName: this.userName });
    }
  }

  nextEvent() { 
    if (!this.filterEvents) { 
      console.log("Emitting nextEvent")
      this.webSocketService.emit("nextEvent", { senderID: this.webSocketService.socket.id, userName: this.userName });
    }
  }

  previousEvent() {
    if (!this.filterEvents) { 
      console.log("Emitting previousEvent")
      this.webSocketService.emit("previousEvent", { senderID: this.webSocketService.socket.id, userName: this.userName });
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
  
  /**
   * Call timeout() before calling play(), pause(), nextAudio() or previousAudio() on AngMusicPlayer.
   * timeout() will ignore all events emitted by AndMusicPlayer for 25 ms.
   */
  timeout() { 
    this.filterEvents = true;
    setTimeout(()=>{
      this.filterEvents = false;
    }, 250)
  }

  addToQueue(title: String, url: String) {
    const metadata: QueueItem = {
      id: Math.floor((Math.random() * 1000000) + 1),
      url: url,
      title: title,
      cover: "https://i1.sndcdn.com/artworks-000249294066-uow7s0-t500x500.jpg"
    };
    this.audioList.push(metadata);
    this.webSocketService.emit("addEvent", {  senderID: this.webSocketService.socket.id,
                                              userName: this.userName,
                                              songMetadata: metadata
                                            });
  }
  
  delete(songID: number) { 
    this.audioList = this.audioList.filter((element) => element.id != songID)
    this.webSocketService.emit("deleteEvent", { senderID: this.webSocketService.socket.id,
                                                songID: songID,
                                                userName: this.userName });
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

  toast(text: string) { 
    this.toastr.success(text, null, {
      closeButton: true,
      positionClass:'bottom-left'
    });
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