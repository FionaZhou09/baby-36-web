import {createGame,start,move,encounter,answer,continueGame,finish,questions} from './state.js';
const $=id=>document.getElementById(id);
let game=createGame(), target=null, direction=0, sound=true, lastTime=0;
const talk=$('conversation'), help=$('help'), win=$('win');
const canSpeak='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function stopSpeech(){if(canSpeak)window.speechSynthesis.cancel();}
function speak(text){stopSpeech();if(!sound||!canSpeak)return;try{const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.85;const voice=speechSynthesis.getVoices().find(v=>/^zh[-_](CN|Hans)/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^zh/i.test(v.lang));if(voice)u.voice=voice;speechSynthesis.speak(u);}catch{/* Voice availability must never stop gameplay. */}}
function stopMotion(){direction=0;target=null;$('tap-marker').hidden=true;$('hero').classList.remove('walking');}
function currentReading(){if(game.phase==='feedback'){const q=questions[game.choice];return game.correct?q.yes:q.no;}if(game.phase==='question'){const q=questions[game.completed];return `${q.quote}。你会怎么做？${q.options.map((o,i)=>`选项${i+1}，${o.text}`).join('。')}`;}return '';}
function displayDialogue(){
 const feedback=game.phase==='feedback', q=questions[feedback?game.choice:game.completed];
 $('dialog-step').textContent=`挑战 ${ (feedback?game.choice:game.completed)+1} / 3`;
 $('dialog-title').textContent=feedback?(game.correct?'你想到了安全的办法！':'停一停，再想一想'):q.title;
 $('quote').textContent=q.quote;
 $('prompt').hidden=feedback;$('choices').hidden=feedback;$('feedback').hidden=!feedback;
 if(feedback){$('explanation').textContent=game.correct?q.yes:q.no;$('continue').textContent=game.correct?(game.completed===3?'回集合点':'继续探险'):'再选一次';}
 else{$('choices').replaceChildren(...q.options.map((o,i)=>{const b=document.createElement('button');b.textContent=o.text;b.addEventListener('click',()=>{answer(game,i);render();displayDialogue();});return b;}));}
 if(!talk.open)talk.showModal();
 if(feedback)$('continue').focus();else $('choices').querySelector('button').focus();
 speak(currentReading());
}
function render(){
 $('hero').style.left=game.x+'%';
 $('count').textContent=`${game.completed} / 3`;
 document.querySelector('.progress').setAttribute('aria-label',`已完成${game.completed}个挑战，共3个`);
 document.querySelectorAll('.stamp').forEach((el,i)=>el.classList.toggle('done',i<game.completed));
 $('visitor').hidden=game.completed===3;
 if(game.completed<3)$('visitor').style.left=questions[game.completed].x+'%';
 $('goal').hidden=game.completed<3;
 const exploring=game.phase==='explore';
 for(const id of ['left','right','visitor'])$(id).disabled=!exploring;
 $('action').disabled=!(exploring||game.phase==='ready');
 if(game.phase==='ready'){$('task').textContent='沿小路走，找到前面的角色';$('action').innerHTML='开始探险<svg aria-hidden="true"><use href="#arrow"/></svg>';}
 else if(exploring){$('task').textContent=game.completed===3?'三个挑战完成了，回到右边的集合点吧！':`挑战 ${game.completed+1}：${questions[game.completed].title}`;$('action').textContent=game.completed===3?'走到集合点':'走过去聊一聊';}
 else if(game.phase==='feedback')$('task').textContent=game.correct?'获得一枚安全印章！':'没关系，听完提示再试一次';
 else if(game.phase==='won')$('task').textContent='今天的安全探险完成了！';
}
function go(x){if(game.phase!=='explore'||help.open)return;target=x;direction=0;$('tap-marker').style.left=x+'%';$('tap-marker').hidden=false;}
function nextDestination(){go(game.completed<3?questions[game.completed].x:94);}
$('action').addEventListener('click',()=>{if(game.phase==='ready'){start(game);render();speak('开始探险！点小路走到前面的角色身边，想一想你会怎么做。');}else nextDestination();});
$('visitor').addEventListener('click',nextDestination);$('goal').addEventListener('click',nextDestination);
$('stage').addEventListener('click',e=>{if(e.target.closest('button'))return;const r=$('stage').getBoundingClientRect();if((e.clientY-r.top)/r.height<.56)return;go(Math.max(5,Math.min(94,(e.clientX-r.left)/r.width*100)));});
$('continue').addEventListener('click',()=>{continueGame(game);if(game.phase==='question')displayDialogue();else{talk.close();stopSpeech();render();$('action').focus();}});
$('read').addEventListener('click',()=>speak(currentReading()));
$('sound').addEventListener('click',()=>{sound=!sound;stopSpeech();$('sound').textContent=sound?'声音：开':'声音：关';$('sound').setAttribute('aria-pressed',String(sound));$('read').disabled=!sound||!canSpeak;if(sound)speak('声音已打开');});
if(!canSpeak){sound=false;$('sound').textContent='语音不可用';$('sound').disabled=true;$('sound').setAttribute('aria-pressed','false');$('read').disabled=true;}
$('parents').addEventListener('click',()=>{stopMotion();stopSpeech();help.showModal();});
$('close-help').addEventListener('click',()=>help.close());
function reset(){stopMotion();stopSpeech();for(const d of [talk,help,win])if(d.open)d.close();game=createGame();render();$('action').focus();}
$('restart').addEventListener('click',reset);$('play-again').addEventListener('click',reset);
talk.addEventListener('cancel',e=>e.preventDefault());win.addEventListener('cancel',e=>{e.preventDefault();reset();});
for(const [id,sign] of [['left',-1],['right',1]]){const b=$(id);b.addEventListener('pointerdown',e=>{if(game.phase!=='explore'||help.open)return;e.preventDefault();b.setPointerCapture(e.pointerId);target=null;direction=sign;});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{direction=0;});b.addEventListener('click',e=>{if(e.detail===0)go(game.x+sign*9);});}
window.addEventListener('keydown',e=>{if(game.phase!=='explore'||help.open||talk.open||win.open)return;const dirs={ArrowLeft:-1,a:-1,A:-1,ArrowRight:1,d:1,D:1};if(dirs[e.key]){e.preventDefault();target=null;direction=dirs[e.key];}});
window.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key))direction=0;});
window.addEventListener('blur',()=>{stopMotion();stopSpeech();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMotion();stopSpeech();}});
function tick(now){const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;
 if(game.phase==='explore'&&!help.open){
  let next=game.x;
  if(direction)next+=direction*22*dt;
  else if(target!==null){const delta=target-game.x;next+=Math.sign(delta)*Math.min(Math.abs(delta),22*dt);if(Math.abs(delta)<.1){target=null;$('tap-marker').hidden=true;}}
  const moving=Math.abs(next-game.x)>.001;move(game,next);$('hero').classList.toggle('walking',moving);$('hero').style.left=game.x+'%';
  encounter(game);finish(game);
  if(game.phase==='question'){stopMotion();render();displayDialogue();}
  else if(game.phase==='won'){stopMotion();render();win.showModal();speak('安全小卫士，就是你！三个安全选择都完成了。和家长说说，你记住了哪一个办法？');}
 }
 requestAnimationFrame(tick);
}
render();requestAnimationFrame(tick);
