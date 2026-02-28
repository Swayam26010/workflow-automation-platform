// src/hashAdmin.js
const hashPassword = require('./utils/hashPassword');

(async () => {
  const hashed = await hashPassword('admin123');
  console.log('Hashed password:', hashed);
})();