const HTTPS = require('https');

var exports = module.exports = {};

module.exports = function (url, callback) {
    // console.log(idfromurl(url));
    if (idfromurl(url) == null) {
        return callback(new Error('url input \'' + url + '\' is not a correct google form url.'));
    }
    HTTPS.get(url, (res) => {
        const { statusCode } = res;
        var error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            res.resume(); // consume response data to free up memory
            return callback(error);
        }
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            // console.log('rawData write ended.');
            rawData = rawData.replace(/(\r\n|\n|\r)/g, '');//Remove white spaces
            var regExp = new RegExp(/FB_PUBLIC_LOAD_DATA_\s*=\s*(.+);\s*<\/script>/);//Extract data from var FB_PUBLIC_LOAD_DATA
            var formDataStr = rawData.match(regExp)[1];
            // console.log(formDataStr);
            try {
                var formDataJson = JSON.parse(formDataStr);
                var outputFormObject = {};
                outputFormObject = {
                    id: formDataJson[14],
                    name: formDataJson[3],
                    title: formDataJson[1][8],
                    description: formDataJson[1][0],
                    body: []
                };
                // console.log(outputFormObject);
                var formBody = formDataJson[1][1];
                for (var i = 0; i < formBody.length; i++) {
                    // console.log(i + ' ' + formBody[i][1] + ' ' + formBody[i][3]);
                    var formBodyItemObject = convertFormBody(formBody[i]);
                    // console.log(formBodyItemObject);
                    outputFormObject['body'].push(formBodyItemObject);
                }
                return callback(null, outputFormObject);

            } catch (e) { //Probably json parse error.
                console.error(e.message);
                return callback(e);
            }
        });
    }).on('error', (e) => { // HTTPS get error.
        console.error(`Got error: ${e.message}`);
        return callback(e);
    });
}
function convertFormBody(formBodyItem) {
    var outputFormBodyItemObject = {
        id : formBodyItem[0],
        type : formBodyItem[3],
        title : formBodyItem[1],
        description : formBodyItem[2],
        content : typeof formBodyItem[6]=='undefined'?null:formBodyItem[6], // Not analyze yet, put source data in it.
        image : typeof formBodyItem[9]=='undefined'?null:formBodyItem[9] // Not analyze yet, put source data in it.
    }
    if (ItemEmgu.properties[outputFormBodyItemObject.type].inputable) {
        outputFormBodyItemObject.inputID = formBodyItem[4][0][0];
        outputFormBodyItemObject.required = formBodyItem[4][0][2]==1?true:false;
        if (ItemEmgu.properties[outputFormBodyItemObject.type].hasOptions) {
            outputFormBodyItemObject.options = [];
            var formBodyItemOptions = formBodyItem[4][0][1];
            for (var i = 0; i < formBodyItemOptions.length; i++) {
                var option = formBodyItemOptions[i];
                var outputOption = {
                    title : option[4]!='1'?option[0]:'__other_option__',
                    other : option[4]=='1',
                    image : typeof option[5]=='undefined'?null:option[5] // Not analyze yet, put source data in it.
                };
                outputFormBodyItemObject.options.push(outputOption);
            }
        }
    }
    return outputFormBodyItemObject;
}
function idfromurl(url) {
    m = url.match('https?://docs.google.com/forms/d/(.{16}[^/]*)/');
    return m ? m[1] : m;
}
var ItemEmgu = {
    ShortAnswer : 0,
    Paragraph : 1,
    MultipleChoice : 2,
    Dropdown : 3,
    Checkboxes : 4,
    LinearScale : 5,
    TitleDescription : 6,
    Grid : 7,
    NextSection : 8,
    Date : 9,
    Time : 10,
    Image : 11,
    Video : 12,
    properties : {
        0 : {name : 'Short Answer', inputable : true, hasOptions : false},
        1 : {name : 'Paragraph', inputable : true, hasOptions : false},
        2 : {name : 'Multiple Choice', inputable : true, hasOptions : true},
        3 : {name : 'Drop-down', inputable : true, hasOptions : true},
        4 : {name : 'Checkboxes', inputable : true, hasOptions : true},
        5 : {name : 'Linear Scale', inputable : true, hasOptions : false}, // Not analyze yet.
        6 : {name : 'Title and Description', inputable : false, hasOptions : false},// Not analyze yet.
        7 : {name : 'Grid', inputable : true, hasOptions : false},// Not analyze yet.
        8 : {name : 'NextSection', inputable : false, hasOptions : false},// Not analyze yet.
        9 : {name : 'Date', inputable : true, hasOptions : false},
        10 : {name : 'Time', inputable : true, hasOptions : false},
        11 : {name : 'Image', inputable : false, hasOptions : false},
        12 : {name : 'Video', inputable : false, hasOptions : false}
    }
}
//JSON position lookup
//
//var formName = formDataJson[3];
//var formId = formDataJson[14];
//var formSectionTitle = formDataJson[1][8];
//var formSectionDescription = formDataJson[1][0];
//var formBody = formDataJson[1][1];
//    var itemNumber = 0
//    var formBodyItem = formDataJson[1][1][itemNumber];
//    var formBodyItemId = formDataJson[1][1][itemNumber][0];    //項目ID
//    var formBodyItemTitle = formDataJson[1][1][itemNumber][1]; //項目標題
//    var formBodyItemDescription = formDataJson[1][1][itemNumber][2]; //項目說明
//    var formBodyItemType = formDataJson[1][1][itemNumber][3];  //0:簡答 1:段落 2:單選 3:下拉式選單 4:核取方塊 5:線性刻度 6:文字 7:單選方格/核取方塊格 8:下一區段 9:日期 10:時間 11:圖片 12:影片
//    var formBodyItemInputs = formDataJson[1][1][itemNumber][4];//項目輸入
//        //0:簡答輸入
//        var item0Number = 2;
//        var formBodyItem0ID = formDataJson[1][1][item0Number][4][0][0];        //輸入ID
//        var formBodyItem0Required = formDataJson[1][1][item0Number][4][0][2];  //0:非必填 1:必填
//        //1:段落輸入
//        var item1Number = 3;
//        var formBodyItem1ID = formDataJson[1][1][item1Number][4][0][0];        //輸入ID
//        var formBodyItem1Required = formDataJson[1][1][item1Number][4][0][2];  //0:非必填 1:必填
//        //2:單選輸入
//        var item2Number = 4;
//        var formBodyItem2ID = formDataJson[1][1][item2Number][4][0][0];        //輸入ID
//        var formBodyItem2Options = formDataJson[1][1][item2Number][4][0][1];   //選項組
//            var item2OptionNumber = 1;
//            var formBodyItem2OptionTitle = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][0]; //選項標題
//            var formBodyItem2OptionElse = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][4];  //1:其他選項
//            var formBodyItem2OptionImage = formDataJson[1][1][item2Number][4][0][1][item2OptionNumber][5]; //圖片
//        var formBodyItem2Required = formDataJson[1][1][item2Number][4][0][2];  //0:非必填 1:必填
//        //3:下拉式選單
//        var item3Number = 6;
//        var formBodyItem3ID = formDataJson[1][1][item3Number][4][0][0];        //輸入ID
//        var formBodyItem3Options = formDataJson[1][1][item3Number][4][0][1];   //選項組
//            var item3OptionNumber = 0;
//            var formBodyItem3OptionTitle = formDataJson[1][1][item3Number][4][0][1][item3OptionNumber][0]; //選項標題
//        var formBodyItem3Required = formDataJson[1][1][item3Number][4][0][2];  //0:非必填 1:必填
//        //4:核取方塊
//        var item4Number = 5;
//        var formBodyItem4ID = formDataJson[1][1][item4Number][4][0][0];        //輸入ID
//        var formBodyItem4Options = formDataJson[1][1][item4Number][4][0][1];   //選項組
//            var item4OptionNumber = 1;
//            var formBodyItem4OptionTitle = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][0]; //選項標題
//            var formBodyItem4OptionElse = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][4];  //1:其他選項
//            var formBodyItem4OptionImage = formDataJson[1][1][item4Number][4][0][1][item4OptionNumber][5]; //圖片
//        var formBodyItem4Required = formDataJson[1][1][item4Number][4][0][2];  //0:非必填 1:必填
//        //5:線性刻度
//        //6:文字
//        //7:單選方格/核取方塊格
//        //8:下一區段
//        //9:日期
//        var item9Number = 10;
//        var formBodyItem9ID = formDataJson[1][1][item9Number][4][0][0];        //輸入ID
//        var formBodyItem9Required = formDataJson[1][1][item9Number][4][0][2];  //0:非必填 1:必填
//        //10:時間
//        var item10Number = 11;
//        var formBodyItem10ID = formDataJson[1][1][item10Number][4][0][0];        //輸入ID
//        var formBodyItem10Required = formDataJson[1][1][item10Number][4][0][2];  //0:非必填 1:必填
//        //11:圖片
//        //12:影片
//    var formBodyItemContent = formDataJson[1][1][itemNumber][6]; //圖片、影片項目用
//    var formBodyItemImage = formDataJson[1][1][itemNumber][9]; //圖片