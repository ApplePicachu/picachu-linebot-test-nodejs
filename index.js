var linebot = require('linebot');
var express = require('express');
var Airtable = require('airtable');
const {Client} = require('pg');

console.log(process.env.DATABASE_URL);

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
bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    //Print out now()
    client.query('SELECT NOW() as now', (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })
      
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

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});