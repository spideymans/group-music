import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  port: number;
  uri: string;
  socket: any;

  constructor(port: number) {
    this.port = port;
    this.uri = `ws://localhost:${this.port}`;
    this.socket = io(this.uri);
   }

  listen(eventName: string) { 
    return new Observable((subscriber) => { 
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) { 
    this.socket.emit(eventName, data);
  }
}
