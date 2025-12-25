/*
  # Fix Admin Password to Plain Text

  1. Changes
    - Update Global_admin password from bcrypt hash to plain text 'admin'
    - This simplifies the authentication system for easier use
  
  2. Security Note
    - This uses plain text passwords for simplicity
    - In production, consider implementing proper password hashing
*/

UPDATE users 
SET password_hash = 'admin'
WHERE login = 'Global_admin';
