/*
 *  * Utility Functions
 *   */
exports.setDebug = function(val) {
        debug = !! val;
};

exports.isDebug = function() {
        return debug;
};

exports.dateToArray = function(dateObj) {
        if (typeof dateObj !== 'object')
                dateObj = new Date(dateObj);
        return [
                dateObj.getFullYear(),
                dateObj.getMonth() + 1,
                dateObj.getDate(),
                dateObj.getHours(),
                dateObj.getMinutes(),
                dateObj.getSeconds()
        ];
};

