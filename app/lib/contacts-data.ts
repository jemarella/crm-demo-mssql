// app/lib/contacts-data.ts
import { query } from '@/app/lib/database';

export interface CountResult { 
  count: number; 
}

interface CallRow {
  id: string;
  contactnumber: string;
  calldatetime: Date;
  duration: number;
  // add other call fields as needed
}

interface ChatRow {
  id: string;
  email: string;
  chatdatetime: Date;
  message: string;
  // add other chat fields as needed
}

const ITEMS_PER_PAGE = 6;

export interface Contact {
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
  saldo: number;
}

export interface ContactWithStats extends Contact {
  callCount: number;
  chatCount: number;
}

export async function fetchFilteredContacts(
  queryParam: string,
  currentPage: number,
): Promise<Contact[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const contacts = await query<Contact>(`
      SELECT 
        idx,
        contactid,
        firstname,
        lastname,
        companyname,
        email,
        phonemobile,
        phonemobile2,
        phonehome,
        phonehome2,
        phonebusiness,
        phonebusiness2,
        phoneother,
        faxbusiness,
        faxhome,
        pager,
        photourl,
        pwd_ivr,
        saldo
      FROM contacts
      WHERE
        firstname LIKE ? OR
        lastname LIKE ? OR
        companyname LIKE ? OR
        email LIKE ? OR
        phonemobile LIKE ? OR
        phonebusiness LIKE ? OR
        CAST(saldo AS VARCHAR) LIKE ?
      ORDER BY firstname, lastname
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        offset,
        ITEMS_PER_PAGE
      ]
    );

    // Enhance contacts with call and chat counts
    const contactsWithStats = await Promise.all(
      contacts.map(async (contact) => {
        const callCount = await getCallCount(contact.phonebusiness);
        const chatCount = await getChatCount(contact.email);
        
        return {
          ...contact,
          callCount,
          chatCount
        } as ContactWithStats;
      })
    );

    return contactsWithStats;

    //return contacts;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch contacts.');
  }
}

export async function fetchContactsPages(queryParam: string): Promise<number> {
  try {
    const data = await query<CountResult>(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE
        firstname LIKE ? OR
        lastname LIKE ? OR
        companyname LIKE ? OR
        email LIKE ? OR
        phonemobile LIKE ? OR
        phonebusiness LIKE ? OR
        CAST(saldo AS VARCHAR) LIKE ?`,
      [
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`,
        `%${queryParam}%`
      ]
    );

    return Math.ceil(Number(data[0]?.count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of contacts.');
  }
}

export async function fetchContactById(id: string): Promise<Contact | null> {
  try {
    const data = await query<Contact>(`
      SELECT 
        idx,
        contactid,
        firstname,
        lastname,
        companyname,
        email,
        phonemobile,
        phonemobile2,
        phonehome,
        phonehome2,
        phonebusiness,
        phonebusiness2,
        phoneother,
        faxbusiness,
        faxhome,
        pager,
        photourl,
        pwd_ivr,
        saldo
      FROM contacts
      WHERE contactid = ?`,
      [id]
    );

    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch contact.');
  }
}

// Optional: Add a function to fetch all contacts (without pagination)
export async function fetchAllContacts(): Promise<Contact[]> {
  try {
    return await query<Contact>(`
      SELECT 
        idx,
        contactid,
        firstname,
        lastname,
        companyname,
        email,
        phonemobile,
        phonemobile2,
        phonehome,
        phonehome2,
        phonebusiness,
        phonebusiness2,
        phoneother,
        faxbusiness,
        faxhome,
        pager,
        photourl,
        pwd_ivr,
        saldo
      FROM contacts
      ORDER BY firstname, lastname`
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch contacts.');
  }
}

export async function getCallCount(phonebusiness: string): Promise<number> {
  const rows = await query<CountResult>(
    `SELECT COUNT(*) as total FROM calls WHERE contactnumber = ?`,
    [phonebusiness]
  );
  return rows[0]?.count || 0;
}

export async function getChatCount(email: string): Promise<number> {
  const rows = await query<CountResult>(
    `SELECT COUNT(*) as total FROM chats WHERE email = ?`,
    [email]
  );
  return rows[0]?.count || 0;
}

export async function getCallsByNumber(phoneNumber: string) {
  const rows = await query<CallRow>(
    `SELECT * FROM calls WHERE contactnumber = ? ORDER BY calldatetime DESC`,
    [phoneNumber]
  );
  return rows;
}

export async function getChatsByEmail(email: string) {
  const rows = await query<ChatRow>(
    `SELECT * FROM chats WHERE email = ? ORDER BY chatdatetime DESC`, // Fixed column name
    [email]
  );
  return rows;
}