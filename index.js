var linebot = require('linebot');
var express = require('express');
var Airtable = require('airtable');
const { Client } = require('pg');
const gfp = require('./google_form_parser');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
client.connect();

var airtableBase = new Airtable({ apiKey: process.env.AirtableApiKey }).base(process.env.AirtableTableKey);

var bot = linebot({
    channelId: process.env.LineBotChannelId,
    channelSecret: process.env.LineBotChannelSecret,
    channelAccessToken: process.env.LineBotChannelAccessToken,
    varify: true
});
bot.on('follow', function (event) {

});
bot.on('unfollow', function (event) {

});
bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    const insertUserText = 'INSERT INTO service_users(line_id, line_name, status_update_time) VALUES($1, $2, now())';
    event.source.profile().then(function (profile) {
        client.query(insertUserText, ['U828934c2ea1f46a8243398b2fe3e898c', profile.displayName], (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                client.query('SELECT * FROM service_users', (err, res) => {
                    if (err) {
                        console.log(err.stack);
                    } else {
                        console.log('SELECT %j', res.rows[0]);
                        bot.push(process.env.LineAdminUserID, { type: 'text', text: res.rows[0] });
                    }
                });
            }
        }).catch(function (err) {
            console.log(err.stack);
            bot.push(process.env.LineAdminUserID, { type: 'text', text: err.stack });
        });
    });
    if (event.source.userId == process.env.LineAdminUserID) {
        switch (event.message.text.toLowerCase()) {
        case 'drop':
            dropAndCreateTable(client, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    bot.push(process.env.LineAdminUserID, { type: 'text', text: err.stack });
                } else {
                    bot.push(process.env.LineAdminUserID, { type: 'text', text: 'Drop success.' });
                }
            });
            break;
        }
    }

    // airtableBase('居家喘息').select({
    //     // Selecting the first 3 records in Grid view:
    //     maxRecords: 3,
    //     view: "Grid view"
    // }).eachPage(function page(records, fetchNextPage) {
    //     // This function (`page`) will get called for each page of records.
    //     var replyString = "";
    //     records.forEach(function (record) {
    //         console.log('Retrieved', record.get('單位名稱'));
    //         replyString += record.get('單位名稱') + '\n';
    //     });
    //     // event.reply({type: 'text', text:replyString});
    //     // event.reply({ type: 'text', text: event.message.text });
    //     event.reply({
    //         type: 'template',
    //         altText: 'this is a buttons template',
    //         template: {
    //             type: 'buttons',
    //             thumbnailImageUrl: process.env.LogoURL,
    //             title: replyString,
    //             text: 'Please select',
    //             actions: [{
    //                 type: 'datetimepicker',
    //                 label: '選擇時間',
    //                 data: 'action=add&itemid=123',
    //                 mode: 'datetime'
    //             }/*, {
    //                 type: 'postback',
    //                 label: 'Add to cart',
    //                 data: 'action=add&itemid=123'
    //             }, {
    //                 type: 'uri',
    //                 label: 'View detail',
    //                 uri: 'http://google.com'
    //             }*/]
    //         }
    //     });
    //     // To fetch the next page of records, call `fetchNextPage`.
    //     // If there are more records, `page` will get called again.
    //     // If there are no more records, `done` will get called.
    //     fetchNextPage();

    // }, function done(err) {
    //     if (err) { console.error(err); return; }
    // });


});
bot.on('postback', function (event) {

});
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

app.get('/api/parse/google_form', function (req, res) {
    var reqUrl = req.query['url'];
    if (reqUrl == null) {
        res.status(400);
        res.send('No url input.');
    }
    gfp(reqUrl, function (err, data) {
        if (err != null) {
            console.log(err.stack);
            res.status(400);
            res.send(err.toString());
        } else {
            res.send(data);
            console.log(data);
        }
    });
});

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);

    //Print out NOW()
    client.query('DROP TABLE IF EXISTS service_users;SELECT NOW() as now;', (err, res) => {
        if (err) {
            console.log(err.stack);
        } else {
            // console.log(res.rows[0].now);
        }
    });

    checkTableExists(client, (err, res) => {
        if (err) {
            console.log(err.stack);
        } else {
            if (!res.rows[0].exists) {
                dropAndCreateTable(client, (err, res) => {
                    if (err) {
                        console.log(err.stack);
                    } else {
                        console.log('CREATE ' + res);
                    }
                });
            }
            console.log('Check table exists \n' + res.rows[0].exists + '\n' + JSON.stringify(res));
        }
    });
});

function checkTableExists(client, callback) {
    client.query('\
    SELECT EXISTS (\
        SELECT 1 \
        FROM   pg_tables\
        WHERE  tablename = \'service_users\'\
        );\
    ', callback);
}
function dropAndCreateTable(client, callback) {
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
};