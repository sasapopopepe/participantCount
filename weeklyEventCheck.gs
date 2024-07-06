function weeklyEventCheck() {
  const countJsonData = getCountListSheet()
  const countListSheetId = countJsonData.countListSheetId
  const countListSheet = countJsonData.countListSheet
  const calendar = getCalendar()

  // https://gist.github.com/xl1/6d5f120c42be56b215f1
  var lock = LockService.getScriptLock();
  if (lock.tryLock(500)) {

    let startDate = new Date()
    startDate.setHours(00)
    startDate.setMinutes(00)
    startDate.setSeconds(00)
    startDate.setMilliseconds(00)
    startDate.setDate(startDate.getDate() +5)
    let endDate = new Date()
    console.log(startDate +"\nEnddate is "+ endDate)
    endDate.setHours(00)
    endDate.setMinutes(00)
    endDate.setSeconds(00)
    endDate.setMilliseconds(00)
    endDate.setDate(endDate.getDate() +12)
    console.log(startDate +"\nEnddate is "+ endDate)

    const events = calendar.getEvents(startDate, endDate)

    var sendEvents = []
    var dayOfWeeks = [ "日", "月", "火", "水", "木", "金", "土" ]
    var count = 1
    if (events.length !== 0) {
      // 予定の件数だけ実行
      for (event in events) {
        // 予定のタイトルを取得
        let title = events[event].getTitle();

        if(/卓球/g.test(title)) {
          let year = events[event].getStartTime().getFullYear()
          let month = events[event].getStartTime().getMonth()+1
          let day = events[event].getStartTime().getDate()
          let dayOfWeek = dayOfWeeks[events[event].getStartTime().getDay()]
          let startHour = events[event].getStartTime().getHours()
          let endHour = events[event].getEndTime().getHours()
          let eventDetail = month + "/" + day + "(" + dayOfWeek + ")" + startHour +"-"+ endHour + "時:" + title

          countListSheet.getRange(3,count).setValue(year + "/" + eventDetail)
          eventDetail = month + "/" + day + "(" + dayOfWeek + ")" + startHour +"-"+ endHour + "時:" + title + ";" + year
          count++
          
          sendEvents.push(eventDetail)
        }

      }
      // console.log(sendEvents)
      sendVoteMessage(sendEvents, countListSheetId)
    }
      // console.log("locked")
    lock.releaseLock();
  }
}

function weeklyParticipantCount() {
  if(countPeopleSheet.getRange("A2").isBlank()) {return}

  const participants = countPeopleSheet.getRange(2, 1, countPeopleSheet.getLastRow()-1, 2).getValues();
  var data = []
  var m = 0
  var idx = 0
  for(i=0;i<participants.length;i++) {
    let result = data.find((place, index) => {if(place[0] == participants[i][0]){idx = index; return place[0]}})
    if(typeof result === 'undefined') {
      data[m] = []
      data[m][0] = participants[i][0]
      data[m][1] = participants[i][1]
      m++
    } else {
      data[idx].push(participants[i][1])
    }
  }
  // console.log(participants)

  var count = {}
  var participantsMember = {}
  for(i=0;i<data.length;i++){
    count = {}
    count.place = data[i][0]
    count.member = {}
    for(n=1;n<data[i].length;n++){
      let elm = data[i][n]
      count.member[elm] = (count.member[elm] || 0)+1
    }

    for(n=0;n<Object.keys(count.member).length;n++){

      if(Object.values(count.member)[n] % 2 === 0) {
        let deleteKey = Object.keys(count.member)[n]
        delete count.member[deleteKey]
      }
    }

    if(Object.keys(count.member).length > 0) {
      count.memberCount = Object.keys(count.member).length
      participantsMember[i] = count
    }
  }
  // console.log(participantsMember)

  var text = "投票終了\n---------------------------\n"
  var sendText = ""
  for(n=0;n<Object.keys(participantsMember).length;n++){
    let usernames = []
    var key = Object.keys(participantsMember)[n]

    for(m=0;m<Object.keys(participantsMember[key].member).length;m++) {
      let url = "https://api.line.me/v2/bot/profile/" + Object.keys(participantsMember[key].member)[m]
      let params = {
        method:'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
      }
      let responseData = UrlFetchApp.fetch(url, params).getContentText()
      usernames.push(JSON.parse(responseData).displayName)
    }

    // 文章修正時で毎回上のリクエスト送りたくないときはこっちを使用
    // usernames.push("test user name")
    // usernames.push("test user name2")

    text += participantsMember[key].place + "\n参加人数：" + participantsMember[key].memberCount + "人\n(" + usernames + ") \n"
    text += writeParticipantLog(participantsMember[key].place, usernames)

    if((participantsMember[key].place).includes("(ピ)")) {
      const regex = /[^:]*/;
      let place = (participantsMember[key].place).match(regex)
      sendText += place + "の参加人数：" + participantsMember[key].memberCount + "人(" + usernames + ") です\n"      
    }
  }
  sendText += "よろしくお願いします。"
  // console.log(text + "send "+sendText)

  sendResultMessage(text, sendText)
  sigunatureSheet.getRange(2,1).setValue("")
}

function writeParticipantLog(place, usernames) {
  const dateRegex = /[^:]*/
  const placeRegex = /(?<=:)(.*)/
  let date = (place).match(dateRegex)
  let placeContent = (place).match(placeRegex)
  usernames = usernames.join(',')

  const writeRow = participaintLogSheet.getLastRow()+1
  participaintLogSheet.getRange(writeRow,1).setValue(date)
  participaintLogSheet.getRange(writeRow,2).setValue(placeContent)
  participaintLogSheet.getRange(writeRow,4).setValue(usernames)

  participaintLogSheet.getRange(writeRow,3).setValue('=LEN(D'+(writeRow)+')-LEN(SUBSTITUTE(D'+(writeRow)+',",",""))+1')

  const gymFee = '=iferror(index($B$3:$G$9,match(REGEXEXTRACT(B'+(writeRow)+',"北スポ|味舌[AB]面|味舌第二"),$A$3:$A$9,0)'
                           +',match(mid(A'+(writeRow)+',find(")",A'+(writeRow)+',1)+1,6),$B$2:$E$2,0)),"-")'
  participaintLogSheet.getRange(writeRow,5).setValue(gymFee)

  participaintLogSheet.getRange(writeRow,6).setValue('=roundup(($E'+(writeRow)+'/$C'+(writeRow)+')+100,-1)')

  return "体育館料金: "+  participaintLogSheet.getRange(writeRow,5).getValue().toLocaleString() + "円\n1人当たりの金額: "+ participaintLogSheet.getRange(writeRow,6).getValue().toLocaleString() + "円\n\n"






  
}







