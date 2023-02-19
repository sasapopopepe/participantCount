/*
function exapmlesendMessage() {
  // Document: https://developers.line.biz/ja/reference/messaging-api/#send-push-message

  let url = "https://api.line.me/v2/bot/message/push"
  let payload = {
    to: groupId,
    messages:[
      {
        type:"text",
        text:"test Message1"
      },
      {
        type:"text",
        text:"test Message2"
      }
    ]
  }

  let params = {
    method:'POST',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    payload:(JSON.stringify(payload))
  }

  Logger.log(params)

  let responseData = UrlFetchApp.fetch(url, params).getContentText()
  Logger.log(responseData)

}

function exampleRichSendMessage() {

  //if(火～月のカレンダーに卓球の予定があったら)

  let url = "https://api.line.me/v2/bot/message/push"
  
  richText = {
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
                  "text": "参加する日をタップしてください。間違えてタップした場合はもう一度タップしてください",
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
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "message",
            "label": "月日時1参加",
            "text": "名前が月日時1参加で投票しました！"
          },
          "style": "secondary",
          "height": "sm"
        },
        {
          "type": "button",
          "action": {
            "type": "message",
            "label": "月日時2参加",
            "text": "名前が月日時2参加で投票しました！"
          },
          "style": "secondary",
          "height": "sm"
        }
      ],
      "flex": 0
    }
  }


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



  let params = {
    "method":'POST',
    "contentType": 'application/json',
    "headers": {
      "Authorization": 'Bearer ' + accessToken
    },
    "payload":JSON.stringify(payload)
  }

  Logger.log(params)
  UrlFetchApp.fetch(url, params)

}


*/