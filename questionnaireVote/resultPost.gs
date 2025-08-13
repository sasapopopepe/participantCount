function resultPost() {

  // 7日間を取得
  const today = new Date();
  today.setHours(00)
  today.setMinutes(00)
  today.setSeconds(00)
  today.setMilliseconds(00)
  let nextWeek = new Date();
  nextWeek.setHours(00)
  nextWeek.setMinutes(00)
  nextWeek.setSeconds(00)
  nextWeek.setMilliseconds(00)
  // 次の日のデータ
  nextWeek.setDate(today.getDate() + 1)

  // countListの全体取得（月と年またぎ注意
  const countListJsonData = getCountListSheet(today.getMonth()+1)
  // const countListSheetId = countListJsonData.countListSheetId
  const thisMonthSheet = countListJsonData.targetMonthSheet

  const thisMonthResultData = thisMonthSheet.getRange(1,1,thisMonthSheet.getLastRow(),thisMonthSheet.getLastColumn()).getValues()
  const sendThisMonthResultData = setResultData(thisMonthResultData, today, nextWeek)

  const logSheet = getVoteLogSheet();
  if(sendThisMonthResultData.length){
    const lineMessageData = writeResultData(sendThisMonthResultData, logSheet);
    var lineMessageText = setLineMessage(lineMessageData);
    // アンケートと投票結果から結果集計済のデータを削除する
    deleteOldData(sendThisMonthResultData, today.getMonth()+1, thisMonthSheet.getRange(1,1,thisMonthSheet.getLastRow(),thisMonthSheet.getLastColumn()))
  }

  if(today.getMonth() != nextWeek.getMonth()) {
    const countListJsonData2 = getCountListSheet(nextWeek.getMonth()+1)
    const nextMonthSheet = countListJsonData2.targetMonthSheet
    const nextMonthResultData = nextMonthSheet.getRange(1,1,nextMonthSheet.getLastRow(),nextMonthSheet.getLastColumn()).getValues()
    const sendNextMonthResultData = setResultData(nextMonthResultData, today, nextWeek)
    if(sendNextMonthResultData.length){
      const lineMessageData2 = writeResultData(sendNextMonthResultData, logSheet)
      const lineMessageText2 = setLineMessage(lineMessageData2);
      lineMessageText = lineMessageText + lineMessageText2;

      // アンケートと投票結果から結果集計済のデータを削除する
      deleteOldData(sendNextMonthResultData, nextWeek.getMonth()+1, nextMonthSheet.getRange(1,1,nextMonthSheet.getLastRow(),nextMonthSheet.getLastColumn()))
    }
  }

  if(lineMessageText !== undefined){
    lineMessageText = "Bot通知-投票結果\n---------------------------\n" + lineMessageText;
    
    // Botに投稿させる
    // sendToMessage(lineMessageText)

    // googleドキュメントに反映
    writeDocument(lineMessageText)
  } else {
    clearDocument()
  }

  // 次のトリガーを設定
  setTrigger()
}

function writeDocument(lineMessageText) {
  const writeResultDocId = PropertiesService.getScriptProperties().getProperty('writeResultDocId')
  const writeDoc = DocumentApp.openById(writeResultDocId);

  writeDoc.getBody().clear();
  writeDoc.getBody().setText(lineMessageText);
}

function clearDocument() {
  const writeResultDocId = PropertiesService.getScriptProperties().getProperty('writeResultDocId')
  const writeDoc = DocumentApp.openById(writeResultDocId);

  writeDoc.getBody().clear();
}

