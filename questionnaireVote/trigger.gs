function deleteTrigger() {
  const allTriggers = ScriptApp.getProjectTriggers();
  let oldTrigger = null;

  // すでに存在するmyFunctionトリガーを探す
  for(i=0;i<allTriggers.length;i++) {
    if(allTriggers[i].getHandlerFunction() === 'resultPost') {
      oldTrigger = allTriggers[i];
      break;
    }
  }

  // すでに存在するトリガーがあれば削除
  if (oldTrigger !== null) {
    ScriptApp.deleteTrigger(oldTrigger);
  }
}

function setTrigger(){

  deleteTrigger()

  // 新しいトリガーを作成
  let triggerDate = new Date();
  triggerDate.setDate(triggerDate.getDate() + 1);
  triggerDate.setHours(10);
  triggerDate.setMinutes(0);
  triggerDate.setSeconds(0);

  ScriptApp.newTrigger('resultPost')
           .timeBased()
           .at(triggerDate)
           .create();

}