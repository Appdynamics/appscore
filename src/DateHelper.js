var moment = require('moment');

exports.getTodayAsNumber = function(){
	return moment().format('YYYYMMDD'); 
}
