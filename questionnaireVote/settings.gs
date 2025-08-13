function getQuestionnaireSheet() {
  const voteSpreadSheetId = PropertiesService.getScriptProperties().getProperty('voteSpreadSheetId')
  const questionnaireSheet = SpreadsheetApp.openById(voteSpreadSheetId).getSheetByName('questionnaireUrlList')
  return {"voteSpreadSheetId":voteSpreadSheetId, "questionnaireSheet":questionnaireSheet}
}

function getCountListSheet(targetMonth) {
  const countListSheetId = PropertiesService.getScriptProperties().getProperty('countListSheetId')
  const targetMonthSheet = SpreadsheetApp.openById(countListSheetId).getSheetByName(targetMonth)
  return {"countListSheetId":countListSheetId, "targetMonthSheet":targetMonthSheet}
}

function getQuestionnaireResultSheet() {
  return PropertiesService.getScriptProperties().getProperty('qResultSheetId')
}

function getVoteLogSheet() {
  const voteSpreadSheetId = PropertiesService.getScriptProperties().getProperty('voteSpreadSheetId')
  const voteLogSheet = SpreadsheetApp.openById(voteSpreadSheetId).getSheetByName('participaintLog')
  return voteLogSheet
}

function getCalendar() {
  // For google Calander
  const calendarId = PropertiesService.getScriptProperties().getProperty('calendarId')
  calendar = CalendarApp.getCalendarById(calendarId)
  return calendar
}

