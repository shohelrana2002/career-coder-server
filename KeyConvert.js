const fs = require("fs");
const key = fs.readFileSync("./firebase-admin.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
// node file name diy e convert kor te ha be
