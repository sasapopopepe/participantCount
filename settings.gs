
// For LINE Bot
const accessToken = PropertiesService.getScriptProperties().getProperty('accessToken')
// LINE dev内でuserIdと呼ばれているid
const myId = PropertiesService.getScriptProperties().getProperty('myId')
const channelSecret = PropertiesService.getScriptProperties().getProperty('channelSecret')

// stgに切り替えるときはtestgroupIdにする
const groupId = PropertiesService.getScriptProperties().getProperty('groupId')

// For google Calander
const calendarId = PropertiesService.getScriptProperties().getProperty('calendarId')
const calendar = CalendarApp.getCalendarById(calendarId)

// For SpreadSheet
let idSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('idSheet')
let countPeopleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('countPeople')
let debugSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('debug')
let sigunatureSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sigunature')
let participaintLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('participaintLog')

const countListSheetId = PropertiesService.getScriptProperties().getProperty('countListSheetId')
let countListSheet = SpreadsheetApp.openById(countListSheetId).getSheetByName('list')