// Browser adaptation of cocos56/Baby-s_36_Skills. GPL-3.0.
export const questions = [
 {x:34,title:'礼物的邀请',quote:'小朋友，我有一个礼物给你。和我到前面的车里看看吧！',options:[{text:'先问照顾我的大人，不单独去',safe:true},{text:'礼物很有趣，跟着去看看',safe:false}],yes:'你保护了自己！想看礼物，也要先问照顾你的大人，不能单独跟人去车里。',no:'先停一停。再喜欢的礼物，也不值得一个人跟人离开。先问照顾你的大人。'},
 {x:58,title:'有人请你带路',quote:'我找不到熊猫馆了。你能离开这里，带我过去吗？',options:[{text:'我认识路，自己带他过去',safe:false},{text:'请他找工作人员，我留在这里',safe:true}],yes:'热心也有安全的方法。大人可以找工作人员帮忙，你不用独自离开。',no:'你很愿意帮忙！不过，大人可以找工作人员问路，你不用单独带路。'},
 {x:79,title:'好吃的在外面',quote:'为了谢谢你，我带你出去吃冰淇淋吧，很快就回来！',options:[{text:'很快就回来，跟着去也没关系',safe:false},{text:'不单独离开，先找照顾我的大人',safe:true}],yes:'做得好！不管对方说多久，也不管是否认识，都先和照顾你的大人确认。',no:'“很快回来”也要先确认。不管认不认识对方，都不要瞒着照顾你的大人离开。'}
];
export const createGame=()=>({phase:'ready',x:9,completed:0,correct:null,choice:null});
export function start(s){if(s.phase==='ready')s.phase='explore';}
export function move(s,x){if(s.phase==='explore'&&Number.isFinite(x))s.x=Math.max(5,Math.min(94,x));}
export function encounter(s){if(s.phase==='explore'&&s.completed<questions.length&&Math.abs(s.x-questions[s.completed].x)<7)s.phase='question';}
export function answer(s,index){if(s.phase!=='question'||!Number.isInteger(index))return;const option=questions[s.completed].options[index];if(!option)return;s.choice=s.completed;s.correct=option.safe;if(option.safe)s.completed++;s.phase='feedback';}
export function continueGame(s){if(s.phase!=='feedback')return;s.phase=s.correct?'explore':'question';s.correct=null;s.choice=null;}
export function finish(s){if(s.phase==='explore'&&s.completed===questions.length&&s.x>=90)s.phase='won';}
