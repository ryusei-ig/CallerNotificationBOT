//Discord.js
const Discord = require('discord.js');
const client = new Discord.Client();

//eris
const Eris = require("eris");

//config.json
const config = require("../config.json");

//通知用チャンネル
const CHANNELNAME = 'テスト';

//通話開始フラグ
var vc_connected = new Boolean(false);

var bot = new Eris(config.TOKEN);

//通話中の人数カウント用変数
var userCounter = 0;

//ログ用日付フォーマット作成関数
function formatDate(date, format) {

  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours() + 9).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));

  return format;
}
//console.log( formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') );


bot.on('ready', ( ) => {
  console.log('ログインしました。');
  console.log( formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') );
});

bot.on("voiceChannelJoin", (member, newChannel) => {
  const channel = newChannel.guild.channels.find((channel) => channel.name === CHANNELNAME);
  // 誰かがボイスチャンネルに入った時に行う処理
  console.log("%s が チャンネル %s に入室しました。",  member.username, newChannel.name); 
  //誰かが最初に入った時を初回として、1人めに入った人を引っ掛けて通知する。
  if(vc_connected == false){
    console.log("[1st]%s が チャンネル %s に入室しました。", member.username, newChannel.name); 
    channel.createMessage("(テスト中)通話が始まったっぽいです。開始時間:" + formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') );
    vc_connected = Boolean(true);
    console.log(vc_connected);
    //初回のみ入室カウントを2にする。
    userCounter += 2;
  } else{
    userCounter += 1;
  }
});


bot.on("voiceChannelLeave", (member, oldChannel) => { 
  // 誰かがボイスチャンネルから離れた時に行う処理
  //退室者のカウント減
  userCounter -= 1;
  console.log("%s が チャンネル %s から退室しました。",member.username, oldChannel.name); 
  const channel = oldChannel.guild.channels.find((channel) => channel.name === CHANNELNAME);

  //チャネルから全員の接続が無くなったら通知する。
  //if (!oldChannel.voiceMembers.find((member) => member.id == null)){
  if (userCounter == 1){
    console.log("誰もいないよ");
    channel.createMessage("(テスト中)通話が終わったっぽいです。終了時間:" + formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') ); 
    vc_connected = Boolean(false);
    userCounter = 0;
  }
});

bot.on("voiceChannelSwitch", (member, newChannel, oldChannel) => {
  // 誰かがボイスチャンネルを移動した時に行う処理です。
  console.log("%s が チャンネル %s から %s に移動しました。", member.username, oldChannel.name, newChannel.name);
});

//セッションにログイン
bot.connect();

