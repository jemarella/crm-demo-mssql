import bcrypt from 'bcrypt';

const password = 'testpassword'; // Your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('NEW HASH:', hash);
    console.log('SQL INSERT COMMAND:');
    console.log(`INSERT INTO users (id, name, email, password) VALUES (UUID(), 'pjmx', 'pjmx@example.com', '${hash}');`);
  })
  .catch(err => console.error('Error:', err));