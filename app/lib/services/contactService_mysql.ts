import pool from '../database';
import { RowDataPacket , ResultSetHeader} from 'mysql2';

// Extend RowDataPacket to properly type our results
interface ContactRow extends RowDataPacket {
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
  saldo: string ;
}

// Count result type
interface CountResult extends RowDataPacket {
  total: number;
}

interface CallRow extends RowDataPacket {
  callid: string;
  contactnumber: string;
  agentextension: string;
  description: string;
  calldatetime: Date;
  callduration: number;
}

interface ChatRow extends RowDataPacket {
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

  // Remove duplicate search condition block
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
    
    // Add parameters once (removed duplicate push)
    params.push(
      searchParam, searchParam, searchParam, searchParam,
      searchParam, searchParam, searchParam
    );
    countParams.push(
      searchParam, searchParam, searchParam, searchParam,
      searchParam, searchParam, searchParam
    );
  }

  // Add pagination parameters
  query += ` LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`;

  try {
    // Debugging: Log the final query and parameters
    console.log('Executing query:', query);
    console.log('With parameters:', params);
    
    const [rows] = await pool.execute<ContactRow[]>(query, params);
    const [countRows] = await pool.execute<CountResult[]>(countQuery, countParams);

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
        // Set default values for unused fields
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
  let query = `SELECT * FROM contacts WHERE 1=1`; // Start with a true condition
  const params: string[] = [];

  if (phonebusiness) {
    query += ` AND phonebusiness = ?`;
    params.push(phonebusiness);
  } else if (email) { // Only search by email if phonebusiness is not provided
    query += ` AND email = ?`;
    params.push(email);
  } else if (contactid) { // Only search by email if phonebusiness is not provided
    query += ` AND contactid = ?`;
    params.push(contactid);
  } else {
    // If neither is provided, return null immediately without querying the database
    return null;
  }

  try {
    console.log('Executing getContactByPhoneOrEmail query:', query, 'with params:', params);
    const [rows] = await pool.execute<ContactRow[]>(query, params);

    if (rows.length === 0) return null;

    return mapContactRowToContact(rows[0]); // Use the mapping function
  } catch (error) {
    console.error('Database Error in getContactByPhoneOrEmail:', error);
    throw new Error('Failed to fetch contact by phone or email');
  }
}

export async function getContactById(contactId: string): Promise<Contact | null> {
  const [rows] = await pool.execute<ContactRow[]>(
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

// Add these new methods to your existing contactService.ts

export async function createContact(contactData: Omit<Contact, 'idx' | 'contactid'>): Promise<Contact> {
  const contactid = generateContactId();
  
  // Explicit column listing in SET clause
  const query = `
    INSERT INTO contacts SET
      contactid = ?,
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
      photourl = ?
  `;
  
  // Parameters in the correct order
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
    contactData.pwd_ivr,
    contactData.saldo,
  ];

  // Debugging output shows the exact query structure
  console.log('=== SQL DEBUG INFORMATION ===');
  console.log('Query:', query);
  console.log('Parameters:', params);
  console.log('Generated Contact ID:', contactid);
  
  try {
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    
    console.log('=== QUERY RESULT ===');
    console.log('Insert ID:', result.insertId);
    console.log('Affected Rows:', result.affectedRows);
    
    if (result.affectedRows !== 1) {
      throw new Error('No rows were inserted');
    }

    return {
      ...contactData,
      idx: result.insertId,
      contactid
    };
  } catch (error) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error executing query:', error);
    
    // Format the query with parameters for debugging
    let debugQuery = query;
    params.forEach((param, index) => {
      debugQuery = debugQuery.replace('?', typeof param === 'string' ? `'${param}'` : String(param));
    });
    console.error('Failed Query:', debugQuery);
    
    if (error instanceof Error) {
      const mysqlError = error as {
        code?: string;
        sqlState?: string;
        sqlMessage?: string;
      };
      
      console.error('MySQL Error Code:', mysqlError.code);
      console.error('MySQL SQL State:', mysqlError.sqlState);
      console.error('MySQL Message:', mysqlError.sqlMessage);
      
      throw new Error(`Failed to create contact: ${error.message}`);
    } else {
      console.error('Unknown error type:', error);
      throw new Error('Failed to create contact due to an unknown error');
    }
  }
}

// Helper function (add to utilities)
function generateContactId(): string {
  return 'ID_' + Math.random().toString(36).substring(2, 9);
}


// Add this to your existing contactService.ts
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
    contactData.pwd_ivr,
    contactData.saldo,
    contactid
  ];

  console.log('=== SQL DEBUG INFORMATION ===');
  console.log('Query:', query);
  console.log('Parameters:', params);
  console.log('Generated Contact ID:', contactid);

  try {
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    
    if (result.affectedRows !== 1) {
      throw new Error('No rows were updated - contact not found');
    }

    return {
      ...contactData,
      idx: 0, // This will be ignored in the response
      contactid
    };
  } catch (error) {
    console.error('Database error:', error);
    
    if (error instanceof Error) {
      const mysqlError = error as {
        code?: string;
        sqlState?: string;
        sqlMessage?: string;
      };
      
      throw new Error(`Failed to update contact: ${mysqlError.sqlMessage || error.message}`);
    } else {
      throw new Error('Failed to update contact due to an unknown error');
    }
  }
}

export async function getCallCount(phonebusiness: string): Promise<number> {
  const [rows] = await pool.execute<CountResult[]>(
    `SELECT COUNT(*) as total FROM calls WHERE contactnumber = ?`,
    [phonebusiness]
  );
  return rows[0].total;
}

export async function getChatCount(email: string): Promise<number> {
  const [rows] = await pool.execute<CountResult[]>(
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
  const [rows] = await pool.execute<CallRow[]>(
    `SELECT * FROM calls WHERE contactnumber = ? ORDER BY calldatetime DESC`,
    [phoneNumber]
  );
  return rows;
}

export async function getChatsByEmail(email: string) {
  const [rows] = await pool.execute<ChatRow[]>(
    `SELECT * FROM chats WHERE email = ? ORDER BY calldatetime DESC`,
    [email]
  );
  return rows;
}