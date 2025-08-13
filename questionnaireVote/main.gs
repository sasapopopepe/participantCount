function createQuestionnaire() {
  scheduleList = getScheduleList();

  const questionnaireJsonData = getQuestionnaireSheet()
  // const voteSpreadSheetId = questionnaireJsonData.voteSpreadSheetId
  const questionnaireSheet = questionnaireJsonData.questionnaireSheet

  const questionnaireUrlList = questionnaireSheet.getRange(2,1,questionnaireSheet.getLastRow()-1,2).getValues()
  const questionnaireUrlDate = questionnaireSheet.getRange(2,1,questionnaireSheet.getLastRow()-1,1).getValues()
  const questionnaireUrlDateList = questionnaireUrlDate.flat(1);

  let todayMonth = new Date();

  let nextMonth = new Date();
  nextMonth.setMonth(todayMonth.getMonth() + 1)

  let twoLaterMonth = new Date();
  twoLaterMonth.setMonth(todayMonth.getMonth() + 2)

  let threeLaterMonth = new Date();
  threeLaterMonth.setMonth(todayMonth.getMonth() + 3)

  todayMonth = Utilities.formatDate(todayMonth,'JST','M');
  nextMonth = Utilities.formatDate(nextMonth,'JST','M');
  twoLaterMonth = Utilities.formatDate(twoLaterMonth,'JST','M');
  threeLaterMonth = Utilities.formatDate(threeLaterMonth,'JST','M');
  const monthList = [todayMonth,nextMonth,twoLaterMonth,threeLaterMonth]
  let todayMonthScheduleList = [];

  for(n=0;n<monthList.length;n++){
    const countListJsonData = getCountListSheet(monthList[n])
    // const countListSheetId = countListJsonData.countListSheetId
    const targetMonthSheet = countListJsonData.targetMonthSheet

    if(questionnaireUrlDateList.includes(monthList[n])) {
      for(ind=0;ind<questionnaireUrlList.length;ind++){
        if(questionnaireUrlList[ind][0]==monthList[n]){
          const questionnaireUrl = questionnaireUrlList[ind][1];
          const targetMonthForm = FormApp.openById(questionnaireUrl);

          // 新しい選択肢の追加 .
          todayMonthScheduleList = setNewScheduleList(monthList[n], scheduleList)
          targetMonthForm.getItems()[1].asCheckboxItem().setChoiceValues(todayMonthScheduleList);

          // 古い選択肢の抽出 .
          const getDateregex = new RegExp("20[0-9][0-9]/[0-9]{1,2}/[0-9]{1,2}");
          const today = new Date();
          let newChoise = [];
          let index = 0;
          let targetItem = targetMonthForm.getItems()[1];

          if(targetMonthSheet.getLastColumn() > 2){
            const allCellSchedule = targetMonthSheet.getRange(2,3,1,targetMonthSheet.getLastColumn()-2).getValues();

            targetItem.asCheckboxItem().getChoices().forEach(function(choise){
              let targetDate = choise.getValue().match(getDateregex)
              const choiseValue = choise.getValue()
              targetDate = new Date(targetDate);
              if(targetDate > today){
                if(!allCellSchedule[0].includes(choiseValue)){
                  newChoise[index] = choiseValue;
                  index++;
                }

              }
            });
          } else {
            newChoise = targetItem.asCheckboxItem().getChoices().map((choise)=>
              choise.getValue()
            );
          }

          if(newChoise.length) {
          // 集計シートにeventデータを転記 .
            const newChoisePosition = targetMonthSheet.getLastColumn()+1;
            targetMonthSheet.getRange(2,newChoisePosition,1,newChoise.length).setValues([newChoise]);
            targetMonthSheet.getRange("C1").setValue("=COUNTIF(C$3:C,\"✔\")");
            if(targetMonthSheet.getLastColumn() > 3) {
              targetMonthSheet.getRange("C1").copyTo(targetMonthSheet.getRange(1,4,1,targetMonthSheet.getLastColumn()));
            }
          }
        }
      }


    } else {
      // googleフォーム追加処理
      const formDir = PropertiesService.getScriptProperties().getProperty('questionnaireDirUrl')
      const formDirId = DriveApp.getFolderById(formDir)
      const form = FormApp.create(monthList[n], true);

      const formFile = DriveApp.getFileById(form.getId());
      formFile.moveTo(formDirId);

      questionnaireSheet.getRange(questionnaireSheet.getLastRow()+1,1,1,2).setValues([[monthList[n], form.getId()]]);

      //formの設定項目
      form.setDescription("毎日10時に締め切り、投票結果を出します")
          .setLimitOneResponsePerUser(true)
          .setAllowResponseEdits(true);

      // Adds the paragraph text item.
      const nameItem = form.addParagraphTextItem();
      nameItem.setTitle('参加される方の名前を入力してください（ニックネームでOK）')
              .setRequired(true);

      // Adds a checkbox grid item.
      const item = form.addCheckboxItem();
      item.setTitle("参加される日にチェックをいれてください")

      // 投票日リストの選択肢の設定 .
      todayMonthScheduleList = setNewScheduleList(monthList[n], scheduleList)
      item.setChoiceValues(todayMonthScheduleList);

      // 連携先スプレットシートの設定 .
      const qResultSheetId = getQuestionnaireResultSheet();
      form.setDestination(FormApp.DestinationType.SPREADSHEET, qResultSheetId);
      SpreadsheetApp.openById(qResultSheetId).getSheets()[0].setName(monthList[n]);

      // 集計シートにeventデータを転記 .
      targetMonthSheet.clear();
      targetMonthSheet.getRange("C1").setValue("=COUNTIF(C$3:C,\"✔\")");
      targetMonthSheet.getRange("C1").copyTo(targetMonthSheet.getRange(1,4,1,todayMonthScheduleList.length-1));
      targetMonthSheet.getRange(2,3,1,todayMonthScheduleList.length).setValues([todayMonthScheduleList]);
    }

  }

}

