(() => {
  'use strict';
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  const W = 640, H = 360;
  canvas.width = W; canvas.height = H;
  const mapRows = [
    '#################',
    '#...#...........#',
    '#...#..##.......#',
    '#......##..#....#',
    '###.#......#....#',
    '#...#......#....#',
    '#...#..##.......#',
    '#......##..###..#',
    '#..#........#...#',
    '#..#..##........#',
    '#.....##..#.....#',
    '#..........#....#',
    '#################'
  ];
  const map = mapRows.map(r => r.split('').map(c => c === '#' ? 1 : 0));
  const enemiesSeed = [[3.45,1.55],[6.5,1.55],[10.45,3.45],[13.5,6.5],[14.5,10.45]];
  const exit = {x:15.15,y:11.35};
  const $ = id => document.getElementById(id);
  const ui = {overlay:$('screenOverlay'),end:$('endOverlay'),start:$('startButton'),restart:$('restartButton'),health:$('healthValue'),healthMeter:$('healthMeter'),ammo:$('ammoValue'),ammoMeter:$('ammoMeter'),count:$('enemyCount'),objective:$('objectiveText'),message:$('centerMessage'),endTitle:$('endTitle'),endCopy:$('endCopy'),eyebrow:$('endEyebrow'),crosshair:$('crosshair'),sound:$('soundToggle')};
  let player, enemies, keys = {}, active=false, last=0, fireTimer=0, muzzle=0, hitFlash=0, soundOn=true, audio=null, time=0, won=false;
  const wallColor = ['#714c44','#77554a','#65433f','#805949','#6e4844'];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const wall=(x,y)=>!map[Math.floor(y)] || map[Math.floor(y)][Math.floor(x)] !== 0;
  function reset(){
    player={x:1.55,y:1.55,angle:0,hp:100,ammo:24,shotWait:0,damageWait:0};
    enemies=enemiesSeed.map((p,i)=>({x:p[0],y:p[1],hp:2,alive:true,phase:i*.9,attack:0,flash:0}));
    active=false; won=false; fireTimer=0; muzzle=0; hitFlash=0;
    ui.end.classList.add('hidden');ui.overlay.classList.remove('hidden');ui.objective.textContent='CLEAR THE CRIB';
    refreshHud();
  }
  function refreshHud(){
    ui.health.textContent=String(Math.max(0,Math.ceil(player.hp))).padStart(3,'0');
    ui.healthMeter.style.width=clamp(player.hp,0,100)+'%';
    ui.ammo.innerHTML=String(player.ammo).padStart(2,'0')+' <em>/ 24</em>';
    ui.ammoMeter.style.width=(player.ammo/24*100)+'%';
    const left=enemies.filter(e=>e.alive).length;
    ui.count.textContent=String(left).padStart(2,'0');
    if(left===0){ui.objective.textContent='FIND THE EXIT';}
  }
  function start(){if(active)return;active=true;ui.overlay.classList.add('hidden');canvas.focus();if(canvas.requestPointerLock && matchMedia('(pointer:fine)').matches)canvas.requestPointerLock();last=performance.now();}
  function makeAudio(){if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();}if(audio.state==='suspended')audio.resume();}
  function tone(freq,duration,type='square',vol=.05,slide=0){if(!soundOn)return;makeAudio();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),audio.currentTime+duration);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
  function fire(){if(!active||fireTimer>0)return;if(player.ammo<=0){player.ammo=24;fireTimer=.85;tone(170,.15,'triangle',.04,-70);refreshHud();return;}player.ammo--;fireTimer=.22;muzzle=.09;tone(105,.11,'sawtooth',.09,-75);tone(460,.07,'square',.025,-260);
    const direction=player.angle;let nearest=null,nearestD=99;
    for(const e of enemies){if(!e.alive)continue;const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);let da=Math.atan2(Math.sin(Math.atan2(dy,dx)-direction),Math.cos(Math.atan2(dy,dx)-direction));if(Math.abs(da)<.105 && d<nearestD && clearPath(player.x,player.y,e.x,e.y)){nearest=e;nearestD=d;}}
    if(nearest){nearest.hp--;nearest.flash=.2;if(nearest.hp<=0){nearest.alive=false;tone(220,.16,'triangle',.06,-170);}else tone(310,.09,'triangle',.045,-110);}
    refreshHud();
  }
  function clearPath(x1,y1,x2,y2){let d=Math.hypot(x2-x1,y2-y1),steps=Math.ceil(d*12);for(let i=1;i<steps;i++){let t=i/steps;if(wall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false;}return true;}
  function damage(amount){player.hp-=amount;hitFlash=.25;tone(90,.17,'sawtooth',.07,-45);if(player.hp<=0){player.hp=0;finish(false);}refreshHud();}
  function finish(victory){if(!active)return;active=false;won=victory;if(document.pointerLockElement)document.exitPointerLock();ui.endTitle.innerHTML=victory?'NAPTIME<br>FOREVER.':'BACK TO<br>BED.';ui.endCopy.textContent=victory?'You sent the little terrors back to bed. The nursery is quiet.':'The baby demons tucked you in. Time for a rematch?';ui.eyebrow.textContent=victory?'NURSERY SECURED':'YOU GOT BONKED';ui.end.classList.remove('hidden');if(victory)tone(520,.3,'triangle',.07,280);}
  function tileRay(x,y,dx,dy){let mx=Math.floor(x),my=Math.floor(y),ddx=Math.abs(1/dx),ddy=Math.abs(1/dy),sx=dx<0?-1:1,sy=dy<0?-1:1,sdx=(dx<0?x-mx:mx+1-x)*ddx,sdy=(dy<0?y-my:my+1-y)*ddy,side=0,steps=0;while(steps++<64){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0;}else{sdy+=ddy;my+=sy;side=1;}if(!map[my]||map[my][mx])break;}let dist=side===0?sdx-ddx:sdy-ddy;return {dist:Math.max(.001,dist),side,mx,my,dx,dy};}
  function drawWorld(){
    const sky=ctx.createLinearGradient(0,0,0,H*.52);sky.addColorStop(0,'#1b1b2b');sky.addColorStop(.58,'#443037');sky.addColorStop(1,'#886049');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.52);
    const floor=ctx.createLinearGradient(0,H*.49,0,H);floor.addColorStop(0,'#60483e');floor.addColorStop(.2,'#382b2b');floor.addColorStop(1,'#171519');ctx.fillStyle=floor;ctx.fillRect(0,H*.49,W,H*.51);
    // distant nursery lamps
    for(let i=0;i<4;i++){let x=74+i*160,y=54+(i%2)*14;ctx.fillStyle='#ffbd7840';ctx.fillRect(x-14,y-2,28,5);ctx.fillStyle='#ffd38a';ctx.fillRect(x-8,y,16,2);}
    const dirX=Math.cos(player.angle),dirY=Math.sin(player.angle),planeX=-dirY*.66,planeY=dirX*.66;const depths=new Float32Array(W);
    for(let x=0;x<W;x++){
      const cameraX=2*x/W-1,rayX=dirX+planeX*cameraX,rayY=dirY+planeY*cameraX;const hit=tileRay(player.x,player.y,rayX,rayY);let d=hit.dist;depths[x]=d;
      let wallH=Math.min(H*1.6,H/d),top=(H-wallH)*.5;
      let wallX=hit.side===0?player.y+ d*rayY:player.x+d*rayX;wallX-=Math.floor(wallX);
      let tex=(Math.floor(wallX*8)+Math.floor(top/26)+hit.mx*3+hit.my*2)%wallColor.length;let base=wallColor[(tex+wallColor.length)%wallColor.length];
      let shade=clamp(1.05-d*.075-(hit.side?.18:0),.24,1);ctx.fillStyle=base;ctx.fillRect(x,top,1,wallH);
      // block seams and vertical plaster marks
      const local=wallX*8-Math.floor(wallX*8);if(local<.07||local>.93){ctx.fillStyle=`rgba(25,15,20,${.35*shade})`;ctx.fillRect(x,top,1,wallH);}
      if((Math.floor(wallX*8)%2===0)&&wallH>14){ctx.fillStyle=`rgba(226,177,128,${.08*shade})`;ctx.fillRect(x,top+wallH*.22,1,Math.max(1,wallH*.025));}
      // lighting, warm edge glow
      ctx.fillStyle=`rgba(10,9,16,${1-shade})`;ctx.fillRect(x,top,1,wallH);
      let floorStart=Math.floor(top+wallH);if(floorStart<H){const glow=Math.max(0,1-d/6)*.12;ctx.fillStyle=`rgba(233,123,74,${glow})`;ctx.fillRect(x,floorStart,1,H-floorStart);}
    }
    drawExit();drawEnemies(depths);
    // vignette and subtle scanline
    const vg=ctx.createRadialGradient(W/2,H*.48,60,W/2,H*.5,W*.72);vg.addColorStop(.38,'transparent');vg.addColorStop(1,'#08070dc9');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#0c0a1020';for(let y=1;y<H;y+=3)ctx.fillRect(0,y,W,1);
  }
  function drawExit(){let dx=exit.x-player.x,dy=exit.y-player.y,d=Math.hypot(dx,dy),rel=Math.atan2(Math.sin(Math.atan2(dy,dx)-player.angle),Math.cos(Math.atan2(dy,dx)-player.angle));if(Math.abs(rel)>.8||!clearPath(player.x,player.y,exit.x,exit.y))return;let px=W/2+Math.tan(rel)*W*.75,sz=clamp(H/d*.63,4,125),py=H*.49;
    ctx.save();ctx.globalAlpha=.6+Math.sin(time*4)*.12;ctx.shadowColor='#69ffd1';ctx.shadowBlur=23;ctx.strokeStyle=enemies.some(e=>e.alive)?'#bd795e':'#8affd5';ctx.lineWidth=Math.max(2,sz*.07);ctx.beginPath();ctx.ellipse(px,py,sz*.28,sz*.48,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle=enemies.some(e=>e.alive)?'#a2493630':'#72f8cb30';ctx.beginPath();ctx.ellipse(px,py,sz*.23,sz*.42,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f8e6c6';ctx.font=`${Math.max(7,sz*.15)}px Oswald`;ctx.textAlign='center';ctx.fillText(enemies.some(e=>e.alive)?'LOCKED':'EXIT',px,py+sz*.6);ctx.restore();}
  const demonSprite=(()=>{let c=document.createElement('canvas');c.width=96;c.height=100;let g=c.getContext('2d');
    // horns
    g.fillStyle='#7d302e';g.beginPath();g.moveTo(20,33);g.quadraticCurveTo(8,10,9,3);g.quadraticCurveTo(29,12,34,26);g.fill();g.beginPath();g.moveTo(76,33);g.quadraticCurveTo(88,10,87,3);g.quadraticCurveTo(67,12,62,26);g.fill();
    // ears + round body
    g.fillStyle='#ad4a45';g.beginPath();g.ellipse(17,54,13,16,-.3,0,Math.PI*2);g.ellipse(79,54,13,16,.3,0,Math.PI*2);g.fill();
    let grad=g.createRadialGradient(34,39,4,48,57,43);grad.addColorStop(0,'#ffb779');grad.addColorStop(.45,'#d9695a');grad.addColorStop(1,'#772d3a');g.fillStyle=grad;g.beginPath();g.ellipse(48,57,36,39,0,0,Math.PI*2);g.fill();
    // diaper
    g.fillStyle='#e7d4be';g.beginPath();g.ellipse(48,79,28,15,0,0,Math.PI);g.lineTo(20,79);g.fill();g.fillStyle='#b99b87';g.fillRect(27,79,42,3);
    // eyes
    g.fillStyle='#321a24';g.beginPath();g.ellipse(34,51,9,12,-.1,0,Math.PI*2);g.ellipse(62,51,9,12,.1,0,Math.PI*2);g.fill();g.fillStyle='#f9d55f';g.beginPath();g.ellipse(36,52,4,7,0,0,Math.PI*2);g.ellipse(60,52,4,7,0,0,Math.PI*2);g.fill();g.fillStyle='#22131b';g.beginPath();g.ellipse(37,53,1.8,5,0,0,Math.PI*2);g.ellipse(59,53,1.8,5,0,0,Math.PI*2);g.fill();
    g.fillStyle='#592230';g.beginPath();g.ellipse(48,72,10,8,0,0,Math.PI);g.fill();g.fillStyle='#fff0d6';g.beginPath();g.moveTo(41,72);g.lineTo(45,72);g.lineTo(43,78);g.fill();g.beginPath();g.moveTo(54,72);g.lineTo(58,72);g.lineTo(56,78);g.fill();
    g.fillStyle='#f39872';g.beginPath();g.arc(23,66,4,0,Math.PI*2);g.arc(72,66,4,0,Math.PI*2);g.fill();
    // bib
    g.fillStyle='#e3bd6a';g.beginPath();g.moveTo(40,84);g.lineTo(56,84);g.lineTo(53,96);g.lineTo(43,96);g.fill();g.fillStyle='#883932';g.font='bold 8px sans-serif';g.textAlign='center';g.fillText('✕',48,93);
    return c;})();
  function drawEnemies(depths){const dirX=Math.cos(player.angle),dirY=Math.sin(player.angle),px=-dirY*.66,py=dirX*.66,ordered=enemies.filter(e=>e.alive).map(e=>({e,d:(player.x-e.x)**2+(player.y-e.y)**2})).sort((a,b)=>b.d-a.d);
    for(const item of ordered){const e=item.e,dx=e.x-player.x,dy=e.y-player.y,inv=1/(px*dirY-dirX*py),tx=inv*(dirY*dx-dirX*dy),ty=inv*(-py*dx+px*dy);if(ty<=.15)continue;let sx=Math.floor(W/2*(1+tx/ty)),size=Math.min(H*1.05,Math.abs(H/ty)*.72),bottom=H*.54+size*.22,top=bottom-size,sw=size*.82;
      if(sx+sw/2<0||sx-sw/2>=W)continue;let alpha=clamp(1-(ty-5)/10,.35,1);ctx.save();ctx.globalAlpha=alpha;if(e.flash>0)ctx.filter='brightness(1.8) saturate(.8)';
      // shadow
      ctx.fillStyle='#120e16a8';ctx.beginPath();ctx.ellipse(sx,H*.54+3,sw*.38,Math.max(2,size*.065),0,0,Math.PI*2);ctx.fill();
      if(ty<depths[clamp(sx,0,W-1)])ctx.drawImage(demonSprite,sx-sw/2,top,sw,size);
      ctx.filter='none';if(e.hp===1){ctx.fillStyle='#1b1215';ctx.fillRect(sx-size*.22,top-5,size*.44,3);ctx.fillStyle='#f36955';ctx.fillRect(sx-size*.22,top-5,size*.22,3);}ctx.restore();
    }
  }
  function drawWeapon(){const bob=active?(Math.sin(time*7)*2):0, recoil=muzzle>0?Math.sin(muzzle/.09*Math.PI)*9:0;ctx.save();ctx.translate(W/2,H+bob+recoil);ctx.fillStyle='#251a1d';ctx.beginPath();ctx.moveTo(-53,0);ctx.lineTo(-34,-40);ctx.quadraticCurveTo(-26,-52,-12,-48);ctx.lineTo(18,-48);ctx.quadraticCurveTo(31,-44,38,-27);ctx.lineTo(56,0);ctx.fill();ctx.fillStyle='#a6513c';ctx.beginPath();ctx.moveTo(-29,-30);ctx.quadraticCurveTo(-23,-53,0,-55);ctx.quadraticCurveTo(25,-51,31,-29);ctx.lineTo(24,7);ctx.lineTo(-25,7);ctx.fill();ctx.fillStyle='#e58955';ctx.beginPath();ctx.ellipse(0,-49,19,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#20171b';ctx.fillRect(-13,-55,26,10);ctx.fillStyle='#ffcd82';ctx.fillRect(-6,-54,12,4);ctx.fillStyle='#583230';ctx.beginPath();ctx.moveTo(-19,-20);ctx.lineTo(18,-20);ctx.lineTo(12,1);ctx.lineTo(-15,1);ctx.fill();ctx.fillStyle='#d5b68f';ctx.fillRect(-11,-15,22,3);
    if(muzzle>0){ctx.globalCompositeOperation='screen';ctx.fillStyle='#ffe39b';ctx.beginPath();ctx.moveTo(0,-85);ctx.lineTo(9,-61);ctx.lineTo(26,-68);ctx.lineTo(15,-51);ctx.lineTo(0,-57);ctx.lineTo(-14,-49);ctx.lineTo(-8,-68);ctx.lineTo(-21,-79);ctx.closePath();ctx.fill();ctx.fillStyle='#fff5cf';ctx.beginPath();ctx.arc(0,-65,9,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function render(){drawWorld();drawWeapon();if(hitFlash>0){ctx.fillStyle=`rgba(200,20,30,${hitFlash*.65})`;ctx.fillRect(0,0,W,H);}if(muzzle>0){ctx.fillStyle=`rgba(255,154,75,${muzzle*1.2})`;ctx.fillRect(0,0,W,H*.7);}}
  function collide(x,y){const r=.2;return wall(x-r,y-r)||wall(x+r,y-r)||wall(x-r,y+r)||wall(x+r,y+r);}
  function update(dt){time+=dt;fireTimer=Math.max(0,fireTimer-dt);muzzle=Math.max(0,muzzle-dt);hitFlash=Math.max(0,hitFlash-dt);
    if(!active)return;
    let turn=(keys.ArrowRight||keys.KeyE?1:0)-(keys.ArrowLeft||keys.KeyQ?1:0);player.angle+=turn*dt*2.35;
    let forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),strafe=(keys.KeyD?1:0)-(keys.KeyA?1:0);let mag=Math.hypot(forward,strafe)||1;if(forward||strafe){let speed=dt*2.45/mag,dx=(Math.cos(player.angle)*forward-Math.sin(player.angle)*strafe)*speed,dy=(Math.sin(player.angle)*forward+Math.cos(player.angle)*strafe)*speed;if(!collide(player.x+dx,player.y))player.x+=dx;if(!collide(player.x,player.y+dy))player.y+=dy;}
    for(const e of enemies){if(!e.alive)continue;e.flash=Math.max(0,e.flash-dt);e.attack=Math.max(0,e.attack-dt);e.phase+=dt*4;let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);if(d>1.05&&d<8){let s=dt*(d<2.2?.48:.31),nx=e.x+dx/d*s,ny=e.y+dy/d*s;if(!wall(nx,e.y))e.x=nx;if(!wall(e.x,ny))e.y=ny;}if(d<.93&&e.attack<=0){e.attack=1.05;damage(8+Math.random()*5);}}
    if(enemies.every(e=>!e.alive)&&Math.hypot(player.x-exit.x,player.y-exit.y)<.8)finish(true);
    refreshHud();
  }
  function loop(now){let dt=Math.min(.04,(now-last)/1000||0);last=now;update(dt);render();requestAnimationFrame(loop);}
  ui.start.addEventListener('click',()=>{makeAudio();start();});ui.restart.addEventListener('click',()=>{reset();makeAudio();start();});
  canvas.addEventListener('click',()=>{if(!active){start();return;}fire();});
  document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas)player.angle+=e.movementX*.0026;});
  document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'){if(!active)start();else fire();}});
  document.addEventListener('keyup',e=>keys[e.code]=false);
  document.addEventListener('pointerlockchange',()=>{ui.crosshair.style.opacity=document.pointerLockElement===canvas?'1':'.65';});
  let lastTouchX=0;canvas.addEventListener('touchstart',e=>{if(!active)return;lastTouchX=e.touches[0].clientX;},{passive:true});canvas.addEventListener('touchmove',e=>{if(!active)return;let x=e.touches[0].clientX;player.angle+=(x-lastTouchX)*.009;lastTouchX=x;},{passive:true});
  const touchButtons=document.querySelectorAll('[data-move]');touchButtons.forEach(b=>{let code={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'}[b.dataset.move];b.addEventListener('pointerdown',e=>{e.preventDefault();keys[code]=true;b.setPointerCapture(e.pointerId);});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>keys[code]=false));});
  $('mobileFire').addEventListener('pointerdown',e=>{e.preventDefault();fire();});$('mobileTurnLeft').addEventListener('pointerdown',e=>{e.preventDefault();keys.ArrowLeft=true;});$('mobileTurnRight').addEventListener('pointerdown',e=>{e.preventDefault();keys.ArrowRight=true;});['mobileTurnLeft','mobileTurnRight'].forEach(id=>$(id).addEventListener('pointerup',()=>{keys.ArrowLeft=keys.ArrowRight=false;}));
  ui.sound.addEventListener('click',()=>{soundOn=!soundOn;ui.sound.innerHTML=soundOn?'♪ <span>SOUND ON</span>':'♫ <span>SOUND OFF</span>';if(soundOn)makeAudio();});
  reset();last=performance.now();requestAnimationFrame(loop);
})();