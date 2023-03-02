function sendVoteMessage(sendEvents) {

  var contents = []

  const signature = signatureRegister()
  const yearRegex = /(?<=;)(.*)/gi
  const labelRegex = /[^;]*/
  let year = ""
  let labelData = ""

  for (i=0;i<sendEvents.length;i++) { 
    year = sendEvents[i].match(yearRegex)
    labelData = sendEvents[i].match(labelRegex)
    // debugSheet.getRange(debugSheet.getLastRow()+1,1).setValue("labelData is: "+ labelData)

    contents.push({"type": "button","action": {"type": "postback","label": labelData[0],"data": year[0] + "/" + labelData[0] + "$" + signature},"style": "secondary","height": "sm"})
    // contents.push({"type": "button","action": {"type": "postback","label": sendEvents[i],"data": year.getFullYear() + "/" + sendEvents[i]},"style": "secondary","height": "sm"})
  }

  // debugSheet.getRange(debugSheet.getLastRow()+1,1).setValue(contents)

  contents.push(
    {
      "type": "button",
      "action": {
        "type": "message",
        "label": "数秒後に投票通知が出ない場合",
        "text": "投票Botを友達追加してください"
      },
      "style": "link",
      "height": "sm"
    },{
      "type": "button",
      "style": "link",
      "height": "sm",
      "action": {
        "type": "uri",
        "label": "投票確認LINK",
        "uri": "https://docs.google.com/spreadsheets/d/" + countListSheetId +"/edit?usp=sharing"
      }
    }
  )

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
                  "text": "参加する日をタップしてください。(投票に約7秒ラグあり)金曜日12時締切。間違えてタップした場合はもう一度タップしてください(奇数回送信者が反映される仕組み)",
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

function signatureRegister() {
  // https://developers.google.com/apps-script/reference/utilities/utilities?hl=ja#computeHmacSha256Signature(Byte,Byte)
  
  let key = channelSecret
  let value = Utilities.getUuid()

  sigunatureSheet.getRange(2,1).setValue(value)

  let signature = Utilities.computeHmacSha256Signature(value, key);
  let sig = signature.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');

  console.log(sig)
  return sig

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

  if(responseData.getResponseCode() === 200 && !countPeopleSheet.getRange("A2").isBlank()) {
    countPeopleSheet.getRange(2, 1, countPeopleSheet.getLastRow()-1, 3).clearContent()
    countListSheet.getRange(3,1,countListSheet.getLastRow(),countListSheet.getLastColumn()).clearContent()
  }
}







