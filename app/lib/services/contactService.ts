import { execute } from '../database';

// Simplified interfaces - no more mysql2 types
interface ContactRow {
  idx: number;
  contactid: string;
  firstname: string;
  lastname: string;
  companyname: string;
  email: string;
  phonemobile: string;
  phonemobile2: string;
  phonehome: string;
  phonehome2: string;
  phonebusiness: string;
  phonebusiness2: string;
  phoneother: string;
  faxbusiness: string;
  faxhome: string;
  pager: string;
  photourl: string;
  pwd_ivr: number;
  saldo: string;
}

// Count result type
interface CountResult {
  total: number;
}

interface CallRow {
  callid: string;
  contactnumber: string;
  agentextension: string;
  description: string;
  calldatetime: Date;
  callduration: number;
}

interface ChatRow {
  chatid: string;
  email: string;
  agentextension: string;
  subject: string;
  description: string;
  chatdatetime: Date;
  chatduration: number;
}

// Define Contact type explicitly
export type Contact = {
  idx: number;
  contactid: string;
  firstname: string;
  lastname: string;
  companyname: string | null;
  email: string | null;
  phonemobile: string | null;
  phonemobile2: string | null;
  phonehome: string | null;
  phonehome2: string | null;
  phonebusiness: string | null;
  phonebusiness2: string | null;
  phoneother: string | null;
  faxbusiness: string | null;
  faxhome: string | null;
  pager: string | null;
  photourl: string | null;
  pwd_ivr: number | null;
  saldo: string | null;
};

export const formatDecimal = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2).replace(/^0+(?=\d)/, '');
};

/**
 * Maps a database row to the Contact type, ensuring all fields are present.
 * This is useful for consistent data transformation.
 * @param row The raw database row.
 * @returns A Contact object.
 */
function mapContactRowToContact(row: ContactRow): Contact {
  return {
    idx: row.idx,
    contactid: row.contactid,
    firstname: row.firstname,
    lastname: row.lastname,
    companyname: row.companyname,
    email: row.email,
    phonemobile: row.phonemobile,
    phonemobile2: row.phonemobile2,
    phonehome: row.phonehome,
    phonehome2: row.phonehome2,
    phonebusiness: row.phonebusiness,
    phonebusiness2: row.phonebusiness2,
    phoneother: row.phoneother,
    faxbusiness: row.faxbusiness,
    faxhome: row.faxhome,
    pager: row.pager,
    photourl: row.photourl,
    pwd_ivr: row.pwd_ivr,
    saldo: formatDecimal(row.saldo),
  };
}

