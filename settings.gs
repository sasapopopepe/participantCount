
// For LINE Bot
const accessToken = PropertiesService.getScriptProperties().getProperty('accessToken')
// 開発者（私）のstg botでのuserId
const myId = PropertiesService.getScriptProperties().getProperty('myId')
const channelSecret = PropertiesService.getScriptProperties().getProperty('channelSecret')

// stgに切り替えるときはtestgroupIdにする
const groupId = PropertiesService.getScriptProperties().getProperty('groupId')
const resultRecipientId = PropertiesService.getScriptProperties().getProperty('makichi_id')

// For SpreadSheet
let idSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('idSheet')
let countPeopleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('countPeople')
let debugSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('debug')
let sigunatureSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sigunature')
let participaintLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('participaintLog')

function getCountListSheet() {
  const countListSheetId = PropertiesService.getScriptProperties().getProperty('countListSheetId')
  const countListSheet = SpreadsheetApp.openById(countListSheetId).getSheetByName('list')
  return {"countListSheetId":countListSheetId, "countListSheet":countListSheet}
}

function getCalendar() {
  // For google Calander
  const calendarId = PropertiesService.getScriptProperties().getProperty('calendarId')
  calendar = CalendarApp.getCalendarById(calendarId)
  return calendar
}