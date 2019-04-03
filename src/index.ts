import { App } from './app'
import { SessionInfo, AccountRecord, PriorRecord } from './safagass'
import { resetSheet } from './sheetutil'

const CLIENT_ID = "REPLACE_YOUR_CLIENT_ID"
const CLIENT_SECRET = "REPLACE_YOUR_CLIENT_SECRET"
const USER_NAME = "REPLACE_YOUR_USER_NAME"
const USER_PASS = "REPLACE_YOUR_PASSWORD"

/** アドオン追加 */
function onOpen(): void {
  SpreadsheetApp.getUi().createAddonMenu().addItem('Salesforce連携アプリ', 'showApp').addToUi()
}
/** サイドバー表示 */
function showApp(): void {
  const ui = HtmlService.createHtmlOutputFromFile('sf_integrate').setTitle('Salesforce連携アプリ')
  SpreadsheetApp.getUi().showSidebar(ui)
  login()
}

// 接続アプリケーション
const app: App = new App()

function isLoggedIn() :SessionInfo {
  return app.getSessionInfo()
}

/**
 * LOG-iN
 */
function login(): string {
  const session_info: SessionInfo = app.setSessionInfo(CLIENT_ID, CLIENT_SECRET, USER_NAME, USER_PASS)
  return session_info.access_token
}


/**
 * レコード検索 
 * @param keyword 
 */
function search(keyword: string): any {
  return app.searchRecords(keyword)
}

/**
 * シートをリフレッシュ
 */
function refresh(): void {
  resetSheet()
}

/**
 * レコード作成
 */
function create(accountRecord: AccountRecord, priorRecord: PriorRecord): string {

  Logger.log(accountRecord)

  const err1 = '「お客様名」「心配な方-名前」は必須です'
  const err2 = 'ERROR: データの作成に失敗しました。'

  if (!accountRecord.Name || !priorRecord.Name) {
    Browser.msgBox(err1)
    return
  }
  const accId = app.createRecords('Account', accountRecord)
  if (!accId) {
    Browser.msgBox(err2)
    return
  }
  priorRecord.contact_guest_name__c = accId
  const purId = app.createRecords('prior_contact__c', priorRecord)
  if (!purId) {
    Browser.msgBox(err2)
    return
  }
  Browser.msgBox(`レコードを作成しました。${accId}`)
  return accId
}

/**
 * シート情報からレコード作成
 */
function createFromSheet() {

  const ss = SpreadsheetApp.getActiveSheet()

  const accountName = ss.getRange(2,2).getValue()
  const puriorName = ss.getRange(2,16).getValue()

  const err1 = '「お客様名」「心配な方-名前」は必須です'
  const err2 = 'ERROR: データの作成に失敗しました。'

  if (!accountName || !puriorName) {
    Browser.msgBox(err1)
    return
  }
  const accId = app.createRecords('Account', {name: accountName})
  if (!accId) {
    Browser.msgBox(err2)
    return
  }
  const purId = app.createRecords('prior_contact__c', {
    name: puriorName,
    contact_guest_name__c: accId
  })
  if (!purId) {
    Browser.msgBox(err2)
    return
  }
  Browser.msgBox(`レコードを作成しました。${accId}`)
  return accId
}