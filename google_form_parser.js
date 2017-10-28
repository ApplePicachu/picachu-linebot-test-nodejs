function idfromurl(url) {
    m = url.match('https?://docs.google.com/forms/d/(.{16}[^/]*)/');
    return m ? m[1] : m;
}

// const URL = require('url');
const HTTPS = require('https');
var formUrlStr = process.argv[2];
// console.log(idfromurl(formUrlStr));
if (idfromurl(formUrlStr)) {
    // var formUrl = URL.parse(formUrlStr);
    // console.log(formUrl);
    // console.log(formUrl.host);
    // console.log(formUrl.pathname);
    HTTPS.get(formUrlStr, (res) => {
        // console.log('http get callback');
        const { statusCode } = res;
        var error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            // console.log('rawData write ended.');
            rawData = rawData.replace(/(\r\n|\n|\r)/g, '');//remove white space
            var regExp = new RegExp(/FB_PUBLIC_LOAD_DATA_\s*=\s*(.+);\s*<\/script>/);
            var formDataStr = rawData.match(regExp)[1];
            // console.log(formDataStr);
            try {
                var formDataJson = JSON.parse(formDataStr);
                // console.log(formDataJson);
                for(var i = 0; i < 16; i++){
                    console.log(i+' '+formDataJson[1][1][i][1]+' '+formDataJson[1][1][i][3]);
                }
                // var formName = formDataJson[3];
                // var formId = formDataJson[14];
                // var formSectionTitle = formDataJson[1][8];
                // var formSectionDescription = formDataJson[1][0];
                // var formBody = formDataJson[1][1];
                //     var itemNumber = 0
                //     var formBodyItem = formDataJson[1][1][itemNumber];
                //     var formBodyItemId = formDataJson[1][1][itemNumber][0];    //項目ID
                //     var formBodyItemTitle = formDataJson[1][1][itemNumber][1]; //項目標題
                //     var formBodyItemDescription = formDataJson[1][1][itemNumber][2]; //項目說明
                //     var formBodyItemType = formDataJson[1][1][itemNumber][3];  //0:簡答 1:段落 2:單選 3:下拉式選單 4:核取方塊 5:線性刻度 6:文字 7:單選方格/核取方塊格 8:下一區段 9:日期 10:時間 11:圖片 12:影片
                //     var formBodyItemInputs = formDataJson[1][1][itemNumber][4];//項目輸入
                //         //0:簡答輸入
                //         var item0Number = 2;
                //         var formBodyItem0ID = formDataJson[1][1][item0Number][4][0][0];        //輸入ID
                //         var formBodyItem0Required = formDataJson[1][1][item0Number][4][0][2];  //0:非必填 1:必填
                //         //1:段落輸入
                //         var item1Number = 3;
                //         var formBodyItem1ID = formDataJson[1][1][item1Number][4][0][0];        //輸入ID
                //         var formBodyItem1Required = formDataJson[1][1][item1Number][4][0][2];  //0:非必填 1:必填
                //         //2:單選輸入
                //         var item2Number = 4;
                //         var formBodyItem2ID = formDataJson[1][1][item2Number][4][0][0];        //輸入ID
                //         var formBodyItem2Options = formDataJson[1][1][item2Number][4][0][1];   //選項組
                //             var item2OptionNumber = 1;
                //             var formBodyItem2OptionTitle = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][0]; //選項標題
                //             var formBodyItem2OptionElse = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][4];  //1:其他選項
                //             var formBodyItem2OptionImage = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][5]; //圖片
                //         var formBodyItem2Required = formDataJson[1][1][item2Number][4][0][2];  //0:非必填 1:必填
                //         //3:下拉式選單
                //         var item3Number = 6;
                //         var formBodyItem3ID = formDataJson[1][1][item3Number][4][0][0];        //輸入ID
                //         var formBodyItem3Options = formDataJson[1][1][item3Number][4][0][1];   //選項組
                //             var item3OptionNumber = 0;
                //             var formBodyItem3OptionTitle = formDataJson[1][1][item3Number][4][0][1][item3OptionNumber][0]; //選項標題
                //         var formBodyItem3Required = formDataJson[1][1][item3Number][4][0][2];  //0:非必填 1:必填
                //         //4:核取方塊
                //         var item4Number = 5;
                //         var formBodyItem4ID = formDataJson[1][1][item4Number][4][0][0];        //輸入ID
                //         var formBodyItem4Options = formDataJson[1][1][item4Number][4][0][1];   //選項組
                //             var item4OptionNumber = 1;
                //             var formBodyItem4OptionTitle = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][0]; //選項標題
                //             var formBodyItem4OptionElse = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][4];  //1:其他選項
                //             var formBodyItem4OptionImage = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][5]; //圖片
                //         var formBodyItem4Required = formDataJson[1][1][item4Number][4][0][2];  //0:非必填 1:必填
                //         //5:線性刻度
                //         //6:文字
                //         //7:單選方格/核取方塊格
                //         //8:下一區段
                //         //9:日期
                //         var item9Number = 10;
                //         var formBodyItem9ID = formDataJson[1][1][item9Number][4][0][0];        //輸入ID
                //         var formBodyItem9Required = formDataJson[1][1][item9Number][4][0][2];  //0:非必填 1:必填
                //         //10:時間
                //         var item10Number = 11;
                //         var formBodyItem10ID = formDataJson[1][1][item10Number][4][0][0];        //輸入ID
                //         var formBodyItem10Required = formDataJson[1][1][item10Number][4][0][2];  //0:非必填 1:必填
                //         //11:圖片
                //         //12:影片
                //     var formBodyItemContent = formDataJson[1][1][itemNumber][6]; //圖片、影片項目用
                //     var formBodyItemImage = formDataJson[1][1][itemNumber][9]; //圖片

            } catch (e) {
                console.error(e.message);
                return;
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}