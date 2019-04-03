import { SessionInfo } from './safagass'
import { resetSheet } from './sheetutil'

const SESSION_NAME = 'salesforce_session_info'

export class App {

  sessioninfo: SessionInfo

  constructor() {
    const userProperties = PropertiesService.getUserProperties()
    const si = userProperties.getProperty(SESSION_NAME)
    if (si) this.sessioninfo = JSON.parse(si)
  }

  getSessionInfo() :SessionInfo {
    return this.sessioninfo
  }

  /**
   * アクセストークン取得
   * @param client_id 
   * @param client_secret 
   * @param user_name 
   * @param user_pass 
   */
  setSessionInfo (client_id: string, client_secret: string, user_name: string, user_pass: string): SessionInfo {
    
    const ACCESS_TOKEN_URL = "https://test.salesforce.com/services/oauth2/token";    
    const payload = {
      'grant_type':'password',
      'client_id':client_id,
      'client_secret':client_secret,
      'username':user_name,
      'password':user_pass
    }

    // アクセストークン取得
    let results = UrlFetchApp.fetch(ACCESS_TOKEN_URL, {
      'method':'post',
      'payload':payload
    })
    let resultText = results.getContentText()
    let rc = results.getResponseCode()

    // セッション情報をユーザプロパティに保存
    let userProperties = PropertiesService.getUserProperties()
    userProperties.setProperty(SESSION_NAME, results.toString())

    const si: SessionInfo = JSON.parse(userProperties.getProperty(SESSION_NAME))
    return si

  }

  /**
   * レコード検索
   * TODO: 項目のハードコードやめる
   * @param keyword 
   */
  searchRecords(keyword: string) {

    resetSheet()

    if (!keyword) {
      Browser.msgBox('検索キーワードを入力してください')
      return
    }

    let query: string = `SELECT name, contact_reception_date__c, address_prefectures__c, address_city__c, town_name_address__c, remarks__c, receiver__c, contact_guest_name__c, `
    query += `contact_guest_name__r.Id, contact_guest_name__r.Name, contact_guest_name__r.furigana__c, contact_guest_name__r.Phone, contact_guest_name__r.Field5__c, `
    query += `contact_guest_name__r.Fax, contact_guest_name__r.Field6__c, contact_guest_name__r.Field7__c, contact_guest_name__r.Fieldseinen__c, `
    query += `contact_guest_name__r.BillingPostalCode, contact_guest_name__r.BillingState, contact_guest_name__r.BillingCity, contact_guest_name__r.BillingStreet, contact_guest_name__r.Field1__c `
    query += `FROM prior_contact__c `
    query += `WHERE contact_guest_name__r.Name LIKE '%${keyword}%' ORDER BY contact_guest_name__r.Name ASC`
    const queryUrl: string = this.sessioninfo.instance_url + "/services/data/v32.0/query?q=" + encodeURIComponent(query)

    const result = UrlFetchApp.fetch(queryUrl, {
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + this.sessioninfo.access_token,
        "Accept": "application/json",
      },
      "muteHttpExceptions": true
    })
    const responseText = result.getContentText()
    const rc = result.getResponseCode()

    const ss = SpreadsheetApp.getActiveSheet()
    const records = JSON.parse(result.getContentText()).records

    let row;
    records.map((record, i) => {
      
      row = i + 2
      // Account
      ss.getRange(row, 1).setValue(record.contact_guest_name__r.Id)
      ss.getRange(row, 2).setValue(record.contact_guest_name__r.Name)
      ss.getRange(row, 3).setValue(record.contact_guest_name__r.furigana__c)
      ss.getRange(row, 4).setValue(record.contact_guest_name__r.Phone)
      ss.getRange(row, 5).setValue(record.contact_guest_name__r.Field5__c)
      ss.getRange(row, 6).setValue(record.contact_guest_name__r.Fax)
      ss.getRange(row, 7).setValue(record.contact_guest_name__r.Field6__c)
      ss.getRange(row, 8).setValue(record.contact_guest_name__r.Field7__c)
      ss.getRange(row, 9).setValue(record.contact_guest_name__r.Fieldseinen__c)
      ss.getRange(row, 10).setValue(record.contact_guest_name__r.BillingPostalCode)
      ss.getRange(row, 11).setValue(record.contact_guest_name__r.BillingState)
      ss.getRange(row, 12).setValue(record.contact_guest_name__r.BillingCity)
      ss.getRange(row, 13).setValue(record.contact_guest_name__r.BillingStreet)
      ss.getRange(row, 14).setValue(record.contact_guest_name__r.Field1__c)

      // Child
      ss.getRange(row, 16).setValue(record.Name)
      ss.getRange(row, 17).setValue(record.contact_reception_date__c)
      ss.getRange(row, 18).setValue(record.address_prefectures__c)
      ss.getRange(row, 19).setValue(record.address_city__c)
      ss.getRange(row, 20).setValue(record.town_name_address__c)
      ss.getRange(row, 21).setValue(record.remarks__c)
    })
  }

  /**
   * create record(s)
   * @param accountName 
   * @param puriorName 
   */
  createRecords(sObj: string, recdata: any): string {

    const response = UrlFetchApp.fetch(
      this.sessioninfo.instance_url + `/services/data/v20.0/sobjects/${sObj}/`, 
      {
        "method" : "post",
        "headers" : {
          "Authorization": "Bearer " + this.sessioninfo.access_token
        },
        "payload": JSON.stringify(recdata),
        "contentType": "application/json; charset=utf-8",
        "muteHttpExceptions": true
      }
    )
  
    const responseText = response.getContentText();
    const err = response.getHeaders()["error"];
    const rc = response.getResponseCode();
    Logger.log(responseText)
    if (err) return

    return JSON.parse(responseText).id
  }

}