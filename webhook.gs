function doPost(e) {
  var lock = LockService.getUserLock()
  if (lock.tryLock(500)) {

  let event = JSON.parse(e.postData.contents).events[0];

  // TODO: メンバー参加時に出るポップ
  // https://developers.line.biz/ja/reference/messaging-api/#member-joined-event

  debugSheet.getRange(debugSheet.getLastRow()+1,1).setValue(event)

  if(event.type === "postback") {
    const sigCheckResult = signatureCheck(event.postback.data.split("$")[1])
    if(!sigCheckResult){return false}
    participant(event)
  }

  if(event.type === "message") {
    let message = event.message.text
    const getIdRegex = new RegExp('getId', 'gi');
    if(getIdRegex.test(message)) {
      getId(event)
    }
  }
      // console.log("locked")
    lock.releaseLock();
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
  postParticipant(date, username)
}

function setParticipant(date, username, userId) {
  setRow = countPeopleSheet.getLastRow() +1
  countPeopleSheet.getRange(setRow,1).setValue(date)
  countPeopleSheet.getRange(setRow,2).setValue(userId)
  countPeopleSheet.getRange(setRow,3).setValue(username)
}

function postParticipant(date, username) {
  const countJsonData = getCountListSheet()
  let countListSheet = countJsonData.countListSheet

  let places = countListSheet.getRange(3,1,1,countListSheet.getLastColumn()).getValues()
  let n=1
  for(i=0;i<places[0].filter(String).length;i++){
    if(places[0][i] === date) {
      break
    } else {
      n++
    }
  }
  
  let data = countListSheet.getRange(4,n,countListSheet.getLastRow()).getValues().flat()

  if(data.includes(username)) {
    for(i=0;i<data.filter(String).length;i++){
      if(data[i] === username) {
        const delCell = countListSheet.getRange(i+4, n)
        delCell.deleteCells(SpreadsheetApp.Dimension.ROWS)
      }
    }
  } else {
    index = (data.filter(String).length)+3
    countListSheet.getRange(index+1,n).setValue(username)
  }
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