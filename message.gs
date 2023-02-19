function sendVoteMessage(sendEvents) {

  let year = new Date()

  var contents = []

  for (let i=0;i<sendEvents.length;i++) { 
    contents.push({"type": "button","action": {"type": "postback","label": sendEvents[i],"data": year.getFullYear() + "/" + sendEvents[i]},"style": "secondary","height": "sm"})
  }
  
  Logger.log(contents)

  contents.push({
    "type": "button",
    "action": {
      "type": "message",
      "label": "数秒後に投票通知が出ない場合",
      "text": "投票Botを友達追加してください"
    },
    "style": "link",
    "height": "sm"
  })

  // コピペ始まり
  let richText = {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "練習参加投票",
          "weight": "bold",
          "size": "xl"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            {
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [
                {
                  "type": "text",
                  "text": "参加する日をタップしてください。(投票に少しラグあり)金曜日12時締切。間違えてタップした場合はもう一度タップしてください(奇数回送信者が反映される仕組み)",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 1,
                  "wrap": true
                }
              ]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": contents,
      "flex": 0
    }
  }
  // コピペ終わり

  let payload = {
    "to": groupId,
    "messages":[
      {
        "type":"flex",
        "altText":"Bot:練習に参加する方は投票してください。",
        "contents":richText
      }
    ]
  }

  let url = "https://api.line.me/v2/bot/message/push"
  let params = {
    "method":'POST',
    "contentType": 'application/json',
    "headers": {
      "Authorization": 'Bearer ' + accessToken
    },
    "payload":JSON.stringify(payload)
  }

  UrlFetchApp.fetch(url, params)

}

function sendResultMessage(text, sendText) {

  let payload = {
    "to": groupId,
    "messages":[
      {
        "type":"text",
        "text":sendText
      },
      {
        "type":"text",
        "text":text
      }
    ]
  }

  let url = "https://api.line.me/v2/bot/message/push"
  let params = {
    "method":'POST',
    "contentType": 'application/json',
    "headers": {
      "Authorization": 'Bearer ' + accessToken
    },
    "payload":JSON.stringify(payload)
  }

  let responseData = UrlFetchApp.fetch(url, params)

  if(responseData.getResponseCode() === 200) {
    countPeopleSheet.getRange(2, 1, countPeopleSheet.getLastRow()-1, 3).clearContent();
  }
}







