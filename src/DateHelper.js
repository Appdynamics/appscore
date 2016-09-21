var moment = require('moment');

exports.getTodayAsNumber = function(){
	return moment().format('YYYYMMDD'); 
}

exports.getDateAsNumber = function(date){
	return date.format('YYYYMMDD');
}

exports.getPreviousDay = function(){
	return moment().add(-1, 'days');; 
}

exports.getPreviousDay = function(date){
	return date.add(-1, 'days');; 
}

exports.getPreviousDateAsNumber = function(chosenDate){
	var date = this.getMomentForDate(chosenDate);
	var prevDate = this.getPreviousDay(date);
	return parseInt(this.getDateAsNumber(prevDate));
}


exports.getTodayAsMilliseconds = function(){
	return moment().valueOf();
}

exports.getMomentForDate = function(date){
	return moment(date);
}

exports.getStartTime = function(dayMoment){
	var startDate = moment(dayMoment);
	startDate.hour(0);
	startDate.minute(0);
	startDate.second(0);
	startDate.milliseconds(0);
	return startDate.valueOf();
}

exports.getEndTime = function(dayMoment){
	var endDate = moment(dayMoment);
	endDate.hour(23);
	endDate.minute(59);
	endDate.second(59);
	endDate.milliseconds(999);
	return endDate.valueOf();
}

exports.getTimeRange = function(){
	return this.getFormatTimeRange(moment());
}

exports.getPreviousDayTimeRange = function(){
	return this.getFormatTimeRange(this.getPreviousDay());
}

exports.getFormatTimeRange = function(dayMoment) {
	return "time-range-type=BETWEEN_TIMES&start-time="+this.getStartTime(dayMoment)+"&end-time="+this.getEndTime(dayMoment);	
}