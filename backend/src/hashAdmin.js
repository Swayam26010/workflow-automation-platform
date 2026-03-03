const bcrypt = require("bcrypt");

(async () => {
  const hashed = await bcrypt.hash("123456", 10);  // 👈 employee password
  console.log("Hashed password:");
  console.log(hashed);
})();