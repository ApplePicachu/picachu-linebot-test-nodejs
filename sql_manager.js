SQLManager = function(client) {
    this.client = client;
    this.checkUserTableExists = function(callback){
        checkTableExists(client, 'service_users', callback);
    }
}
module.exports = SQLManager;

function checkTableExists(client, tableName, callback) {
    const sqlCmd = 'SELECT EXISTS ( SELECT 1 FROM pg_tables WHERE tablename = $1 );';
    console.log(sqlCmd);
    client.query(sqlCmd, [tableName], callback);
}

