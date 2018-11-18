class TimeDifference {
    constructor(a_sqlTimestamp) { //expected: "YYYY-MM-DD HH:MM:SS"
        //LOCAL variables
        var currTime = new Date();
        var timezoneOffset = currTime.getTimezoneOffset() * 60000;

        //had some complications with UTC (different behaviour) on Mozilla
        //Mozilla auto-converts the string given via `new Date()` to UTC time
        //Chrome, Safari and Opera don't; they keep it in local time
        //tested and working on Safari, Mozilla and Chrome browsers
        if (navigator.userAgent.search("Firefox") >= 0) {
            var currUtcTime = new Date();
            var currLocalTime = new Date(currTime.getTime() - timezoneOffset);
            var timestamp = new Date(new Date(a_sqlTimestamp).getTime() - timezoneOffset);
            var midnightLocalTime = new Date(new Date(currLocalTime.getFullYear(),
                currLocalTime.getMonth(),
                currLocalTime.getDate()).getTime() - timezoneOffset);
        } else {
            //need to convert sql timestamp to Date js object
            var t = String(a_sqlTimestamp).split(/[- :]/);
            var timestamp = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
            //months are between 0 and 11 ->subtract 1
            var currUtcTime = new Date(currTime.getTime() + timezoneOffset);
            var currLocalTime = new Date();
            var midnightLocalTime = new Date(currLocalTime.getFullYear(),
                currLocalTime.getMonth(),
                currLocalTime.getDate());
        }
        var milisSinceMidnight = currLocalTime.getTime() - midnightLocalTime.getTime();

        //CLASS variables
        this.currentTime = Math.floor(currUtcTime.getTime() / 1000);
        this.midnightTime = Math.floor((currUtcTime.getTime() - milisSinceMidnight) / 1000);
        this.timestamp = Math.floor(timestamp.getTime() / 1000);
        this.outputStrIndex = 0;
        this.outputIndex = '';
        this.agoForm = false;
        this.pluralForm = false;
        this.isValid = true; //timestamp is not in the future

        this.secondsInDay = 24 * 60 * 60;
        this.secondsInWeek = this.secondsInDay * 7;
        this.secondsInMonth = this.secondsInDay * 30; //approximation
        this.secondsInYear = this.secondsInDay * 365; //approximation
    }

    moreThan1YearAgo() {
        return ((this.currentTime - this.timestamp) > this.secondsInYear);
    }
    moreThan1MonthAgo() {
        return ((this.currentTime - this.timestamp) > this.secondsInWeek * 4); //approximation to simplify
    }
    moreThan1WeekAgo() {
        return ((this.currentTime - this.timestamp) > this.secondsInWeek);
    }

    checkIfValid() { //evaluates to false if the timestamp is in future
        this.isValid = (this.currentTime >= this.timestamp);
        return this.isValid;
    }

    dateIsToday() {
        var seconds = (this.currentTime - this.timestamp);
        // [seconds, minutes, hours]
        var secMinHrs = [seconds, Math.floor(seconds / 60), Math.floor(seconds / 3600)];
        //if hours are not 0 their index; else if minutes are not 0 their; else number of seconds
        var index = (secMinHrs[2] ? 2 : (secMinHrs[1] ? 1 : 0))

        this.outputStrIndex = index + 6;
        this.outputIndex = String(secMinHrs[index]) + ' ';
        this.agoForm = true;
        this.pluralForm = (secMinHrs[index] != 1);
    }

    calculate() {
        if (!this.checkIfValid()) {} else if (!this.moreThan1WeekAgo()) {
            if (this.midnightTime <= this.timestamp) {
                this.dateIsToday();
                //this.outputStrIndex = 0; //'today'
                return;
            } else if ((this.midnightTime - this.secondsInDay) <= this.timestamp) {
                this.outputStrIndex = 1; //'yesterday'
                return;
            }
            for (var day = 2; day < 8; day++) {
                if ((this.midnightTime - this.secondsInDay * day) <= this.timestamp) {
                    this.outputStrIndex = 2; //'day'
                    this.outputIndex = String(day) + ' ';
                    this.agoForm = true;
                    this.pluralForm = true;
                    break;
                }
                continue;
            }
            return;
        } else if (!this.moreThan1MonthAgo()) {
            for (var week = 2; week < 5; week++) {
                if ((this.midnightTime - this.secondsInWeek * week) <= this.timestamp) {
                    this.outputStrIndex = 3; //'week'
                    this.outputIndex = String(week - 1) + ' ';
                    this.agoForm = true;
                    this.pluralForm = (week != 2);
                    break;
                }
                continue;
            }
            return;
        } else {
            if (!this.moreThan1YearAgo()) {
                var yearException = true; //because of approximation
                for (var month = 2; month < 13; month++) {
                    if ((this.midnightTime - this.secondsInMonth * month) <= this.timestamp) {
                        this.outputStrIndex = 4; //'month'
                        this.outputIndex = String(month - 1) + ' ';
                        this.agoForm = true;
                        this.pluralForm = (month != 2);
                        yearException = false;
                        break;
                    }
                    continue;
                }
                if (yearException) {
                    this.outputStrIndex = 5; //'year'
                    this.outputIndex = '1 ';
                    this.agoForm = true;
                }
                return;
            }
            for (var year = 2; year < 10; year++) //inaccuracy when 366 days in a year
            {
                if ((this.midnightTime - this.secondsInYear * year) <= this.timestamp) {
                    this.outputStrIndex = 5; //'year'
                    this.outputIndex = String(year - 1) + ' ';
                    this.agoForm = true;
                    this.pluralForm = (year != 2);
                    break;
                }
                continue;
            }
            return;
        }
    }

    returnCalculation() {
        var outputs = ['Today', 'Yesterday', 'day', 'week', 'month', 'year', 'second', 'minute', 'hour'];
        this.calculate();
        var pluralSuffix = this.pluralForm ? 's' : '';
        var agoSuffix = this.agoForm ? ' ago' : '';

        return (this.isValid ?
            (this.outputIndex + outputs[this.outputStrIndex] + pluralSuffix + agoSuffix) :
            'The given timestamp is in the future!');
    }
}