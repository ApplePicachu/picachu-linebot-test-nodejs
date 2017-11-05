const gfp = require('./google_form_parser');
const fs = require('fs');
gfp('https://docs.google.com/forms/d/e/1FAIpQLSdIl1IEWfqzFhgqSPNxYgbaZWT9YiMVcOH7vpdys0cSDHz06Q/viewform',function(err, data){
    if (err != null){
        console.log(err);
    }
    // fs.writeFile('form.json', JSON.stringify(data), 'utf8', null);
    console.log(data);
})
