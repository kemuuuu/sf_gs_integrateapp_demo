/**
 * SalesforceのSession情報
 */
export interface SessionInfo {
  access_token: string
  id: string
  instance_url: string
  issued_at: string
  signature: string
  token_type: string
}

/**
 * Salesforceの取引先レコード情報
 */
export interface AccountRecord {
  Name: string
  furigana__c?: string 
  Phone?: string 
  Field5__c?: string 
  Fax?: string 
  Field6__c?: string 
  // Fieldseinen__c?: string 
  BillingPostalCode?: string 
  BillingState?: string
  BillingCity?: string 
  BillingStreet?: string 
  Field1__c?: boolean 
}

/**
 * Salesforceの事前申し込みレコード情報
 */
export interface PriorRecord {
  Name: string
  // contact_reception_date__c: string
  address_prefectures__c: string
  address_city__c: string
  town_name_address__c: string
  remarks__c: string
  contact_guest_name__c: string
}