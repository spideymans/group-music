import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  port = 4503;
  socket: any;
  readonly uri: string = `ws://localhost:${this.port}`;

  constructor() {
    this.socket = io(this.uri);
   }

  listen(eventName: string) { 
    return new Observable((subscriber) => { 
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) { 
    this.socket.emit(eventName, data);
  }
}
