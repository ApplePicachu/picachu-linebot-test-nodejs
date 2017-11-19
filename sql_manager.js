SQLManager = function (client) {
    this.client = client;
    this.checkExistsTableUser = function (callback) {
        checkExistsTable(client, 'service_users', callback);
    }
    this.dropAndCreateTableUser = function (callback) {
        client.query('\
        DROP TABLE IF EXISTS service_users;\
        CREATE TABLE "service_users" (\
            "line_id" char(33) NOT NULL UNIQUE,\
            "line_name" varchar(20),\
            "user_group" int NOT NULL DEFAULT \'0\',\
            "status_init" bigint,\
            "status_init_extra" TEXT,\
            "status_current" bigint,\
            "status_current_extra" TEXT,\
            "info_json" TEXT,\
            "status_update_time" timestamp with time zone NOT NULL,\
            CONSTRAINT service_users_pk PRIMARY KEY ("line_id")\
        ) WITH (\
        OIDS=FALSE\
        );', callback);
    }
}
module.exports = SQLManager;

function checkExistsTable(client, tableName, callback) {
    const sqlCmd = 'SELECT EXISTS ( SELECT 1 FROM pg_tables WHERE tablename = $1 );';
    client.query(sqlCmd, [tableName], (err, res) => {
        if (err) {
            callback(err);
        } else {
            callback(null, res.rows[0].exists);
        }
    });
}