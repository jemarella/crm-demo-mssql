import pool from '../database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password: string;
  // Add other user fields as needed
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user fields (without password)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) return null;
    
    const user = rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) return null;
    
    const user = rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.password);
    
    if (passwordsMatch) {
      return {
        id: user.id,
        name: user.name,
        email: user.email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to verify credentials:', error);
    throw new Error('Failed to verify credentials.');
  }
}