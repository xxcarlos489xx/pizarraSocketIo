import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService{

  private clientSocket:any;

  constructor(private cookieService: CookieService) {
    const room = cookieService.get('nameRoom');
   
    this.clientSocket = socketIo.connect(environment.socketUrl,{
      // reconnectionDelayMax: 10000,
      // auth: {
      //   token: "123"
      // },
      query: {
        "nameRoom": room
      }
    })
  }

  listen(connection:string):Observable<any> {
    return new Observable((subscribe)=>{
      this.clientSocket.on(connection,(data:any)=>{
        subscribe.next(data);
      })
    })
  }
  emit(connection:string,data:any):void{
    this.clientSocket.emit(connection,data);
  }
}
