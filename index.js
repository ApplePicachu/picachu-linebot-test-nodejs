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
    const insertUserText = 'INSERT INTO service_users(line_id, line_name, state_update_time) VALUES($1, $2, now())';
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
                    }
                });
            }
        }).catch(function (err) {
            console.log(err.stack);
            bot.push(process.env.LineAdminUserID, { type: 'text', text: err.stack });
        });
    });
    if (event.source.userId == process.env.LineAdminUserID) {
        switch (event.message.text) {
            case 'drop':
                client.query('\
                DROP TABLE IF EXISTS service_users;\
                CREATE TABLE IF NOT EXISTS service_users (\
                id SERIAL,\
                line_id CHAR(33) NOT NULL,\
                line_name VARCHAR(50) NULL,\
                user_group INT NULL,\
                init_state INT NULL,\
                init_state_extra VARCHAR(50) NULL,\
                cur_state INT NULL,\
                cur_state_extra VARCHAR(50) NULL,\
                state_update_time TIMESTAMP NOT NULL,\
                PRIMARY KEY(id)\
            )').then(function (res) {
                        bot.push(process.env.LineAdminUserID, { type: 'text', text: 'Drop success.' });
                    }).catch(function (err) {
                        console.log(err.stack);
                        bot.push(process.env.LineAdminUserID, { type: 'text', text: err.stack });
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
bot.on('postback', function(event) {

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
    client.query('SELECT NOW() as now', (err, res) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(res.rows[0])
        }
    });

    client.query('\
        CREATE TABLE IF NOT EXISTS service_users (\
        id SERIAL,\
        line_id CHAR(33) NOT NULL,\
        line_name VARCHAR(50) NULL,\
        user_group INT NULL,\
        init_state INT NULL,\
        init_state_extra VARCHAR(50) NULL,\
        cur_state INT NULL,\
        cur_state_extra VARCHAR(50) NULL,\
        state_update_time TIMESTAMP NOT NULL,\
        PRIMARY KEY(id)\
    )', (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                // console.log('CREATE ' + res.rows[0]);
            }
        });
});