export async function getContacts(
  page: string | number = '1',
  pageSize: string | number = '10',
  searchTerm?: string
): Promise<{ contacts: Contact[]; totalCount: number }> {
  // Validate and normalize pagination inputs
  const validatedPage = Math.max(1, Number(page) || 1);
  const validatedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
  const offset = (validatedPage - 1) * validatedPageSize;
  
  // Base query - select only the fields you need
  let query = `
    SELECT 
      contactid, firstname, lastname, companyname, email,
      phonemobile, phonehome, phonebusiness, photourl
    FROM contacts
  `;
  
  let countQuery = `SELECT COUNT(*) as total FROM contacts`;
  const params: string[] = [];
  const countParams: string[] = [];

  if (searchTerm) {
    const searchCondition = `
      WHERE firstname LIKE ? OR 
            lastname LIKE ? OR 
            companyname LIKE ? OR 
            email LIKE ? OR
            phonemobile LIKE ? OR
            phonehome LIKE ? OR
            phonebusiness LIKE ?
    `;
    const searchParam = `%${searchTerm}%`;
    query += searchCondition;
    countQuery += searchCondition;
    
    params.push(
      searchParam, searchParam, searchParam, searchParam,
      searchParam, searchParam, searchParam
    );
    countParams.push(
      searchParam, searchParam, searchParam, searchParam,
      searchParam, searchParam, searchParam
    );
  }

  // MSSQL pagination syntax - changed from LIMIT/OFFSET
  query += ` ORDER BY contactid OFFSET ${offset} ROWS FETCH NEXT ${validatedPageSize} ROWS ONLY`;

  try {
    console.log('Executing query:', query);
    console.log('With parameters:', params);
    
    const [rows] = await execute<ContactRow[]>(query, params);
    const [countRows] = await execute<CountResult[]>(countQuery, countParams);

    return { 
      contacts: rows.map(row => ({
        contactid: row.contactid,
        firstname: row.firstname,
        lastname: row.lastname,
        companyname: row.companyname,
        email: row.email,
        phonemobile: row.phonemobile,
        phonehome: row.phonehome,
        phonebusiness: row.phonebusiness,
        photourl: row.photourl, 
        pwd_ivr: row.pwd_ivr, 
        saldo: formatDecimal(row.saldo),
        idx: 0,
        phonemobile2: '',
        phonehome2: '',
        phonebusiness2: '',
        phoneother: '',
        faxbusiness: '',
        faxhome: '',
        pager: '',
      })), 
      totalCount: countRows[0].total 
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch contacts');
  }
}

export async function getContactByPhoneOrEmail(criteria: { phonebusiness?: string; email?: string; contactid?: string }): Promise<Contact | null> {
  const { phonebusiness, email, contactid } = criteria;
  let query = `SELECT * FROM contacts WHERE 1=1`;
  const params: string[] = [];

  if (phonebusiness) {
    query += ` AND phonebusiness = ?`;
    params.push(phonebusiness);
  } else if (email) {
    query += ` AND email = ?`;
    params.push(email);
  } else if (contactid) {
    query += ` AND contactid = ?`;
    params.push(contactid);
  } else {
    return null;
  }

  try {
    console.log('Executing getContactByPhoneOrEmail query:', query, 'with params:', params);
    const [rows] = await execute<ContactRow[]>(query, params);

    if (rows.length === 0) return null;

    return mapContactRowToContact(rows[0]);
  } catch (error) {
    console.error('Database Error in getContactByPhoneOrEmail:', error);
    throw new Error('Failed to fetch contact by phone or email');
  }
}

export async function getContactById(contactId: string): Promise<Contact | null> {
  const [rows] = await execute<ContactRow[]>(
    `SELECT * FROM contacts WHERE contactid = ?`,
    [contactId]
  );
  
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    idx: row.idx,
    contactid: row.contactid,
    firstname: row.firstname,
    lastname: row.lastname,
    companyname: row.companyname,
    email: row.email,
    phonemobile: row.phonemobile,
    phonemobile2: row.phonemobile2,
    phonehome: row.phonehome,
    phonehome2: row.phonehome2,
    phonebusiness: row.phonebusiness,
    phonebusiness2: row.phonebusiness2,
    phoneother: row.phoneother,
    faxbusiness: row.faxbusiness,
    faxhome: row.faxhome,
    pager: row.pager,
    photourl: row.photourl,
    pwd_ivr: row.pwd_ivr,
    saldo: formatDecimal(row.saldo),
  };
}