function setNewScheduleList(targetMonth, scheduleList) {
  let todayMonthScheduleList = [];
  let num=0;
  for(ind=0;ind<scheduleList.length;ind++){
    let regex = new RegExp("20[0-9][0-9]/"+targetMonth);
    if(scheduleList[ind].match(regex)){
      todayMonthScheduleList[num] = scheduleList[ind]
      num++;
    }
  }
  return todayMonthScheduleList;
}

function getScheduleList() {

  const calendar = getCalendar()


  // https://gist.github.com/xl1/6d5f120c42be56b215f1
  var lock = LockService.getScriptLock();
  if (lock.tryLock(500)) {

    let startDate = new Date()
    startDate.setHours(00)
    startDate.setMinutes(00)
    startDate.setSeconds(00)
    startDate.setMilliseconds(00)
    let endDate = new Date()
    endDate.setHours(00)
    endDate.setMinutes(00)
    endDate.setSeconds(00)
    endDate.setMilliseconds(00)
    endDate.setMonth(endDate.getMonth() + 3)

    const events = calendar.getEvents(startDate, endDate)

    var sendEvents = []
    var dayOfWeeks = [ "日", "月", "火", "水", "木", "金", "土" ]
    var count = 1
    if (events.length !== 0) {
      // 予定の件数だけ実行
      for (event in events) {
        // 予定のタイトルを取得
        let title = events[event].getTitle();

        if(/卓球/g.test(title)) {
          let year = events[event].getStartTime().getFullYear()
          let month = events[event].getStartTime().getMonth()+1
          let day = events[event].getStartTime().getDate()
          let dayOfWeek = dayOfWeeks[events[event].getStartTime().getDay()]
          let startHour = events[event].getStartTime().getHours()
          let endHour = events[event].getEndTime().getHours()
          let eventDetail = year + "/" + month + "/" + day + "(" + dayOfWeek + ")" + startHour +"-"+ endHour + "時:" + title

          count++
          
          sendEvents.push(eventDetail)
        }

      }
    }
    lock.releaseLock();
    return sendEvents
  }
}

function writeCountListSheet(scheduleList) {
  const countJsonData = getCountListSheet()
  const countListSheet = countJsonData.countListSheet

  countListSheet.getRange(3,2,countListSheet.getLastRow()).setValues(scheduleList);

}