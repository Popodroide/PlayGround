(() => {
  'use strict';
  const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);
  const ui={start:$('startBtn'),welcome:$('welcomeScreen'),dialogue:$('dialogue'),ending:$('endingScreen'),help:$('helpModal'),mission:$('missionProgress'),progress:$('progressText'),objective:$('objective'),location:$('locationLabel'),country:$('countryLabel'),npcName:$('npcName'),npcRole:$('npcRole'),npcMood:$('npcMood'),npcPortrait:$('npcPortrait'),bondFill:$('bondFill'),bondValue:$('bondValue'),dialogueText:$('dialogueText'),choices:$('choices'),turn:$('turnLabel'),toast:$('toast'),finalTurns:$('finalTurns'),finalItems:$('finalItems')};
  const npcData=[
    {id:'lena',name:'Lena',title:'THE GARDENER',symbol:'❀',x:620,color:'#ef987c',hair:'#654954',trait:'warm-hearted',mood:'Kind, but quietly worried',greeting:'I used to grow enough for everyone. Lately, everyone just takes their own little patch and goes home.',need:'to be appreciated',likes:'listen',agree:'“A shared garden,” she says, smiling. “I think the soil misses all those footsteps.”',resolved:false,trust:0,turns:0},
    {id:'bo',name:'Bo',title:'THE FERRY KEEPER',symbol:'◈',x:1260,color:'#8ca6aa',hair:'#3b4b55',trait:'prickly',mood:'Guarded, not unkind',greeting:'The ferry stays on my side. I built it, I mend it. Everyone else can walk around.',need:'to feel respected',likes:'promise',agree:'Bo takes a long breath. “All right. I can show you how to mend the other side. But you’re holding the hammer.”',resolved:false,trust:0,turns:0},
    {id:'sol',name:'Sol',title:'THE STORYKEEPER',symbol:'☼',x:1740,color:'#dca768',hair:'#6d5268',trait:'tender-hearted',mood:'A little low today',greeting:'People don’t sit for stories anymore. Maybe the old ones aren’t worth telling.',need:'a reason to hope',likes:'encourage',agree:'Sol’s eyes brighten. “Then tonight, I’ll tell the story of this very conversation.”',resolved:false,trust:0,turns:0},
    {id:'cauteria',name:'Nim',title:'THE KETTLE MENDER',symbol:'♨',x:2975,color:'#e78d66',hair:'#563e4b',trait:'inventive',mood:'Worried about the foundry workers',greeting:'The Duchess keeps every stove burning for her machines. Our soup pots are cold, and nobody dares turn a valve.',need:'to be heard without risking the crew',likes:'listen',agree:'Nim nods. “We’ll share the boiler schedule. One warm meal for every shift, and no names on the notice.”',resolved:false,trust:0,turns:0},
    {id:'morrowmoss',name:'Fen',title:'THE LANTERN TENDER',symbol:'☾',x:5075,color:'#91b89a',hair:'#394f55',trait:'cautious',mood:'Careful, but curious',greeting:'Morrowmoss says the mist belongs to her. I only want a little light along the boardwalk so the little ones can find home.',need:'a safe way to help their neighbors',likes:'promise',agree:'Fen smiles beneath the hood. “A lantern at each bend. We’ll take turns tending them, so no one carries the burden alone.”',resolved:false,trust:0,turns:0},
    {id:'giltgear',name:'Tink',title:'THE TEACUP FITTER',symbol:'⚙',x:7175,color:'#d9ae75',hair:'#4e4b59',trait:'practical',mood:'Annoyed with the factory quota',greeting:'Giltgear counts every turn of the gear, but never the hands that turn it. My neighbors need a day off before their springs wind down.',need:'a fair and workable plan',likes:'share',agree:'Tink rubs a smudge of brass from one cheek. “We’ll post a shared shift chart. Nobody works two turns in a row.”',resolved:false,trust:0,turns:0},
    {id:'saffron',name:'Zahra',title:'THE WELL KEEPER',symbol:'☼',x:9275,color:'#db9a62',hair:'#553e50',trait:'generous',mood:'Trying not to lose heart',greeting:'The Sultan taxes every drop. The spice sellers have water, the potters have water, but our little courtyard well is dry.',need:'a promise that includes everyone',likes:'promise',agree:'Zahra lifts her water jar. “At sunrise we’ll open the cistern together. No household gets turned away.”',resolved:false,trust:0,turns:0},
    {id:'shard',name:'Mica',title:'THE BOTTLE-BOAT BUILDER',symbol:'⚓',x:11375,color:'#8ec2c9',hair:'#405666',trait:'bold',mood:'Protective of the lake folk',greeting:'Admiral Shard calls every boat his fleet. We just want to cross the lake without paying a toll to his tin sailors.',need:'a way to stand together',likes:'encourage',agree:'Mica grins. “We’ll launch our little boats in a line. No one crosses alone, and no one pays the Admiral.”',resolved:false,trust:0,turns:0},
    {id:'ticktock',name:'Pipwick',title:'THE CLOCK-SMITH’S APPRENTICE',symbol:'⌛',x:13475,color:'#b7a4d5',hair:'#46405b',trait:'hopeful',mood:'Afraid the old clock will stop',greeting:'The Emperor winds the tower to keep time for himself. My sister’s clock has been still for a week, and she thinks she’s done something wrong.',need:'reassurance and a first step',likes:'encourage',agree:'Pipwick lets out a breath. “We’ll mend her clock together. Then we’ll teach the whole street how to keep time.”',resolved:false,trust:0,turns:0}
  ];
  const actions=[
    {id:'listen',icon:'◉',title:'Listen closely',desc:'Give their feelings a little room',tag:'EMPATHY',key:'empathy'},
    {id:'share',icon:'✦',title:'Find a common thread',desc:'Share something honest of your own',tag:'CHARISMA',key:'charisma'},
    {id:'encourage',icon:'☼',title:'Offer some hope',desc:'Help them see what could be',tag:'OPTIMISM',key:'optimism'},
    {id:'promise',icon:'↗',title:'Make a small promise',desc:'Offer a real, doable next step',tag:'SINCERITY',key:'sincerity'}
  ];
  const player={x:100,y:0,vx:0,vy:0,w:34,h:57,face:1,onGround:false,walk:0,air:0};
  const stats={charisma:3,empathy:4,optimism:3,sincerity:3};
  const countries=[
    {name:'Windmere',land:'Thimblegrass Commons',tyrant:'Baron Bramblewick',boss:'Baron Bramblewick, the Briar Regent',bossIcon:'♜',bossMood:'The tiny tyrant commands a thorn-crowned clockwork court.',sky:['#526780','#b57978','#e6b38a'],ground:'#465a47',accent:'#d7aa69',foes:[['Thorn-tax Bailiff','♟',38,7,'focus'],['Briarhook Lancer','⚔',43,8,'rush'],['Pollen Hexer','✧',36,9,'hex'],['Seedshot Slinger','➶',34,7,'swarm'],['Hedgeplate Bulwark','⬟',58,6,'brace'],['Cloverwire Trapper','⌘',42,8,'sap'],['Mossbell Cantor','♫',40,8,'leech'],['Rootbound Marshal','♜',64,10,'volley']]},
    {name:'Cinderreach',land:'The Stove-Stack Marches',tyrant:'Duchess Cauteria',boss:'Duchess Cauteria, Furnace Sovereign',bossIcon:'♨',bossMood:'A crown of blue flame burns above her iron kettle-helm.',sky:['#442f45','#a55250','#ef9c65'],ground:'#583d38',accent:'#ff9c54',foes:[['Sootmask Drummer','◉',42,8,'volley'],['Kilncoal Skirmisher','⚔',38,9,'rush'],['Ashglass Sniper','➶',35,10,'focus'],['Cinder Moth Witch','✧',40,9,'hex'],['Slagpot Lobber','◉',47,8,'swarm'],['Brassjaw Scrapper','⚙',55,10,'brace'],['Smokevein Stalker','◇',41,9,'sap'],['Ember Bellows Guard','⬟',62,11,'leech']]},
    {name:'Gloamfen',land:'The Dewdrop Mire',tyrant:'Mother Morrowmoss',boss:'Mother Morrowmoss, Queen Beneath the Bog',bossIcon:'☾',bossMood:'The fen itself seems to breathe with her ancient spell.',sky:['#233d4b','#476d70','#9ca17a'],ground:'#334e4a',accent:'#8bdbb7',foes:[['Reedveil Sneak','◇',37,8,'sap'],['Boglantern Wisp','☄',34,9,'hex'],['Mire-shell Piker','⚔',49,8,'brace'],['Sourdew Brewer','⚗',43,9,'leech'],['Lily-pad Skipper','❋',38,9,'rush'],['Murkfin Harrier','➶',42,9,'focus'],['Sporecap Caller','♫',45,8,'volley'],['Rootrot Oathkeeper','♜',63,10,'swarm']]},
    {name:'Brassfall',land:'The Teacup Foundries',tyrant:'Director Giltgear',boss:'Director Giltgear, the Everturning',bossIcon:'⚙',bossMood:'His six-legged brass throne ticks like a furious pocket watch.',sky:['#354a61','#72818a','#c9956d'],ground:'#46545a',accent:'#f2c56f',foes:[['Rivetline Riflehand','➶',38,9,'focus'],['Tinspring Duelist','⚔',43,10,'rush'],['Oil-Slick Saboteur','⌘',42,9,'sap'],['Cogwheel Chaplain','♫',45,9,'leech'],['Boilerplate Walker','⬟',60,8,'brace'],['Steamwhistle Hexwright','✧',41,10,'hex'],['Flywheel Grenadier','◉',49,9,'swarm'],['Coppercoil Enforcer','♜',62,11,'volley']]},
    {name:'Saffron Reach',land:'The Spice-Rack Dunes',tyrant:'Sultan Saffron IX',boss:'Sultan Saffron IX, the Gilded Mirage',bossIcon:'☼',bossMood:'A sandglass scepter turns time into a weapon in his jeweled hand.',sky:['#73504e','#c27c5c','#f0c77e'],ground:'#806247',accent:'#ffdf8a',foes:[['Pepper-dust Cutpurse','◇',36,9,'sap'],['Cumin Kite-Rider','➶',42,9,'focus'],['Saffron Veil Dancer','⚔',39,10,'rush'],['Cardamom Djinnling','✧',43,10,'hex'],['Salt-crust Guard','⬟',58,8,'brace'],['Pistachio Mortarling','◉',49,9,'swarm'],['Myrrh Jar Oracle','♫',45,9,'leech'],['Cinnamon Drum Major','♜',63,10,'volley']]},
    {name:'Glassmere',land:'The Looking-Glass Lake',tyrant:'Admiral Shard',boss:'Admiral Shard, Lord of the Splintered Fleet',bossIcon:'⚓',bossMood:'A ship-in-a-bottle fleet circles his mirrored diving suit.',sky:['#334d66','#638b99','#b8c5b9'],ground:'#3d6264',accent:'#a8e3cf',foes:[['Bottlecap Boarder','⚔',42,9,'rush'],['Mirrorfin Sharpshooter','➶',38,10,'focus'],['Coralglass Hexer','✧',41,10,'hex'],['Silt-pocket Diver','◇',44,9,'sap'],['Seashell Pavise','⬟',61,8,'brace'],['Bubblemine Tender','⌘',47,9,'swarm'],['Kelpwire Piper','♫',46,9,'leech'],['Anchor-chain Reaver','♜',64,11,'volley']]},
    {name:'Crownspire',land:'The Upside-Down Clocktower',tyrant:'Emperor Tick-Tock',boss:'Emperor Tick-Tock, Last Hand of the Clock',bossIcon:'⌛',bossMood:'The final tyrant winds the whole tiny world backward.',sky:['#252c4b','#655783','#d08a73'],ground:'#3b3d58',accent:'#d5b9ff',foes:[['Minutehand Fencer','⚔',44,10,'rush'],['Pendulum Pikelet','➶',41,10,'focus'],['Chimeglass Adept','✧',44,10,'hex'],['Escapement Sneak','◇',43,10,'sap'],['Hourplate Automaton','⬟',65,9,'brace'],['Cuckoo-Swarm Keeper','◉',50,10,'swarm'],['Moonphase Cantor','♫',47,10,'leech'],['Secondhand Reaper','♜',66,11,'volley']]}
  ];
  const encounters=countries.flatMap((country,region)=>[
    ...country.foes.map(([name,sigil,hp,attack,style],index)=>({region,index,name,hp,maxHp:hp,attack,sigil,style,mood:`${country.name} ${name.toLowerCase()} blocks the road with ${style==='hex'?'a spell':style==='rush'?'a sudden charge':style==='brace'?'a plated stance':style==='swarm'?'a flurry of tiny strikes':style==='leech'?'a draining charm':style==='sap'?'a snare':style==='focus'?'a precise aim':'a coordinated assault'}.`,x:region*2100+160+index*205,won:false,boss:false})),
    {region,index:8,name:country.boss,hp:145+region*8,maxHp:145+region*8,attack:13+region,sigil:country.bossIcon,style:['volley','rush','hex','brace','swarm','focus','leech'][region],mood:country.bossMood,x:region*2100+1900,won:false,boss:true}
  ]);
  const world={started:false,finished:false,now:0,last:0,viewW:1000,viewH:650,scale:1,worldW:countries.length*2100,camera:0,ground:0,active:null,agreements:0,turns:0,collected:0,toastTimer:0,keys:{left:false,right:false},jumpQueued:false,talkQueued:false,particles:[],sound:false,battle:null,battlesWon:0,encounters};
  const regionAt=x=>clamp(Math.floor(x/2100),0,countries.length-1);
  const currentEncounter=()=>world.encounters.find(encounter=>!encounter.won);
  const tyrantsDefeated=()=>world.encounters.filter(encounter=>encounter.boss&&encounter.won).length;
  const encountersWon=()=>world.encounters.filter(encounter=>encounter.won).length;
  const party=[{name:'Mira',role:'Mediator',icon:'✦',hp:82,maxHp:82,mp:18,maxMp:18,attack:13,guard:false},{name:'Tavi',role:'Apprentice mage',icon:'☼',hp:64,maxHp:64,mp:28,maxMp:28,attack:9,guard:false},{name:'Pip',role:'Valley scout',icon:'❖',hp:72,maxHp:72,mp:20,maxMp:20,attack:11,guard:false}];
  const platforms=countries.flatMap((_,region)=>[
    {x:region*2100+345,w:145,height:92},{x:region*2100+845,w:150,height:132},{x:region*2100+1515,w:178,height:100}
  ]);
  const keepsakes=[
    {x:410,p:0,label:'A ribbon for the garden',taken:false},{x:915,p:1,label:'A ferry token',taken:false},{x:1580,p:2,label:'A page from an old story',taken:false},
    ...countries.slice(1).map((_,index)=>({x:(index+1)*2100+410,p:(index+1)*3,label:['A soot-warm thimble','A dewglass lantern','A brass promise token','A sun-spice tin','A lakeglass skiff','A stopped clock’s spring'][index],taken:false}))
  ];
  const stars=Array.from({length:42},(_,i)=>({x:(i*173+87)%2300,y:55+(i*97)%230,r:.7+(i%3)*.35,phase:i*1.7}));
  function resize(){const w=innerWidth,h=innerHeight;world.scale=Math.min(w/1000,h/650);if(world.scale>1.18)world.scale=1.18;canvas.width=Math.round(w*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);canvas.style.width=w+'px';canvas.style.height=h+'px';world.viewW=w/world.scale;world.viewH=h/world.scale;world.ground=world.viewH-100;if(!world.started)player.y=world.ground-player.h;}
  addEventListener('resize',resize);resize();
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');world.toastTimer=2.1;}
  function drawBackground(t){
    const w=world.viewW,h=world.viewH,g=world.ground,region=regionAt(world.camera+w*.42),country=countries[region];
    const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,country.sky[0]);grad.addColorStop(.48,country.sky[1]);grad.addColorStop(1,country.sky[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    const sx=w*.72-world.camera*.045,sy=Math.min(h*.42,275),glow=ctx.createRadialGradient(sx,sy,8,sx,sy,210);glow.addColorStop(0,country.accent+'88');glow.addColorStop(1,country.accent+'00');ctx.fillStyle=glow;ctx.fillRect(sx-215,sy-215,430,430);ctx.globalAlpha=.9;ctx.fillStyle=country.accent;ctx.beginPath();ctx.arc(sx,sy,region===6?27:36,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    for(let i=0;i<5;i++){const x=((i*270-t*7-world.camera*.11)%(w+260)+w+260)%(w+260)-90,y=90+(i%3)*53;ctx.fillStyle=`rgba(255,235,215,${.08+i%2*.035})`;ctx.beginPath();ctx.ellipse(x,y,45,9,0,0,Math.PI*2);ctx.ellipse(x+25,y-5,24,12,0,0,Math.PI*2);ctx.ellipse(x+47,y+1,36,8,0,0,Math.PI*2);ctx.fill();}
    for(const s of stars){const x=s.x-world.camera*.08;if(x>-20&&x<w+20){ctx.globalAlpha=.1+.18*(.5+.5*Math.sin(t*1.7+s.phase));ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(x,s.y,s.r,0,Math.PI*2);ctx.fill();}}ctx.globalAlpha=1;
    drawHillLayer(g-95,country.ground,.16,150,44);drawHillLayer(g-42,country.ground,.29,230,54);
    ctx.fillStyle=country.ground;ctx.fillRect(0,g,w,h-g);ctx.fillStyle=country.accent;ctx.globalAlpha=.68;ctx.fillRect(0,g,w,7);ctx.globalAlpha=.45;ctx.fillRect(0,g+8,w,3);ctx.globalAlpha=1;
    ctx.fillStyle='#172b32';ctx.globalAlpha=.23;for(let x=-((world.camera*.35)%60);x<w+80;x+=60){ctx.fillRect(x,g+16,31,2);ctx.fillRect(x+29,g+28,20,2);}ctx.globalAlpha=1;
    drawRegionalLandmarks(region);
  }
  function drawHillLayer(base,color,parallax,step,amp){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,world.viewH);for(let x=0;x<=world.viewW+step;x+=step){const wx=x+world.camera*parallax;const y=base+Math.sin(wx*.006)*amp+Math.sin(wx*.014)*amp*.34;ctx.lineTo(x,y);}ctx.lineTo(world.viewW,world.viewH);ctx.closePath();ctx.fill();}
  function drawRegionalLandmarks(region){
    const country=countries[region],g=world.ground,first=Math.floor(world.camera/2100)*2100;
    for(let local of [260,760,1260,1760]){const wx=first+local,x=wx-world.camera;if(x<-140||x>world.viewW+140)continue;const y=g-8,accent=country.accent;ctx.save();ctx.translate(x,y);ctx.globalAlpha=.86;ctx.fillStyle='#263a42';ctx.strokeStyle=accent;ctx.lineWidth=4;
      if(region===0){ctx.strokeStyle='#748e58';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-15,-85,8,-166);ctx.stroke();ctx.fillStyle='#e6a1a1';ctx.beginPath();ctx.arc(4,-168,26,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4d18c';ctx.beginPath();ctx.arc(4,-168,8,0,Math.PI*2);ctx.fill();}
      else if(region===1){ctx.fillStyle='#714d4b';ctx.beginPath();ctx.roundRect(-46,-100,92,100,24);ctx.fill();ctx.fillStyle='#292e37';ctx.fillRect(-18,-144,36,50);ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,-100,46,16,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f59a58';ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(0,-30,18,0,Math.PI*2);ctx.fill();}
      else if(region===2){ctx.strokeStyle='#678f7b';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-30,-125);ctx.moveTo(15,0);ctx.lineTo(30,-100);ctx.stroke();ctx.fillStyle='#6b9b80';ctx.beginPath();ctx.ellipse(-30,-130,34,13,-.1,Math.PI,Math.PI*2);ctx.ellipse(30,-105,28,12,.1,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#c2dfbd';ctx.beginPath();ctx.arc(0,-40,14,0,Math.PI*2);ctx.fill();}
      else if(region===3){ctx.fillStyle='#4b5962';ctx.fillRect(-55,-125,110,125);ctx.fillStyle='#263640';ctx.fillRect(-32,-100,24,25);ctx.fillRect(9,-100,24,25);ctx.fillRect(-14,-49,29,49);ctx.strokeStyle=accent;ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-124,24,0,Math.PI*2);ctx.stroke();drawGear(0,-124,21,world.now*.2,.75);}
      else if(region===4){ctx.fillStyle='#b68754';ctx.beginPath();ctx.moveTo(-65,0);ctx.lineTo(-42,-105);ctx.lineTo(42,-105);ctx.lineTo(65,0);ctx.closePath();ctx.fill();ctx.fillStyle='#e1bb79';ctx.beginPath();ctx.ellipse(0,-105,42,12,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-42,-105,84,8);ctx.fillStyle='#fae1a4';ctx.beginPath();ctx.arc(0,-112,10,0,Math.PI*2);ctx.fill();}
      else if(region===5){ctx.fillStyle='#8dbbc0';ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(-38,-112);ctx.lineTo(6,-64);ctx.lineTo(35,-150);ctx.lineTo(68,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#d8f3e7';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#394f65';ctx.beginPath();ctx.ellipse(0,-26,45,15,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=accent;ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(0,-105);ctx.moveTo(-24,-82);ctx.lineTo(23,-82);ctx.stroke();}
      else{ctx.fillStyle='#45405e';ctx.fillRect(-48,-162,96,162);ctx.fillStyle='#292d48';ctx.fillRect(-23,-132,46,132);ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-159,27,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe6a1';ctx.beginPath();ctx.arc(0,-130,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-80,-6);ctx.lineTo(80,-6);ctx.moveTo(0,-22);ctx.lineTo(0,-145);ctx.stroke();}
      ctx.restore();}
  }
  function drawProps(){const g=world.ground,region=regionAt(player.x),country=countries[region];for(let i=0;i<48;i++){const wx=(i*127+45)%world.worldW,x=wx-world.camera;if(x<-35||x>world.viewW+35)continue;const y=g-2-(i%4)*2;ctx.strokeStyle=i%3?country.accent:'#f0b88e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-4,y-8,x-2,y-14-i%5);ctx.moveTo(x,y);ctx.quadraticCurveTo(x+5,y-7,x+7,y-11);ctx.stroke();if(i%3===0){ctx.fillStyle=country.accent;ctx.beginPath();ctx.arc(x-2,y-14-i%5,2,0,Math.PI*2);ctx.fill();}}
    for(let regionIndex=0;regionIndex<countries.length;regionIndex++){const xw=regionIndex*2100+95,x=xw-world.camera;if(x<-80||x>world.viewW+80)continue;ctx.fillStyle='#4d464d';ctx.fillRect(x,g-49,4,49);ctx.fillStyle=countries[regionIndex].accent;ctx.fillRect(x-2,g-48,8,15);ctx.font='bold 8px DM Sans';ctx.textAlign='left';ctx.fillStyle='#fff2d6';ctx.fillText(countries[regionIndex].name.toUpperCase(),x+9,g-38);}
  }
  function platformY(p){return world.ground-p.height;}
  function drawPlatforms(){for(const p of platforms){const x=p.x-world.camera,y=platformY(p);if(x+p.w<-20||x>world.viewW+20)continue;ctx.fillStyle='#705d57';ctx.beginPath();ctx.roundRect(x,y,p.w,14,7);ctx.fill();ctx.fillStyle='#c9a278';ctx.beginPath();ctx.roundRect(x,y-3,p.w,9,5);ctx.fill();ctx.fillStyle='#9eb079';ctx.fillRect(x+7,y-5,p.w-14,4);for(let j=0;j<4;j++){ctx.fillStyle='#d7b78a';ctx.beginPath();ctx.arc(x+18+j*35,y+7,2,0,Math.PI*2);ctx.fill();}}
    for(const k of keepsakes){if(k.taken)continue;const p=platforms[k.p],x=k.x-world.camera,y=platformY(p)-18+Math.sin(world.now*3+k.x)*3;if(x<-20||x>world.viewW+20)continue;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(world.now*1.7+k.x)*.09);ctx.shadowColor='#ffe6a3';ctx.shadowBlur=15;ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#b98164';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',0,0);ctx.restore();}
  }

  function drawGear(x,y,r,spin,alpha=.27){ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.globalAlpha=alpha;ctx.strokeStyle='#edc781';ctx.fillStyle='#edc781';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-2,-r-3,4,7);}ctx.beginPath();ctx.arc(0,0,r*.32,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  function drawCelestialDetails(t){const w=world.viewW,h=world.viewH;drawGear(w*.19-world.camera*.08,Math.min(h*.32,205),43,t*.12,.2);drawGear(w*.83-world.camera*.055,Math.min(h*.24,155),26,-t*.16,.18);
    // a tiny brass-hulled airship drifting through the evening
    const ax=((w*.56-t*10-world.camera*.13)%(w+180)+w+180)%(w+180)-80,ay=Math.min(h*.29,190)+Math.sin(t*.4)*5;ctx.save();ctx.translate(ax,ay);ctx.globalAlpha=.72;ctx.fillStyle='#52646a';ctx.beginPath();ctx.ellipse(0,8,35,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d5ad70';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,1,39,11,0,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#c48d63';ctx.beginPath();ctx.moveTo(-20,8);ctx.lineTo(22,8);ctx.lineTo(12,16);ctx.lineTo(-14,16);ctx.closePath();ctx.fill();ctx.strokeStyle='#e6c982';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,1);ctx.moveTo(-10,-5);ctx.lineTo(10,-5);ctx.stroke();ctx.fillStyle='#f9d991';ctx.beginPath();ctx.arc(0,1,2,0,Math.PI*2);ctx.fill();ctx.restore();
    // floating firefly motes and faint runic constellations
    for(let i=0;i<15;i++){let x=(i*149+Math.sin(t*.8+i)*17-world.camera*.12)%(w+40);if(x<0)x+=w+40;let y=120+(i*83)%(Math.max(180,h*.72));let glow=.25+.45*(.5+.5*Math.sin(t*2+i));ctx.globalAlpha=glow;ctx.shadowColor=i%2?'#9ce7c9':'#ffd78d';ctx.shadowBlur=9;ctx.fillStyle=i%2?'#a8f0d0':'#ffdf9a';ctx.beginPath();ctx.arc(x,y,1.3+(i%3)*.35,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}ctx.globalAlpha=1;
  }
  function drawPerson(x,base,opts={}){
    const {color='#e79a7f',hair='#57434e',isPlayer=false,walk=0,air=0,symbol=''}=opts;
    ctx.save();ctx.translate(x,base);const bob=Math.sin(walk*9)*Math.min(1,Math.abs(walk))*2.2;
    ctx.fillStyle='#283b42';ctx.globalAlpha=.22;ctx.beginPath();ctx.ellipse(0,0,17,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.translate(0,-bob);
    // legs and shoes
    ctx.strokeStyle='#293c46';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5,-19);ctx.lineTo(-6+Math.sin(walk*9)*4,-3);ctx.moveTo(5,-19);ctx.lineTo(6-Math.sin(walk*9)*4,-3);ctx.stroke();
    ctx.fillStyle='#f6d2ad';ctx.beginPath();ctx.ellipse(-8,-2,7,3,0,0,Math.PI*2);ctx.ellipse(8,-2,7,3,0,0,Math.PI*2);ctx.fill();
    // body and Mira's little brass-trimmed travel coat
    ctx.fillStyle=isPlayer?'#285451':color;ctx.beginPath();ctx.roundRect(-13,-43,26,27,9);ctx.fill();ctx.fillStyle=isPlayer?'#bd8b55':'#ffffff38';ctx.beginPath();ctx.roundRect(-7,-41,5,21,3);ctx.fill();
    if(isPlayer){ctx.strokeStyle='#e2bd78';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-7,-41);ctx.lineTo(0,-32);ctx.lineTo(7,-41);ctx.moveTo(0,-32);ctx.lineTo(0,-18);ctx.stroke();ctx.fillStyle='#f4d18c';for(let by=-36;by<-20;by+=6){ctx.beginPath();ctx.arc(0,by,1.3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#b87357';ctx.beginPath();ctx.roundRect(-14,-24,28,5,2);ctx.fill();ctx.fillStyle='#f2cf89';ctx.beginPath();ctx.arc(0,-21.5,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#40585a';ctx.beginPath();ctx.roundRect(-20,-40,6,15,2);ctx.fill();ctx.strokeStyle='#d5ac6d';ctx.lineWidth=1;ctx.strokeRect(-19,-38,4,9);ctx.fillStyle='#edc67c';ctx.beginPath();ctx.arc(13,-35,2.1,0,Math.PI*2);ctx.fill();}
    // arms, animated when walking
    ctx.strokeStyle=isPlayer?'#efb49a':color;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-37);ctx.lineTo(-16,-25+Math.sin(walk*9)*3);ctx.moveTo(12,-37);ctx.lineTo(16,-26-Math.sin(walk*9)*3);ctx.stroke();
    // head and ears
    ctx.fillStyle='#f0c3a0';ctx.beginPath();ctx.arc(0,-53,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hair;ctx.beginPath();ctx.arc(0,-57,13,Math.PI,Math.PI*2);ctx.quadraticCurveTo(13,-63,12,-49);if(isPlayer)ctx.quadraticCurveTo(8,-53,7,-47);else ctx.quadraticCurveTo(13,-48,10,-44);ctx.lineTo(-12,-46);ctx.quadraticCurveTo(-15,-53,-9,-59);ctx.closePath();ctx.fill();
    // friendly expression, face turned toward nearest neighbor
    const look=(isPlayer?player.face:1)*1.5;ctx.fillStyle='#3d4149';ctx.beginPath();ctx.arc(-4+look,-53,1.1,0,Math.PI*2);ctx.arc(4+look,-53,1.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a96862';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0+look,-49,3,.18,Math.PI-.18);ctx.stroke();
    if(isPlayer){ctx.fillStyle='#765447';ctx.beginPath();ctx.ellipse(0,-64,15,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#996b4f';ctx.beginPath();ctx.roundRect(-9,-78,18,14,4);ctx.fill();ctx.fillStyle='#e3bd78';ctx.fillRect(-10,-68,20,2);ctx.strokeStyle='#e8ca87';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-5,-57,4,0,Math.PI*2);ctx.arc(5,-57,4,0,Math.PI*2);ctx.moveTo(-1,-57);ctx.lineTo(1,-57);ctx.stroke();ctx.fillStyle='#9ce7c9';ctx.shadowColor='#9ce7c9';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(-5,-57,1.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    if(symbol){ctx.fillStyle='#fff0c8';ctx.font='12px serif';ctx.textAlign='center';ctx.fillText(symbol,0,-74);}
    ctx.restore();
  }
  function drawNeighbor(x,base,n,t){
    ctx.save();ctx.translate(x,base);const bob=Math.sin(t*1.6+n.x)*1.4;
    // Every Windmere neighbor is a small, grounded fantasy creature with a clear silhouette.
    ctx.fillStyle='#283b42';ctx.globalAlpha=.23;ctx.beginPath();ctx.ellipse(0,0,21,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(n.id==='lena'){
      // A foxkin gardener in a leaf-green work coat, with a flower crown and watering can.
      ctx.fillStyle='#a95f51';ctx.beginPath();ctx.moveTo(-12,-19);ctx.quadraticCurveTo(-31,-22,-34,-43);ctx.quadraticCurveTo(-19,-38,-13,-31);ctx.fill();ctx.fillStyle='#e49a72';ctx.beginPath();ctx.ellipse(0,-29+bob,16,19,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#567e68';ctx.beginPath();ctx.roundRect(-15,-42+bob,30,23,8);ctx.fill();ctx.fillStyle='#8fae7a';ctx.beginPath();ctx.moveTo(-15,-38+bob);ctx.lineTo(0,-29+bob);ctx.lineTo(15,-38+bob);ctx.lineTo(12,-20);ctx.lineTo(-12,-20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7d534d';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-20);ctx.lineTo(-9,-4);ctx.moveTo(7,-20);ctx.lineTo(10,-4);ctx.stroke();ctx.fillStyle='#e8c39b';ctx.beginPath();ctx.ellipse(-11,-3,7,3,0,0,Math.PI*2);ctx.ellipse(11,-3,7,3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e49a72';ctx.beginPath();ctx.moveTo(-12,-48+bob);ctx.lineTo(-17,-70+bob);ctx.quadraticCurveTo(-5,-66,-3,-50+bob);ctx.moveTo(7,-50+bob);ctx.lineTo(17,-67+bob);ctx.quadraticCurveTo(22,-55,13,-46+bob);ctx.fill();ctx.fillStyle='#f6d2b4';ctx.beginPath();ctx.ellipse(0,-49+bob,14,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a5148';ctx.beginPath();ctx.arc(-5,-51+bob,1.3,0,Math.PI*2);ctx.arc(5,-51+bob,1.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#704c46';ctx.beginPath();ctx.ellipse(0,-45+bob,3,2,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#d5a25e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-60+bob);ctx.quadraticCurveTo(0,-67+bob,10,-59+bob);ctx.stroke();for(const fx of [-7,0,7]){ctx.fillStyle=fx===0?'#f7d68f':'#e9a1a0';ctx.beginPath();ctx.arc(fx,-62+bob,2.4,0,Math.PI*2);ctx.fill();}
      // Watering can and a tiny sprout tucked at her side.
      ctx.fillStyle='#9bbf9d';ctx.beginPath();ctx.roundRect(15,-29+bob,10,9,2);ctx.fill();ctx.strokeStyle='#d6c18a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(16,-27+bob);ctx.lineTo(11,-31+bob);ctx.lineTo(8,-30+bob);ctx.moveTo(25,-25+bob);ctx.lineTo(29,-27+bob);ctx.stroke();
    }else if(n.id==='bo'){
      // A stout river-turtle keeper with layered leather-and-brass armor and an oar.
      ctx.fillStyle='#4b6267';ctx.beginPath();ctx.ellipse(-1,-30+bob,21,17,-.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b88d5a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-1,-30+bob,17,13,-.1,0,Math.PI*2);ctx.moveTo(-13,-34+bob);ctx.lineTo(10,-26+bob);ctx.moveTo(-13,-26+bob);ctx.lineTo(10,-35+bob);ctx.stroke();
      ctx.fillStyle='#607f7c';ctx.beginPath();ctx.roundRect(-13,-43+bob,27,24,8);ctx.fill();ctx.fillStyle='#735d4e';ctx.beginPath();ctx.moveTo(-14,-39+bob);ctx.lineTo(13,-39+bob);ctx.lineTo(17,-22);ctx.lineTo(-17,-22);ctx.closePath();ctx.fill();ctx.fillStyle='#c19a61';ctx.fillRect(-15,-29,30,3);ctx.fillStyle='#d9b96f';ctx.beginPath();ctx.arc(0,-28,3,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#475b60';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,-20);ctx.lineTo(-10,-4);ctx.moveTo(8,-20);ctx.lineTo(10,-4);ctx.stroke();ctx.fillStyle='#a78968';ctx.beginPath();ctx.ellipse(-12,-3,7,3,0,0,Math.PI*2);ctx.ellipse(12,-3,7,3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#668986';ctx.beginPath();ctx.ellipse(3,-51+bob,17,15,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#86aaa0';ctx.beginPath();ctx.ellipse(11,-47+bob,12,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8bc86';ctx.beginPath();ctx.arc(-3,-53+bob,1.6,0,Math.PI*2);ctx.arc(7,-53+bob,1.6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#42565a';ctx.beginPath();ctx.arc(-3,-53+bob,0.8,0,Math.PI*2);ctx.arc(7,-53+bob,0.8,0,Math.PI*2);ctx.fill();
      // Oar-staff carried like a practical ferryman's weapon.
      ctx.strokeStyle='#815e43';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(23,-2);ctx.lineTo(29,-62);ctx.stroke();ctx.fillStyle='#b99162';ctx.beginPath();ctx.ellipse(29,-65,5,11,.12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e0c27e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(26,-67);ctx.lineTo(32,-63);ctx.stroke();
    }else{
      // An owlkin storyteller in a plum travel robe, spectacles, and lantern-tipped staff.
      ctx.fillStyle='#865f78';ctx.beginPath();ctx.moveTo(-16,-39+bob);ctx.lineTo(0,-45+bob);ctx.lineTo(16,-39+bob);ctx.lineTo(20,-19);ctx.lineTo(-20,-19);ctx.closePath();ctx.fill();ctx.fillStyle='#b77961';ctx.beginPath();ctx.moveTo(-12,-37+bob);ctx.lineTo(0,-29+bob);ctx.lineTo(12,-37+bob);ctx.lineTo(8,-20);ctx.lineTo(-8,-20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#604b5a';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,-20);ctx.lineTo(-9,-4);ctx.moveTo(8,-20);ctx.lineTo(9,-4);ctx.stroke();ctx.fillStyle='#dfbd91';ctx.beginPath();ctx.ellipse(-11,-3,7,3,0,0,Math.PI*2);ctx.ellipse(11,-3,7,3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d8a85e';ctx.beginPath();ctx.ellipse(0,-51+bob,17,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f1d7aa';ctx.beginPath();ctx.ellipse(0,-45+bob,12,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4e3ba';ctx.beginPath();ctx.arc(-7,-52+bob,6,0,Math.PI*2);ctx.arc(7,-52+bob,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4b4552';ctx.beginPath();ctx.arc(-7,-52+bob,2,0,Math.PI*2);ctx.arc(7,-52+bob,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c77c55';ctx.beginPath();ctx.moveTo(-3,-45+bob);ctx.lineTo(3,-45+bob);ctx.lineTo(0,-41+bob);ctx.closePath();ctx.fill();
      ctx.fillStyle='#d8a85e';ctx.beginPath();ctx.moveTo(-13,-60+bob);ctx.lineTo(-16,-71+bob);ctx.lineTo(-5,-63+bob);ctx.moveTo(13,-60+bob);ctx.lineTo(16,-71+bob);ctx.lineTo(5,-63+bob);ctx.fill();ctx.strokeStyle='#d9c68a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-7,-52+bob,7,0,Math.PI*2);ctx.arc(7,-52+bob,7,0,Math.PI*2);ctx.moveTo(0,-52+bob);ctx.lineTo(0,-52+bob);ctx.stroke();
      ctx.strokeStyle='#725340';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(23,-2);ctx.lineTo(25,-58);ctx.stroke();ctx.fillStyle='#ffdc8c';ctx.shadowColor='#ffdc8c';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(25,-62,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#d4b273';ctx.lineWidth=1;ctx.strokeRect(21,-66,8,8);
    }
    ctx.restore();
  }
  function drawWorld(t){
    const s=world.scale;ctx.setTransform(devicePixelRatio*s,0,0,devicePixelRatio*s,0,0);
    ctx.clearRect(0,0,world.viewW,world.viewH);drawBackground(t);drawCelestialDetails(t);drawProps();drawPlatforms();
    // the neighbors
    for(const n of npcData){const x=n.x-world.camera;if(x<-70||x>world.viewW+70)continue;const near=Math.abs(n.x-player.x)<125;drawNeighbor(x,world.ground,n,t);
      if(!n.resolved&&near){let alpha=.73+.2*Math.sin(t*4);ctx.globalAlpha=alpha;ctx.strokeStyle='#fff3d4';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,world.ground-89,12,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.fillStyle='#fff2d6';ctx.font='bold 11px DM Sans';ctx.textAlign='center';ctx.fillText('E',x,world.ground-85);ctx.globalAlpha=1;}
      if(n.resolved){ctx.fillStyle='#ffde9e';ctx.font='14px serif';ctx.textAlign='center';ctx.fillText('✦',x,world.ground-91);}
    }
    // Country-colored combatants show the next encounter clearly; later foes wait in the mist.
    const nextEncounter=currentEncounter();
    for(const enemy of world.encounters){if(enemy.won)continue;const x=enemy.x-world.camera;if(x<-90||x>world.viewW+90)continue;const country=countries[enemy.region],isNext=enemy===nextEncounter,bossScale=enemy.boss?1.32:1;ctx.save();ctx.translate(x,world.ground-24+Math.sin(t*2+enemy.x)*5);ctx.globalAlpha=isNext ? .96 : .22;ctx.shadowColor=country.accent;ctx.shadowBlur=isNext?22:5;ctx.fillStyle=country.accent;ctx.beginPath();ctx.arc(0,-27,15*bossScale,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#263946';ctx.beginPath();ctx.arc(0,-27,10*bossScale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0c8';ctx.font=`bold ${enemy.boss?16:13}px serif`;ctx.textAlign='center';ctx.fillText(enemy.sigil,0,-23);if(isNext){ctx.globalAlpha=1;ctx.fillStyle='#fff3d4';ctx.font='bold 9px DM Sans';ctx.fillText(enemy.boss?'TYRANT':enemy.name.toUpperCase(),0,-58);ctx.strokeStyle=country.accent;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-27,21*bossScale,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    // Mira
    const px=player.x-world.camera;drawPerson(px,player.y+player.h,{isPlayer:true,walk:player.onGround?player.walk:0,air:player.air});
    // landing dust
    if(player.onGround&&Math.abs(player.vx)>10&&Math.random()<.17){world.particles.push({x:player.x+(Math.random()-.5)*12,y:player.y+player.h,vx:-player.vx*.008+(Math.random()-.5)*8,vy:-Math.random()*12,life:.45});}
    world.particles=world.particles.filter(p=>p.life>0);for(const p of world.particles){p.life-=1/60;p.x+=p.vx/60;p.y+=p.vy/60;ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle='#f3d9b3';ctx.beginPath();ctx.arc(p.x-world.camera,p.y,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  }
  function nearestNPC(){let best=null,dist=Infinity;for(const n of npcData){const d=Math.abs(n.x-player.x);if(d<dist){best=n;dist=d;}}return dist<98?best:null;}
  function startBattle(encounter){
    if(!encounter||encounter.won||world.battle)return;
    world.battle={encounter,actor:0,round:1};
    $('battleScreen').classList.remove('hidden');$('battleContinue').classList.add('hidden');
    $('battleTitle').textContent=encounter.name;$('enemyName').textContent=encounter.name;$('enemyMood').textContent=encounter.mood;$('enemySigil').textContent=encounter.sigil;
    setBattleLog(`${encounter.name} appears! Your party takes its places.`);renderBattle();playTone(360,.2);
  }
  function setBattleLog(text){$('battleLog').textContent=text;}
  function renderBattle(){
    const battle=world.battle;if(!battle)return;const enemy=battle.encounter;
    $('battleRound').textContent=`ROUND ${battle.round}`;$('enemyHpFill').style.width=`${Math.max(0,enemy.hp/enemy.maxHp*100)}%`;$('enemyHpText').textContent=`${Math.max(0,enemy.hp)} / ${enemy.maxHp} HP`;
    $('partyLineup').innerHTML=party.map((member,index)=>`<div class="party-member${member.hp<=0?' down':''}${index===battle.actor?' active':''}"><span class="party-icon">${member.icon}</span><div class="party-info"><strong>${member.name}<small>${member.role}</small></strong><div class="party-meter"><i style="width:${Math.max(0,member.hp/member.maxHp*100)}%"></i></div><small>${Math.max(0,member.hp)} HP · ${member.mp} MP</small></div></div>`).join('');
    const commands=$('battleCommands');commands.innerHTML='';const alive=party.filter(m=>m.hp>0);if(!alive.length)return;
    while(party[battle.actor].hp<=0)battle.actor=(battle.actor+1)%party.length;
    const actor=party[battle.actor];$('battlePrompt').textContent=`${actor.name}'s turn — choose a command`;
    [['⚔','Attack','A steady strike',()=>battleAction('attack')],['✧','Magic','Cast · 5 MP',()=>battleAction('magic')],['◈','Guard','Brace for the next hit',()=>battleAction('guard')]].forEach(([icon,title,desc,run])=>{const button=document.createElement('button');button.className='battle-command';button.innerHTML=`<span>${icon}</span><strong>${title}</strong><small>${desc}</small>`;button.addEventListener('click',run);commands.appendChild(button);});
  }
  function battleAction(action){
    const battle=world.battle;if(!battle)return;const enemy=battle.encounter,actor=party[battle.actor];let log='';
    if(action==='attack'){const damage=actor.attack+Math.floor(Math.random()*6);enemy.hp=Math.max(0,enemy.hp-damage);log=`${actor.name} attacks for ${damage} damage!`;}
    if(action==='magic'){if(actor.mp<5){setBattleLog(`${actor.name} is short on MP. Choose another command.`);return;}actor.mp-=5;const weakest=party.filter(m=>m.hp>0).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(weakest.hp/weakest.maxHp<.58){const healing=24+Math.floor(Math.random()*9);weakest.hp=Math.min(weakest.maxHp,weakest.hp+healing);log=`${actor.name} casts Mending Light. ${weakest.name} recovers ${healing} HP!`;}else{const damage=22+Math.floor(Math.random()*9);enemy.hp=Math.max(0,enemy.hp-damage);log=`${actor.name} casts Starfire for ${damage} damage!`;}}
    if(action==='guard'){actor.guard=true;log=`${actor.name} braces for the next attack.`;}
    setBattleLog(log);playTone(action==='magic'?820:action==='guard'?470:650,.1);
    if(enemy.hp<=0){setBattleLog(`${enemy.name} fades into a swirl of light. The way ahead is clear!`);enemy.won=true;world.battlesWon++;party.forEach(m=>{m.hp=Math.min(m.maxHp,m.hp+12);m.mp=Math.min(m.maxMp,m.mp+5);});$('battlePrompt').textContent='Victory! Your party catches its breath.';$('battleCommands').innerHTML='';$('battleContinue').classList.remove('hidden');return;}
    battle.actor++;while(battle.actor<party.length&&party[battle.actor].hp<=0)battle.actor++;
    if(battle.actor>=party.length){enemyTurn();return;}renderBattle();
  }
  function enemyTurn(){
    const battle=world.battle;if(!battle)return;const enemy=battle.encounter,targets=party.filter(m=>m.hp>0);
    targets.forEach((member,index)=>{const damage=Math.max(2,enemy.attack+Math.floor(Math.random()*5)-(member.guard?9:0));member.guard=false;member.hp=Math.max(0,member.hp-damage);});
    if(!party.some(m=>m.hp>0)){party.forEach(m=>{m.hp=Math.ceil(m.maxHp*.55);m.mp=Math.max(m.mp,Math.ceil(m.maxMp*.5));m.guard=false;});enemy.hp=enemy.maxHp;battle.actor=0;battle.round=1;setBattleLog('The party regroups by the path. Everyone recovers, and the encounter begins again.');renderBattle();return;}
    battle.round++;battle.actor=0;while(party[battle.actor].hp<=0)battle.actor++;setBattleLog(`${enemy.name} lashes out! Your party weathers the attack and regroups.`);renderBattle();
  }
  $('battleContinue').addEventListener('click',()=>{$('battleScreen').classList.add('hidden');world.battle=null;syncHUD();if(tyrantsDefeated()===countries.length){world.finished=true;setTimeout(showEnding,450);}else updateObjective();});
  function syncHUD(){const defeated=tyrantsDefeated(),percent=defeated/countries.length*100,region=regionAt(player.x),country=countries[region];ui.mission.textContent=`${defeated} of ${countries.length} tyrants defeated`;ui.progress.textContent=`${defeated}/${countries.length}`;ui.location.textContent=country.land.toUpperCase();ui.country.textContent=country.name.toUpperCase();document.querySelector('.progress-ring').style.background=`conic-gradient(from 0deg, #ffcf77 ${percent}%, transparent ${percent}%)`;document.querySelector('.progress-ring').style.border='2px solid rgba(255,255,255,.22)';}
  function updateObjective(){if(!world.started||world.finished)return;syncHUD();const near=nearestNPC(),next=currentEncounter();if(world.active){ui.objective.innerHTML='<span class="objective-icon">✦</span><span>Take your time with this conversation</span>';return;}if(near&&!near.resolved){ui.objective.innerHTML=`<span class="objective-icon">✦</span><span>Talk with ${near.name}</span><kbd>E</kbd>`;return;}if(!next){ui.objective.innerHTML='<span class="objective-icon">✿</span><span>Every crown has fallen</span>';return;}const country=countries[next.region],distance=Math.abs(next.x-player.x);if(distance<150){ui.objective.innerHTML=`<span class="objective-icon">⚔</span><span>${next.boss?'Confront':'Defeat'} ${next.name}</span>`;}else{ui.objective.innerHTML=`<span class="objective-icon">⌖</span><span>${encountersWon()} / ${world.encounters.length} encounters · Seek ${next.name} in ${country.name}</span>`;}}
  function update(dt){if(!world.started||world.finished)return;const move=(world.keys.right?1:0)-(world.keys.left?1:0);if(!world.active&&!world.battle){player.vx=move*245;if(move)player.face=move;player.x=clamp(player.x+player.vx*dt,35,world.worldW-35);if(move)player.walk+=dt;else player.walk*=.82;
      if(world.jumpQueued&&player.onGround){player.vy=-570;player.onGround=false;player.air=1;}
      player.vy+=1450*dt;let oldY=player.y;player.y+=player.vy*dt;player.onGround=false;
      const groundTop=world.ground-player.h;if(player.y>=groundTop){player.y=groundTop;player.vy=0;player.onGround=true;}
      for(const p of platforms){const top=platformY(p)-3;if(player.x+player.w*.32>p.x&&player.x-player.w*.32<p.x+p.w&&oldY+player.h<=top+12&&player.y+player.h>=top&&player.vy>=0){player.y=top-player.h;player.vy=0;player.onGround=true;}}
      for(const k of keepsakes){if(!k.taken&&Math.abs(k.x-player.x)<32&&Math.abs((player.y+player.h)- (platformY(platforms[k.p])-10))<40){k.taken=true;world.collected++;showToast(k.label+' · keepsake found');}}
      if(world.talkQueued){const n=nearestNPC();if(n&&!n.resolved)openConversation(n);else if(n?.resolved)showToast(`${n.name}: “It feels different already.”`);else showToast('Get a little closer to someone to talk.');}
    }
    world.jumpQueued=false;world.talkQueued=false;
    if(!world.active&&!world.battle){const encounter=currentEncounter();if(encounter&&Math.abs(encounter.x-player.x)<48)startBattle(encounter);}
    const target=clamp(player.x-world.viewW*.38,0,world.worldW-world.viewW);if(!world.battle)world.camera+=(target-world.camera)*Math.min(1,dt*4.5);
    if(world.toastTimer>0){world.toastTimer-=dt;if(world.toastTimer<=0)ui.toast.classList.remove('show');}
    updateObjective();
  }
  function openConversation(n){
    if(!n||n.resolved||world.active)return;
    world.active=n;world.talkQueued=false;
    ui.npcName.textContent=n.name;ui.npcRole.textContent=n.title;ui.npcMood.textContent=n.mood;ui.npcPortrait.textContent=n.symbol;
    const bond=Math.min(100,Math.round(n.trust/6*100));ui.bondFill.style.width=bond+'%';ui.bondValue.textContent=bond+'%';ui.turn.textContent=`TURN ${n.turns+1}`;ui.dialogueText.textContent=n.turns?'Let’s pick up where we left off. What feels like a good next step?':n.greeting;
    renderChoices();ui.dialogue.classList.remove('hidden');playTone(540,.08);
  }
  function renderChoices(){
    if(!world.active)return;
    ui.choices.innerHTML='';
    actions.forEach(action=>{
      const button=document.createElement('button');button.type='button';button.className='choice';
      button.innerHTML=`<span class="choice-icon">${action.icon}</span><strong>${action.title}</strong><small>${action.desc}</small><span class="trait-tag">${action.tag}</span>`;
      button.addEventListener('click',()=>chooseAction(action));ui.choices.appendChild(button);
    });
  }
  function chooseAction(action){
    const n=world.active;if(!n||n.resolved)return;
    const trait=stats[action.key]||0;const preferred=action.id===n.likes;
    const points=1+(trait>=4?1:0)+(preferred?2:0);
    n.trust=clamp(n.trust+points,0,8);n.turns++;world.turns++;
    const bond=Math.min(100,Math.round(n.trust/6*100));ui.bondFill.style.width=bond+'%';ui.bondValue.textContent=bond+'%';
    ui.turn.textContent=`TURN ${n.turns+1}`;
    const replies={
      listen:`Mira gives ${n.name} room to finish. ${preferred?'They feel understood.':'Their shoulders ease a little.'}`,
      share:`Mira offers an honest piece of her own story. ${preferred?'A familiar thread appears between them.':'The conversation feels a little less guarded.'}`,
      encourage:`Mira points toward a possibility they might build together. ${preferred?'A spark of hope catches.':'They consider the idea quietly.'}`,
      promise:`Mira offers one small step she can truly keep. ${preferred?'The sincerity earns a nod.':'The offer gives them something concrete to consider.'}`
    };
    ui.dialogueText.textContent=replies[action.id];playTone(preferred?720:590,.09);
    if(n.trust>=6){
      ui.dialogueText.textContent=n.agree;ui.npcMood.textContent='A little more hopeful';
      ui.choices.innerHTML='';const finish=document.createElement('button');finish.type='button';finish.className='choice';finish.innerHTML='<span class="choice-icon">✦</span><strong>Seal the agreement</strong><small>Leave this neighbor with a plan you can share</small><span class="trait-tag">COMMON GROUND</span>';
      finish.addEventListener('click',()=>finishConversation(n));ui.choices.appendChild(finish);playTone(880,.16);
    }else{ui.turn.textContent=`TURN ${n.turns+1} · KEEP GOING`;renderChoices();}
  }
  function finishConversation(n){
    if(!n||world.active!==n)return;
    n.resolved=true;world.agreements++;syncHUD();world.active=null;ui.dialogue.classList.add('hidden');
    showToast(`${n.name} found common ground with you.`);playTone(660,.2);updateObjective();
  }
  function closeConversation(){if(!world.active)return;world.active=null;ui.dialogue.classList.add('hidden');updateObjective();}
  function showEnding(){
    ui.finalTurns.textContent=world.turns;ui.finalItems.textContent=world.collected;$('finalBattles').textContent=world.battlesWon;
    ui.ending.classList.remove('hidden');ui.dialogue.classList.add('hidden');
  }
  function resetGame(){
    world.started=false;world.finished=false;world.active=null;world.battle=null;world.agreements=0;world.turns=0;world.collected=0;world.battlesWon=0;world.camera=0;world.keys.left=false;world.keys.right=false;
    npcData.forEach(n=>{n.resolved=false;n.trust=0;n.turns=0;});keepsakes.forEach(k=>k.taken=false);world.encounters.forEach(e=>{e.won=false;e.hp=e.maxHp;});party.forEach(m=>{m.hp=m.maxHp;m.mp=m.maxMp;m.guard=false;});
    player.x=100;player.y=world.ground-player.h;player.vx=0;player.vy=0;player.face=1;player.onGround=false;player.walk=0;
    ui.ending.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.welcome.classList.remove('hidden');syncHUD();updateObjective();
  }
  let audioContext=null;
  function playTone(frequency,duration){
    if(!world.sound)return;
    try{audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration);}catch(_){/* Audio is optional; gameplay remains silent if unavailable. */}
  }
  function beginGame(){ui.welcome.classList.add('hidden');ui.ending.classList.add('hidden');world.started=true;player.y=world.ground-player.h;player.vy=0;updateObjective();}
  ui.start.addEventListener('click',beginGame);
  $('playAgain').addEventListener('click',resetGame);
  $('closeDialog').addEventListener('click',closeConversation);
  $('helpBtn').addEventListener('click',()=>ui.help.classList.remove('hidden'));
  $('closeHelp').addEventListener('click',()=>ui.help.classList.add('hidden'));
  $('gotIt').addEventListener('click',()=>ui.help.classList.add('hidden'));
  $('soundBtn').addEventListener('click',event=>{world.sound=!world.sound;event.currentTarget.classList.toggle('sound-on',world.sound);event.currentTarget.setAttribute('aria-label',world.sound?'Mute sound':'Enable sound');if(world.sound){playTone(660,.1);showToast('Soft sounds on');}else showToast('Sound off');});
  $('touchTalk').addEventListener('pointerdown',event=>{event.preventDefault();if(world.started&&!world.active)world.talkQueued=true;});
  document.querySelectorAll('.touch-btn[data-key]').forEach(button=>{
    const key=button.dataset.key;
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);if(key==='jump'){if(world.started&&!world.active)world.jumpQueued=true;}else world.keys[key]=true;});
    const release=event=>{if(key!=='jump')world.keys[key]=false;};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  });
  addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    if(['arrowleft','arrowright',' ','arrowup'].includes(key))event.preventDefault();
    if(key==='escape'){if(!ui.help.classList.contains('hidden'))ui.help.classList.add('hidden');else closeConversation();return;}
    if(!world.started||world.finished)return;
    if(key==='arrowleft'||key==='a')world.keys.left=true;
    if(key==='arrowright'||key==='d')world.keys.right=true;
    if(key===' '||key==='arrowup'||key==='w')world.jumpQueued=true;
    if(key==='e'||key==='enter'){if(world.active){const finish=ui.choices.querySelector('.choice');if(finish&&ui.choices.childElementCount===1)finish.click();}else world.talkQueued=true;}
  });
  addEventListener('keyup',event=>{const key=event.key.toLowerCase();if(key==='arrowleft'||key==='a')world.keys.left=false;if(key==='arrowright'||key==='d')world.keys.right=false;});
  document.addEventListener('visibilitychange',()=>{world.last=0;world.keys.left=false;world.keys.right=false;});
  syncHUD();updateObjective();
  function frame(ms){const t=ms/1000,dt=world.last?Math.min(.035,(ms-world.last)/1000):.016;world.last=ms;world.now=t;update(dt);drawWorld(t);requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
