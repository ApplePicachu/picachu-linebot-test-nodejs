function idfromurl(url){
    m = url.match('https?://docs.google.com/forms/d/(.{16}[^/]*)/');
    return m?m[1]:m;
}


const URL = require('url');
const HTTPS = require('https');
var formUrlStr = process.argv[2];
console.log(idfromurl(formUrlStr));
if (idfromurl(formUrlStr)) {
    var formUrl = URL.parse('https://docs.google.com/forms/d/e/1FAIpQLSdIl1IEWfqzFhgqSPNxYgbaZWT9YiMVcOH7vpdys0cSDHz06Q/viewform');
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
            console.log('rawData write ended.');
            console.log(rawData.match('FB_PUBLIC_LOAD_DATA_\s*=\s*(.*?);\s*</script>')[1]);
            // console.log(rawData);
            // try {
            //     const parsedData = JSON.parse(rawData);
            //     console.log(parsedData);
            // } catch (e) {
            //     console.error(e.message);
            // }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

// HTTP.get('http://nodejs.org/dist/index.json', (res) => {
//     const { statusCode } = res;
//     const contentType = res.headers['content-type'];

//     let error;
//     if (statusCode !== 200) {
//         error = new Error('Request Failed.\n' +
//             `Status Code: ${statusCode}`);
//     } else if (!/^application\/json/.test(contentType)) {
//         error = new Error('Invalid content-type.\n' +
//             `Expected application/json but received ${contentType}`);
//     }
//     if (error) {
//         console.error(error.message);
//         // consume response data to free up memory
//         res.resume();
//         return;
//     }
//     res.setEncoding('utf8');
//     let rawData = '';
//     res.on('data', (chunk) => { rawData += chunk; });
//     res.on('end', () => {
//         try {
//             const parsedData = JSON.parse(rawData);
//             console.log(parsedData);
//         } catch (e) {
//             console.error(e.message);
//         }
//     });
// }).on('error', (e) => {
//     console.error(`Got error: ${e.message}`);
// });