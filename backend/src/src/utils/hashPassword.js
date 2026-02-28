const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, saltRounds);
};

module.exports = hashPassword;