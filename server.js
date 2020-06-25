const app = require('./app');
const log = require("./src/log/Logger");

const PORT = 3009;

app.listen(PORT, function () {
    log.debug("Server is running and currently listing at port", PORT);
});