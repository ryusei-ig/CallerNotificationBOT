//Discord.js
const Discord = require('discord.js');
const client = new Discord.Client();

//eris
const Eris = require("eris");

//config.json
const config = require("../config.json");
var bot = new Eris(config.TOKEN);

//channellist.json
const ChannelLists = require("../channellists.json");

class channelData {

  constructor () {
    this.channelId = 0;
    this.channel = "";
    this.vc_connected = new Boolean(false);
    this.userCounter = 0;
    this.firstCaller =　"";
    this.vcGuestname = "";
    this.vcMember = "";
  }


  //getter
  get ChannelId(){
    return this.channelId;
  }

  get Channel(){
    return this.channel;
  }

  get Vc_Connected(){
    return this.vc_connected;
  }

  get UserCounter(){
    return this.userCounter;
  }

  get FirstCaller(){
    return this.firstCaller;
  }

  get VcGuestName(){
    return this.vcGuestname;
  }

  get VcMember(){
    return this.vcMember;
  }

  //setter

  set Channel(x){
    this.channel = x;
  }
  set ChannelId(x){
    this.channelId = x;
  }
  set Vc_Connected(x){
    this.vc_connected = x;
  }

  set UserCounter(x){
    this.userCounter = x;
  }

  set FirstCaller(x){
    this.firstCaller = x;
  }

  set VcGuestName(x){
    this.vcGuestname = x;
  }

  set VcMember(x){
    this.vcMember = x;
  }
}

  //ログ用日付フォーマット作成メソッド
  function formatDate(date, format) {

    //仕様上日本時間を指定しないと世界標準時になるため9時間ずらす
      var timezoneoffset = -9 
      var fakeUTC = new Date(date.getTime() - (timezoneoffset * 60 - new Date().getTimezoneOffset()) * 60000);
    
      format = format.replace(/YYYY/g, fakeUTC.getFullYear());
      format = format.replace(/MM/g, ('0' + (fakeUTC.getMonth() + 1)).slice(-2));
      format = format.replace(/DD/g, ('0' + fakeUTC.getDate()).slice(-2));
      format = format.replace(/hh/g, ('0' + fakeUTC.getHours()).slice(-2));
      format = format.replace(/mm/g, ('0' + fakeUTC.getMinutes()).slice(-2));
      format = format.replace(/ss/g, ('0' + fakeUTC.getSeconds()).slice(-2));
    
      return format;
    };


// for(var i = 0; i <= Object.keys(ChannelLists).length; i++) {
//   var result = Object.keys(ChannelLists.channelLists[i]).filter( (key) => { 
//     return ChannelLists.channelLists[i][key] === 'victor窓'
//   });
// }

let channeldata = new channelData();

bot.on('ready', ( ) => {
  console.log('ログインしました。');
  console.log( formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') );
});

bot.on("voiceChannelJoin", (member, newChannel) => {
  /**
   * ログイン処理
   * ボイスチャネル接続時に登録されてるIDだけクラスをインスタンス化する。
   */
  for(var i = 0; i <= Object.keys(ChannelLists.channelLists).length; i++) {
    var result = Object.keys(ChannelLists.channelLists[i]).filter( (key) => { 
      return ChannelLists.channelLists[i][key] === newChannel.id
    });
    console.log(Object.keys(ChannelLists).length);
    console.log(result);
    if (result == 'voiceChannelId') {
      channeldata.ChannelId = ChannelLists.channelLists[i].notificationChannelId
      break;
    } 
  }
  result = null;

  const channel = newChannel.guild.channels.find((channel) => channel.id === channeldata.ChannelId);
  // 誰かがボイスチャンネルに入った時に行う処理
  console.log("%s が チャンネル %s に入室しました。",  member.username, newChannel.name); 
  //誰かが最初に入った時を初回として、1人めに入った人を引っ掛けて通知する。
  if(channeldata.Vc_Connected == false){
    channeldata.channel = channel;
    if(!member.nick){ channeldata.FirstCaller = member.username } else { channeldata.FirstCaller = member.nick };
    channeldata.VcMember = channeldata.FirstCaller + "\n";

    console.log("[1st]%s が チャンネル %s に入室しました。", member.username, newChannel.name); 
    
    //メッセージ作成・チャット出力
    channeldata.Channel.createMessage({
      content:"@everyone 通話を始めました。\n開始時間:" 
        + formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss') + 
        "\n始めた人：["+ channeldata.FirstCaller + "]さん",
      disableEveryone:false});
    channeldata.Vc_Connected = Boolean(true);
  
    //初回のみ入室カウントを2にする。
    channeldata.UserCounter = channeldata.UserCounter + 2;
  } else{
    if(!member.nick){ channeldata.VcGuestName = member.username } else { channeldata.VcGuestName= member.nick };
    if(!channeldata.VcMember.match(channeldata.VcGuestName)) { 
      channeldata.VcMember = channeldata.VcMember + channeldata.VcGuestName + "\n" }
    channeldata.UserCounter = channeldata.UserCounter + 1;
  }
});


// 誰かがボイスチャンネルから離れた時に行う処理
bot.on("voiceChannelLeave", (member, oldChannel) => { 
  //退室者のカウント減
  channeldata.UserCounter = channeldata.UserCounter - 1;
  console.log("%s が チャンネル %s から退室しました。",member.username, oldChannel.name); 

  //チャネルから全員の接続が無くなったら通知する。
  //メッセージ作成・チャット出力
  if (channeldata.UserCounter == 1){
    console.log("誰もいないよ");
    channeldata.Channel.createMessage("通話が終わりました。\n終了時間:"
       + formatDate(new Date(), 'YYYY/MM/DD hh:mm:ss')
       + "\n----------参加者一覧----------\n" + channeldata.vcMember +"\n------------------------------" ); 
    channeldata.Vc_Connected = Boolean(false);

    //初期化
    channeldata.UserCounter = 0;
    channeldata.VcMember = "";
  }
});

bot.on("voiceChannelSwitch", (member, newChannel, oldChannel) => {
  // 誰かがボイスチャンネルを移動した時に行う処理です。
  console.log("%s が チャンネル %s から %s に移動しました。", member.username, oldChannel.name, newChannel.name);
});

//メッセージに対しての処理
bot.on("messageCreate",(message) => {
  console.log("fire:" + message.clearContent);

  //自分の発言に反応しないようにBOT以外の発言をイベントとして受け取る
  if(message.member.bot) return

  //勝率計算
  var winrateRE = /勝率計算:累計\d{1,6}現在\d{1,6}$/;
  if(message.content.match(winrateRE)){
    var totalMasterPoint = message.content.replace("勝率計算:","").replace("累計","").replace(/現在\d{1,6}/,"");
    var masterPoint = message.content.replace("勝率計算:","").replace(/累計\d{1,6}/,"").replace("現在","");

    console.log( totalMasterPoint + "," + masterPoint);
    //簡易勝率計算
    var winrate = parseInt(totalMasterPoint) / (parseInt(totalMasterPoint) + parseInt(masterPoint))　* 100;
    message.channel.createMessage(message.member.mention +"勝率:" + winrate + "%");
  }

});

//セッションにログイン
bot.connect();
