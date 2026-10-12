import {Rules,type Hit} from './rules';
export type Ball={x:number;y:number;vx:number;vy:number};
export type Wall={a:[number,number];b:[number,number];kind?:Hit;id?:number};
export const walls:Wall[]=[
 {a:[35,160],b:[60,80]},{a:[60,80],b:[160,42]},{a:[160,42],b:[365,42]},{a:[365,42],b:[465,85]},{a:[465,85],b:[490,150]},
 {a:[35,160],b:[35,610]},{a:[490,150],b:[490,825]},{a:[450,175],b:[450,825]},
 {a:[35,610],b:[85,675]},{a:[85,675],b:[115,760]},
 {a:[440,340],b:[440,610]},{a:[440,610],b:[420,670]},{a:[420,670],b:[405,775]},
 {a:[98,560],b:[135,644],kind:'sling',id:0},{a:[135,644],b:[180,675],kind:'sling',id:0},{a:[180,675],b:[98,560],kind:'sling',id:0},
 {a:[390,560],b:[354,644],kind:'sling',id:1},{a:[354,644],b:[310,675],kind:'sling',id:1},{a:[310,675],b:[390,560],kind:'sling',id:1},
 {a:[128,655],b:[170,716]},{a:[360,716],b:[402,655]},
 ];
export const circles=[{x:190,y:270,r:27,kind:'bumper' as Hit,id:0},{x:325,y:270,r:27,kind:'bumper' as Hit,id:1},{x:258,y:390,r:29,kind:'bumper' as Hit,id:2},
 {x:83,y:245,r:17,kind:'buoy' as Hit,id:0},{x:258,y:130,r:17,kind:'buoy' as Hit,id:1},{x:415,y:245,r:17,kind:'buoy' as Hit,id:2},{x:258,y:323,r:19,kind:'beacon' as Hit,id:0}];
export class Simulation {
 rules=new Rules();ball:Ball={x:470,y:780,vx:0,vy:0};left=false;right=false;angles=[.48,Math.PI-.48];private omega=[0,0];private accumulator=0;private still=0;private inContact=new Set<string>();private contacts=new Set<string>();private laneInside=[false,false]; trail:[number,number][]=[];pulses=new Map<string,number>();onHit:(kind:Hit)=>void=()=>{};
 reset(){this.rules.start();this.ball={x:470,y:780,vx:0,vy:0};this.clearInputs();this.accumulator=0;this.still=0;this.trail=[];this.pulses.clear();this.angles=[.48,Math.PI-.48];this.inContact.clear();this.laneInside=[false,false];}
 clearInputs(){this.left=false;this.right=false;}
 pause(value:boolean){this.rules.paused=value;this.clearInputs();this.accumulator=0;}
 launch(power:number){if(!this.rules.launch())return;this.ball={x:470,y:780,vx:0,vy:-(920+Math.max(0,Math.min(1,power))*280)};this.still=0;this.inContact.clear();}
 nudge(){if(this.rules.nudge()&&!this.rules.tilted){this.ball.vx+=(this.ball.x<260?110:-110);this.ball.vy-=150;}}
 advance(seconds:number){if(this.rules.paused)return;this.accumulator+=Math.max(0,Math.min(seconds,.1));while(this.accumulator>=1/120){this.step();this.accumulator-=1/120;}}
 private step(){const dt=1/480;this.rules.tick(1/120);for(let k=0;k<4;k++){for(let i=0;i<2;i++){const target=i===0?((this.left&&!this.rules.tilted)?-.42:.48):((this.right&&!this.rules.tilted)?Math.PI+.42:Math.PI-.48);const old=this.angles[i];this.angles[i]+=Math.max(-18*dt,Math.min(18*dt,target-old));this.omega[i]=(this.angles[i]-old)/dt;}
 if(this.rules.phase!=='playing')continue;this.contacts=new Set();const b=this.ball;b.vy+=460*dt;b.vx*=.9997;b.vy*=.9997;b.x+=b.vx*dt;b.y+=b.vy*dt;
 for(const [i,w] of walls.entries())this.segment(w,5,0,0,`w${i}`);
 for(const c of circles){const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy),rad=c.r+9;if(d<rad){const nx=d?dx/d:0,ny=d?dy/d:-1; b.x=c.x+nx*(rad+.01);b.y=c.y+ny*(rad+.01);const v=b.vx*nx+b.vy*ny;if(v<0){b.vx-=1.85*v*nx;b.vy-=1.85*v*ny;}const key=`${c.kind}${c.id}`;this.contacts.add(key);if(!this.inContact.has(key)){b.vx+=nx*(c.kind==='bumper'?320:90);b.vy+=ny*(c.kind==='bumper'?320:90);this.score(c.kind,c.id);}}}
 for(let i=0;i<2;i++){const px=i?350:170,py=716,a=this.angles[i],end:[number,number]=[px+82*Math.cos(a),py+82*Math.sin(a)];this.segment({a:[px,py],b:end},8,this.omega[i],i,`f${i}`);}
 for(let i=0;i<2;i++){const inside=b.y>635&&b.y<670&&(i===0?b.x>45&&b.x<95:b.x>407&&b.x<438);if(inside&&!this.laneInside[i])this.score('lane',i);this.laneInside[i]=inside;}
 this.inContact=this.contacts;const speed=Math.hypot(b.vx,b.vy);if(speed>1250){b.vx*=1250/speed;b.vy*=1250/speed;}if(b.y>845){this.rules.drain();this.ball={x:470,y:780,vx:0,vy:0};this.clearInputs();this.still=0;break;}
 if(Math.hypot(b.vx,b.vy)<40)this.still+=dt;else this.still=0;if(this.still>6){b.vx=b.x<260?150:-150;b.vy=-360;this.rules.message='Harbour current · ball freed';this.still=0;}}
 if(this.rules.phase==='playing'){this.trail.push([this.ball.x,this.ball.y]);if(this.trail.length>14)this.trail.shift();}else this.trail=[];}
 private score(kind:Hit,id:number){if(this.rules.hit(kind,id)){this.pulses.set(`${kind}${id}`,this.rules.time);this.onHit(kind);}}
 private segment(w:Wall,r:number,omega:number,index:number,key:string){const b=this.ball,dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],t=Math.max(0,Math.min(1,((b.x-w.a[0])*dx+(b.y-w.a[1])*dy)/(dx*dx+dy*dy))),qx=w.a[0]+t*dx,qy=w.a[1]+t*dy,ox=b.x-qx,oy=b.y-qy,d=Math.hypot(ox,oy);if(d>=9+r)return;this.contacts.add(key);let nx=d?ox/d:-dy/Math.hypot(dx,dy),ny=d?oy/d:dx/Math.hypot(dx,dy);if(omega&&ny>0){nx=-nx;ny=-ny;}b.x=qx+nx*(9+r+.01);b.y=qy+ny*(9+r+.01);const svx=-omega*(qy-w.a[1]),svy=omega*(qx-w.a[0]),v=(b.vx-svx)*nx+(b.vy-svy)*ny;if(v<0){b.vx-=1.8*v*nx;b.vy-=1.8*v*ny;}
 if(omega&&Math.abs(omega)>1&&ny<0){b.vy=Math.min(b.vy,-520-280*t);b.vx+=(index===0?1:-1)*150*t;}
 if(w.kind&&!this.inContact.has(key)){const eventKey=`${w.kind}${w.id}`;if(!this.inContact.has(eventKey)){this.score(w.kind,w.id??0);b.vx+=nx*130;b.vy+=ny*130;}this.contacts.add(eventKey);}}
}
