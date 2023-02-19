
// For LINE Bot
const accessToken = PropertiesService.getScriptProperties().getProperty('accessToken')
// LINE dev内でuserIdと呼ばれているid
const myId = PropertiesService.getScriptProperties().getProperty('myId')
const channelSecret = PropertiesService.getScriptProperties().getProperty('channelSecret')

// stg
const groupId = PropertiesService.getScriptProperties().getProperty('testgroupId')

// For google Calander
const calendarId = PropertiesService.getScriptProperties().getProperty('calendarId')
const calendar = CalendarApp.getCalendarById(calendarId)

// For SpreadSheet
let idSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('idSheet')
let countPeopleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('countPeople')
let debugSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('debug')