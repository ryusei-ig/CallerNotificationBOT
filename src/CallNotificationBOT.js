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

  //自分の発言に反応しないようにBOT以外の発言をイベントとして受け取る
  if(message.member.bot) return

});

//セッションにログイン
bot.connect();
