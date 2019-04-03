export function resetSheet() {
  const ss = SpreadsheetApp.getActiveSheet()
  ss.getRange(2,1,ss.getLastRow(),ss.getLastColumn()).setValue(null);
}