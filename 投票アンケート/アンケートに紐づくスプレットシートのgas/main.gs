function submitForm(event) {

  const submitData = event.range.getValues();
  const username = submitData[0][1];

  const qResultJson = getQuestionnaireResultSheet(event.range.getSheet().getName())
  const rResultMonthSheet = qResultJson.rResultMonthSheet
  const idRange = rResultMonthSheet.getRange(event.range.getRow(),event.range.getColumn()+3);
  let idValue = idRange.getValue();

  const getCountListJsonData = getCountListSheetId(event.range.getSheet().getName())
  // const countListSheetId = getCountListJsonData.countListSheetId
  const targetMonthSheet = getCountListJsonData.targetMonthSheet
  const resultData = targetMonthSheet.getRange(1,1,targetMonthSheet.getLastRow(),targetMonthSheet.getLastColumn()).getValues()
  let insertData = [];

  let participationDate = [];
  if(submitData[0][2]){
    participationDate = submitData[0][2].split(", ");
  }

  for(ind=2;ind<resultData[1].length;ind++){
    if(participationDate.includes(resultData[1][ind])){
      insertData[ind] = "✔";
    } else {
      insertData[ind] = "";
    }
  }

  if(idValue && resultData.flat().includes(idValue)){
    for(num=2;num<resultData.length;num++){
      if(resultData[num][0]==idValue){
        if(username){
          insertData[0] = idValue;
          insertData[1] = username;
          targetMonthSheet.getRange(num+1,1,1,insertData.length).setValues([insertData]);
        } else {
          insertData.splice(0,2);
          targetMonthSheet.getRange(num+1,3,1,insertData.length).setValues([insertData]);
        }

      }
    }
  } else {
    idValue = event.range.getRow()+":"+Utilities.getUuid();
    idRange.setValue(idValue);
    insertData[0] = idValue;
    insertData[1] = username;

    targetMonthSheet.getRange(targetMonthSheet.getLastRow()+1,1,1,insertData.length).setValues([insertData]);
  }
  








}