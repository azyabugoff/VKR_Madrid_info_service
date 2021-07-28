var page = require('webpage').create();

module.exports = function(data, done, worker) {
    page.open(data.url, function() {
        var htmlForParse = page.evaluate(function(selector){
            document.getElementById(selector).click();
            return document.documentElement.innerHTML;
        }, 'button' + data.chosenCountry);
        done(null, {html: htmlForParse});
    });
};
