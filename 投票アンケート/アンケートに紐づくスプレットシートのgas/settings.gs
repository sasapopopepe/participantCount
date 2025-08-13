function getQuestionnaireResultSheet(targetMonth) {
  const qResultSheetId = PropertiesService.getScriptProperties().getProperty('qResultSheetId')
  const rResultMonthSheet = SpreadsheetApp.openById(qResultSheetId).getSheetByName(targetMonth)
  return {"qResultSheetId": qResultSheetId, "rResultMonthSheet": rResultMonthSheet}
}

function getCountListSheetId(targetMonth) {
  const countListSheetId = PropertiesService.getScriptProperties().getProperty('countListSheetId')
  const targetMonthSheet = SpreadsheetApp.openById(countListSheetId).getSheetByName(targetMonth)
  return {"countListSheetId":countListSheetId, "targetMonthSheet":targetMonthSheet}
}