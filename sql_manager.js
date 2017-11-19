SQLManager = function(client) {
    this.client = client;
    this.checkUserTableExists = function(callback){
        checkTableExists(client, service_users, callback);
    }
}
function checkTableExists(client, tableName, callback) {
    client.query('\
    SELECT EXISTS (\
        SELECT 1 \
        FROM   pg_tables\
        WHERE  tablename = \'$1\'\
        );\
    ', [tableName], callback);
}