export async function createContact(contactData: Omit<Contact, 'idx' | 'contactid'>): Promise<Contact> {
  const contactid = generateContactId();
  
  // MSSQL INSERT syntax - changed from MySQL SET to VALUES
  const query = `
    INSERT INTO contacts (
      contactid, firstname, lastname, companyname, email, 
      phonemobile, phonemobile2, phonehome, phonehome2, phonebusiness, 
      phonebusiness2, phoneother, faxbusiness, faxhome, pager, photourl, pwd_ivr, saldo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    contactid,
    contactData.firstname,
    contactData.lastname,
    contactData.companyname,
    contactData.email,
    contactData.phonemobile,
    contactData.phonemobile2,
    contactData.phonehome,
    contactData.phonehome2,
    contactData.phonebusiness,
    contactData.phonebusiness2,
    contactData.phoneother,
    contactData.faxbusiness,
    contactData.faxhome,
    contactData.pager,
    contactData.photourl,
    contactData.pwd_ivr || 0,
    contactData.saldo || '0.00',
  ];

  console.log('=== SQL DEBUG INFORMATION ===');
  console.log('Query:', query);
  console.log('Parameters:', params);
  console.log('Generated Contact ID:', contactid);
  
  try {
    const [result] = await execute<any>(query, params);
    
    console.log('=== QUERY RESULT ===');
    console.log('Result:', result);
    
    // MSSQL doesn't return insertId directly, we need to fetch the new contact
    const [newContactRows] = await execute<ContactRow[]>(
      'SELECT * FROM contacts WHERE contactid = ?',
      [contactid]
    );
    
    if (newContactRows.length === 0) {
      throw new Error('No rows were inserted');
    }

    return mapContactRowToContact(newContactRows[0]);
  } catch (error) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error executing query:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    } else {
      throw new Error('Failed to create contact due to an unknown error');
    }
  }
}

// Helper function
function generateContactId(): string {
  return 'ID_' + Math.random().toString(36).substring(2, 9);
}

export async function updateContact(
  contactid: string,
  contactData: Omit<Contact, 'idx' | 'contactid'>
): Promise<Contact> {
	
  const query = `
    UPDATE contacts SET
      firstname = ?,
      lastname = ?,
      companyname = ?,
      email = ?,
      phonemobile = ?,
      phonemobile2 = ?,
      phonehome = ?,
      phonehome2 = ?,
      phonebusiness = ?,
      phonebusiness2 = ?,
      phoneother = ?,
      faxbusiness = ?,
      faxhome = ?,
      pager = ?,
      photourl = ?,
      pwd_ivr = ?,
      saldo = ?
    WHERE contactid = ?
  `;
  
  const params = [
    contactData.firstname,
    contactData.lastname,
    contactData.companyname,
    contactData.email,
    contactData.phonemobile,
    contactData.phonemobile2,
    contactData.phonehome,
    contactData.phonehome2,
    contactData.phonebusiness,
    contactData.phonebusiness2,
    contactData.phoneother,
    contactData.faxbusiness,
    contactData.faxhome,
    contactData.pager,
    contactData.photourl,
    contactData.pwd_ivr || 0,
    contactData.saldo || '0.00',
    contactid
  ];

  console.log('=== SQL DEBUG INFORMATION ===');
  console.log('Query:', query);
  console.log('Parameters:', params);
  
  try {
    // Just execute the update - if it fails, it will throw an error
    await execute<any>(query, params);
    
    // Fetch the updated contact to verify and return
    const [updatedRows] = await execute<ContactRow[]>(
      'SELECT * FROM contacts WHERE contactid = ?',
      [contactid]
    );

    if (updatedRows.length === 0) {
      throw new Error('Contact not found - update may have failed');
    }

    return mapContactRowToContact(updatedRows[0]);
  } catch (error) {
    console.error('Database error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    } else {
      throw new Error('Failed to update contact due to an unknown error');
    }
  }
}

export async function getCallCount(phonebusiness: string): Promise<number> {
  const [rows] = await execute<CountResult[]>(
    `SELECT COUNT(*) as total FROM calls WHERE contactnumber = ?`,
    [phonebusiness]
  );
  return rows[0].total;
}

export async function getChatCount(email: string): Promise<number> {
  const [rows] = await execute<CountResult[]>(
    `SELECT COUNT(*) as total FROM chats WHERE email = ?`,
    [email]
  );
  return rows[0].total;
}

export interface ContactWithStats extends Contact {
  callCount: number;
  chatCount: number;
}

export async function getCallsByNumber(phoneNumber: string) {
  const [rows] = await execute<CallRow[]>(
    `SELECT * FROM calls WHERE contactnumber = ? ORDER BY calldatetime DESC`,
    [phoneNumber]
  );
  return rows;
}

export async function getChatsByEmail(email: string) {
  const [rows] = await execute<ChatRow[]>(
    `SELECT * FROM chats WHERE email = ? ORDER BY calldatetime DESC`,
    [email]
  );
  return rows;
}