function sendToMessage(lineMessageText) {
  const resultRecipientId = PropertiesService.getScriptProperties().getProperty('sendToLineId');
  const accessToken = PropertiesService.getScriptProperties().getProperty('accessToken');

  let payload = {
    "to": resultRecipientId,
    "messages":[
      {
        "type":"text",
        "text":lineMessageText
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

function deleteOldData(sendThisMonthResultData, targetMonth, cellResultDataRange){
  const holdFormData = deleteOldFormData(sendThisMonthResultData, targetMonth)
  deleteOldCell(holdFormData, cellResultDataRange)
}

function deleteOldCell(holdFormData, cellResultDataRange) {

  let moldingFormData = [];
  let fInd = 0;
  let delCIndCnt = 0;
  let delCind = 0;

  holdFormData.forEach(function(choise){
    moldingFormData[fInd] = choise.getValue();
    fInd++;
  });

  let deleteCellIndex = [];
  cellResultDataRange.getValues()[1].map((event)=>{
      if(event!='' && !moldingFormData.includes(event)){
        deleteCellIndex[delCIndCnt] = delCind;
        delCIndCnt++;
      }
      delCind++;
    }
  );
  
  let delCount = 0;
  deleteCellIndex.sort();

  deleteCellIndex.forEach((colInd)=>{
    cellResultDataRange.getSheet().deleteColumn(colInd+1 -delCount);
    delCount++;
  });

}

function deleteOldFormData(sendThisMonthResultData, targetMonth){
  const urlListJsonData = getQuestionnaireSheet();
  const questionnaireSheet = urlListJsonData.questionnaireSheet;
  const questionnaireUrlList = questionnaireSheet.getRange(2,1,questionnaireSheet.getLastRow()-1,2).getValues()

  for(ind=0;ind<questionnaireUrlList.length;ind++){
    if(targetMonth == questionnaireUrlList[ind][0]) {
      const questionnaireUrl = questionnaireUrlList[ind][1];
      var targetMonthForm = FormApp.openById(questionnaireUrl);
      break;
    }
  }

  //ここから
  let targetItem = targetMonthForm.getItems()[1];
  let holdColumn = [];
  let holdIdx = 0;
  let formInd = 0;
  targetItem.asCheckboxItem().getChoices().forEach(function(choise){
    let targetValue = choise.getValue()
    targetValue = targetValue.match(/20[0-9][0-9]\/[0-9]{1,2}\/[0-9]{1,2}\([月火水木金土日]\)[0-9]{1,2}-[0-9]{1,2}時/).toString()

    if(!((sendThisMonthResultData.flat()).includes(targetValue))){
      holdColumn[holdIdx] = choise.getValue();
      holdIdx++;
    }
    formInd++;
  });

    // 選択肢の入れ替え（以前の選択肢の削除） .
  if(holdColumn.length){
    targetMonthForm.getItems()[1].asCheckboxItem().setChoiceValues(holdColumn);
  } else {
    targetMonthForm.getItems()[1].asCheckboxItem().setChoiceValues(['1900/1/1(月):選択肢なし']);
  }

  return targetMonthForm.getItems()[1].asCheckboxItem().getChoices()
}

function setLineMessage(lineMessageData){
  let textMessage = "" ;
  for(lInd=0;lInd<lineMessageData.length;lInd++){
    textMessage += lineMessageData[lInd][0]+":"+lineMessageData[lInd][1]+"\n";
    textMessage += "参加人数:"+lineMessageData[lInd][2]+"人, 参加費:"+lineMessageData[lInd][5]+"円\n";
    textMessage += "参加者:"+lineMessageData[lInd][3];
    if(lInd+1 != lineMessageData.length){
      textMessage += "\n\n";
    }
  }
  return textMessage;
}

function writeResultData(resultData, logSheet) {

  const writeRow = logSheet.getLastRow()+1;

  logSheet.getRange(writeRow,1,resultData.length,4).setValues(resultData);

  logSheet.getRange(writeRow,3).setValue('=if($D'+writeRow+'<>"",LEN($D'+(writeRow)+')-LEN(SUBSTITUTE($D'+(writeRow)+',",",""))+1,0)');

  const gymFee = '=iferror(index($B$3:$G$9,match(REGEXEXTRACT(B'+(writeRow)+',"北スポ|味舌[AB]面|味舌第二"),$A$3:$A$9,0)'
                           +',match(mid(A'+(writeRow)+',find(")",A'+(writeRow)+',1)+1,6),$B$2:$H$2,0)),"-")'
  logSheet.getRange(writeRow,5).setValue(gymFee);

  logSheet.getRange(writeRow,6).setValue('=if($E'+writeRow+'="-","手計算",if($C'+writeRow+'>0,roundup(($E'+(writeRow)+'/$C'+(writeRow)+')+100,-1),"0"))');

  if(resultData.length > 1){
    logSheet.getRange(writeRow,3).copyTo(logSheet.getRange(writeRow+1,3,resultData.length-1));
    logSheet.getRange(writeRow,5).copyTo(logSheet.getRange(writeRow+1,5,resultData.length-1));
    logSheet.getRange(writeRow,6).copyTo(logSheet.getRange(writeRow+1,6,resultData.length-1));
  }

  return logSheet.getRange(writeRow, 1, resultData.length, 6).getValues();
}

function setResultData(resultData, today, nextWeek){
  const getYearReg = new RegExp("20[0-9][0-9]");
  const getMonthReg = new RegExp("/[0-9]{1,2}/");
  const getDayReg = /\/[0-9]{1,2}\(/;

  let resultCellData = [];
  let rInd = 0;

  for(i=2;i<resultData[1].length;i++){
    let targetDate = new Date(resultData[1][i].match(getYearReg).toString(), 
                              resultData[1][i].match(getMonthReg).toString().replace(/\//g,"")-1,
                              resultData[1][i].match(getDayReg).toString().replace(/[\/(]/g,""),
                              0,0,0);

    // 7日間に該当する投票を抽出
    if(today <= targetDate && targetDate < nextWeek){
      // resultCellData[rInd] = [];
      resultCellData[rInd] = resultData[1][i].split(":");
      let amount = 0;
      for(n=2;n<resultData.length;n++){
        if(resultData[n][i] == "✔"){
          if(resultCellData[rInd][3] === undefined){
            resultCellData[rInd][3] = resultData[n][1];
          } else {       
            resultCellData[rInd][3] = resultCellData[rInd][3]+","+resultData[n][1];
          }
          amount++;
        }
      }
      if(amount==0){
        resultCellData[rInd][2] = '';
        resultCellData[rInd][3] = '';
      }
      rInd++;
    }
  }
  return resultCellData
}







