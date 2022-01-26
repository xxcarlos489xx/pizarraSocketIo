import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.css']
})
export class DrawComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasRef',{static:false}) canvasRef:any;
  public isAvailable:boolean = false;
  public width=800;
  public height=800;
  private cx!:CanvasRenderingContext2D;
  private points:Array<any> = [];

  @HostListener('document:mousemove',['$event'])
  onMouseMove = (e:any)=>{
    if(e.target.id === 'myCanvas' && this.isAvailable){
      this.write(e);
    }
  }
  @HostListener('click',['$event'])
  onClick = (e:any)=>{
    if(e.target.id === 'myCanvas'){
      this.isAvailable = !this.isAvailable;
    }
  }

  constructor(private socketService:WebSocketService) {}
  ngAfterViewInit(): void {
    this.render();
  }

  ngOnInit(): void {
    this.socketService
        .listen('transmitiendo')
        .subscribe(data => {
          const {prevPost} = data;
          this.writeSingle(prevPost, false);
        })
  }
  
  private render(){
    // const cavasEl = this.canvasRef.nativeElement;
    // console.log(cavasEl);
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    this.cx = canvas.getContext('2d')!;
    canvas.width = this.width;
    canvas.height = this.height;
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
  }

  private write(res:any){
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const prevPos = {
      x:res.clientX - rect.left,
      y:res.clientY - rect.top
    }
    this.writeSingle(prevPos);    
  }
  private writeSingle(prevPos:Object, emit=true){
    this.points.push(prevPos);
    if(this.points.length > 3){
      const prevPost = this.points[this.points.length - 1];
      const currentPost = this.points[this.points.length - 2];
      this.drawOnCanvas(prevPost,currentPost);
      if (emit) {
        this.socketService.emit('event',{prevPost});
      }
    }
  }

  private drawOnCanvas(prevPost:any,currentPost:any){
    if (!this.cx) {
      return
    }
    this.cx.beginPath();
    if (prevPost) {
      this.cx.moveTo(prevPost.x, prevPost.y);
      this.cx.lineTo(currentPost.x, currentPost.y);
      this.cx.stroke();
    }
  }
  public clearZone():void{
    this.points = [];
    this.cx.clearRect(0,0,this.width,this.height);
  }

}
