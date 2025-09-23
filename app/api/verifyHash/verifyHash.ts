import bcrypt from 'bcrypt';

const hash = '$2b$10$hfopIwo/7eTO10dF9cB6i.DjULQRSJb.DMun77rXz/xO4N6JYbt36';
const password = 'testpassword';

bcrypt.compare(password, hash)
  .then(match => console.log('Password matches:', match))
  .catch(err => console.error('Error:', err)); 