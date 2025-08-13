function doGet() {
  const thisDocumentId = PropertiesService.getScriptProperties().getProperty('thisDocumentId')
  const thisDoc = DocumentApp.openById(thisDocumentId);

  const jsonData = JSON.stringify({"content":thisDoc.getBody().getText()})

  let response = ContentService.createTextOutput(jsonData);
  response.setMimeType(ContentService.MimeType.JSON);
  return response;

}
