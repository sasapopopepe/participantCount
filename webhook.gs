function doPost(e) {
  let event = JSON.parse(e.postData.contents).events[0];

  // TODO: signatureCheck(event)

  // TODO: メンバー参加時に出るポップ
  // https://developers.line.biz/ja/reference/messaging-api/#member-joined-event

  debugSheet.getRange(debugSheet.getLastRow(),1).setValue(event)

  if(event.type === "postback") {
    participant(event)
  }

  let message = event.message.text
  const getIdRegex = new RegExp('getId', 'gi');
  if(getIdRegex.test(message)) {
    getId(event)
  }
}

function signatureCheck(event) {
  // https://developers.google.com/apps-script/reference/utilities/utilities?hl=ja#computeHmacSha256Signature(Byte,Byte)
  event = "{timestamp=1.676748892506E12, webhookEventId=xxxx, mode=active, replyToken=yyyy, deliveryContext={isRedelivery=false}, source={userId=bbbb, type=group, groupId=wwww}, postback={data=2023/1/26(日)12-15時:卓球}, type=postback}"
  
  let key = channelSecret
  let input = event
  let signature = Utilities.computeHmacSha256Signature(input, key);
  let sig = signature.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');

  Logger.log(sig);

}

function participant(event) {
  let url = "https://api.line.me/v2/bot/profile/" + event.source.userId
  let params = {
    method:'GET',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
  }
  let responseData = UrlFetchApp.fetch(url, params).getContentText()
  let username = JSON.parse(responseData).displayName

  let date = event.postback.data
  setParticipant(date, username, event.source.userId)
  postParticipant(date, username, event.source.userId)
}

function setParticipant(date, username, userId) {
  setRow = countPeopleSheet.getLastRow() +1
  countPeopleSheet.getRange(setRow,1).setValue(date)
  countPeopleSheet.getRange(setRow,2).setValue(userId)
  countPeopleSheet.getRange(setRow,3).setValue(username)
}

function postParticipant(date, username, userId) {

  let url = "https://api.line.me/v2/bot/message/push"

  let countData = countPeopleSheet.getRange(2,1, countPeopleSheet.getLastRow()-1, 2).getValues()
  var count = 0
  for(i=0;i<countData.length;i++){
    if(date === countData[i][0] && userId === countData[i][1]) {
      count++
    }
  }
  if(count % 2 === 1) {
    var payload = {
      to: groupId,
      messages:[
        {
          type:"text",
          text:username+"さんが"+date+"参加と投票しました"
        }
      ]
    }
  } else {
    var payload = {
      to: groupId,
      messages:[
        {
          type:"text",
          text:username+"さんが"+date+"参加の投票を取り消しました"
        }
      ]
    }
  }

  let params = {
    method:'POST',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    payload:(JSON.stringify(payload))
  }

  debugSheet.getRange(1,4).setValue(params)
  UrlFetchApp.fetch(url, params)
}

// Get userId, groupId function
function getId(event) {

  // typeを取得 
  let type = event.source.type;

  // typeを判定して、idを取得
  if (type == 'user') {
    var id = event.source.userId;
  } else if (type == 'group') {
    var id = event.source.groupId;
  } else if (type == 'room') {
    var id = event.source.roomId;
  }

  let channelName = event.message.text
  const regex = /(?<=getId)(.*)/gi;
  channelName = channelName.match(regex)

  setRow = idSheet.getLastRow() +1
  idSheet.getRange(setRow,1).setValue(channelName)
  idSheet.getRange(setRow,2).setValue(id)
}



