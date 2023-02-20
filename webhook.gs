function doPost(e) {
  let event = JSON.parse(e.postData.contents).events[0];

  // TODO: メンバー参加時に出るポップ
  // https://developers.line.biz/ja/reference/messaging-api/#member-joined-event

  debugSheet.getRange(debugSheet.getLastRow()+1,1).setValue(event)

  if(event.type === "postback") {
    const sigCheckResult = signatureCheck(event.postback.data.split("$")[1])
    if(!sigCheckResult){return false}
    participant(event)
  }

  let message = event.message.text
  const getIdRegex = new RegExp('getId', 'gi');
  if(getIdRegex.test(message)) {
    getId(event)
  }
}

function signatureCheck(postSigunature) {
  let key = channelSecret
  let value = sigunatureSheet.getRange(2,1).getValue()
  let signature = Utilities.computeHmacSha256Signature(value, key);
  let sig = signature.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');

  // debugSheet.getRange(debugSheet.getLastRow()+1,2).setValue("postSigunature is "+postSigunature)
  // debugSheet.getRange(debugSheet.getLastRow()+1,3).setValue("sig            is "+sig)

  return (sig === postSigunature)

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

  // let date = event.postback.data
  let date = event.postback.data.split("$")[0]
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



