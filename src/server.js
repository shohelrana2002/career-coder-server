const app = require("./app");
const { connectDB } = require("./config/db");

const port = process.env.PORT || 4000;

(async () => {
  await connectDB();
  app.listen(port, () => console.log(`✅ Server running on port ${port}`));
})();
