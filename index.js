var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    channelId: 1540241808,
    channelSecret: '8f4303ea0d34c907e83b5bbf2fca3c54',
    channelAccessToken: 'URz0aIlfwkPoCvawLRwdhkVS+YV0we0qfXVpmqsY58/qDwNpqnjP6+oGCutcUmQbn1gRpGXcl8jkIYANj2dH5bFVPDes2FhZH9KEyE1RJxHxEFku2Yo/La/WV6fZMa5cGMvZ6MAQgVdZdxDc9BghLwdB04t89/1O/w1cDnyilFU=',
    varify: true
});
bot.on('message', function (event) {
    console.log(event); //把收到訊息的 event 印出來看看
    event.reply({type: 'text', text: event.message.text})
    event.reply({
        type: "template",
        altText: "this is a buttons template",
        template: {
            type: "buttons",
            thumbnailImageUrl: "https://i.pinimg.com/736x/76/47/9d/76479dd91dc55c2768ddccfc30a4fbf5--pikachu-halloween-costume-diy-halloween-costumes.jpg",
            title: "Menu",
            text: "Please select",
            actions: [
                {
                  type: "postback",
                  label: "Buy",
                  data: "action=buy&itemid=123"
                }
            ]
        }
      })
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});