window.onload = function () {
    const timestamp = "2018-12-24 23:59:59"; //this is a UTC timestamp
    document.getElementById('mainDiv').innerHTML = converSQLtoAgoFormat(timestamp);
}


function evaluateHMS(timeDiff) {
    const hrsMinSec = [Math.floor(timeDiff/60/60), Math.floor(timeDiff/60), timeDiff % 60];
    const outputs = ['hour', 'minute', 'second'];
    const validOutput = {
        value: 0,
        index: 2
    };

    for (let i = 0; i < hrsMinSec.length; i++) {
        if (hrsMinSec[i]) {
            validOutput.index = i;
            validOutput.value = hrsMinSec[i];
            break;
        }
    }
    const pluralSuffix = (validOutput.value == 1) ? '' : 's';
    return validOutput.value + ' ' + outputs[validOutput.index] + pluralSuffix + ' ago';
}

function evaluateYMWD(timeDiff) {
    const yrsMonWekDay = [Math.floor(timeDiff/60/60/24/365),
        Math.floor(timeDiff/60/60/24/30),
        Math.floor(timeDiff/60/60/24/7),
        Math.floor(timeDiff/60/60/24)];
    const outputs = ['year', 'month', 'week', 'day'];
    const validOutput = {
        value: 0,
        index: 3
    };

    for (let i = 0; i < yrsMonWekDay.length; i++) {
        if (yrsMonWekDay[i]) {
            validOutput.index = i;
            validOutput.value = yrsMonWekDay[i];
            break;
        }
    }
    const pluralSuffix = (validOutput.value == 1) ? '' : 's';

    if (validOutput.index == 3 && validOutput.value == 1) {
        return 'Yesterday';
    }
    return validOutput.value + ' ' + outputs[validOutput.index] + pluralSuffix + ' ago';
}

function converSQLtoAgoFormat(a_sqlTimestamp) {
    //utc timestamp is expected as an input 'YYYY-MM-DD HH:MM:SS'
    const TIME = {
        dateTimeObject: new Date(),
        timezoneOffset: 0,
        utcTime: new Date(),
        localTime: new Date(),
        timestamp: 0,
        midnightLocalTime: 0,
        millisecondsSinceMidnight: 0
    }

    TIME.timezoneOffset = TIME.dateTimeObject.getTimezoneOffset() * 60000;

    //had some complications with UTC (different behaviour) on Mozilla
    //Mozilla auto-converts the string given via `new Date()` to UTC time
    //Chrome and Safari don't; they keep it in local time
    //tested and working on Safari, Mozilla and Chrome browsers
    if (navigator.userAgent.search("Firefox") >= 0) {
        //utc time is the time returned by `new Date();` (on Mozilla)
        TIME.localTime = new Date(TIME.dateTimeObject.getTime() - TIME.timezoneOffset);
        TIME.timestamp = new Date(new Date(a_sqlTimestamp).getTime() - TIME.timezoneOffset);
        TIME.midnightLocalTime = new Date(
            new Date(TIME.localTime.getFullYear(),
                TIME.localTime.getMonth(),
                TIME.localTime.getDate())
            .getTime() - TIME.timezoneOffset);
    } else {
        //need to convert sql timestamp to Date js object
        const t = String(a_sqlTimestamp).split(/[- :]/);
        TIME.timestamp = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
        //months are between 0 and 11 -> subtract 1
        TIME.utcTime = new Date(TIME.dateTimeObject.getTime() + TIME.timezoneOffset);
        //local time is the time returned by `new Date();` (everywhere except on Mozilla)
        TIME.midnightLocalTime = new Date(
            TIME.localTime.getFullYear(),
            TIME.localTime.getMonth(),
            TIME.localTime.getDate());
    }

    TIME.millisecondsSinceMidnight = TIME.localTime.getTime() - TIME.midnightLocalTime.getTime();

    const currentUtcTimeInSeconds = Math.floor(TIME.utcTime.getTime() / 1000);
    const midnightTimeInSeconds = Math.floor((TIME.utcTime.getTime() - TIME.millisecondsSinceMidnight) / 1000);
    const timestampInSeconds = Math.floor(TIME.timestamp.getTime() / 1000);

    const timeDifference = currentUtcTimeInSeconds - timestampInSeconds;

    if (timeDifference < 0) {
        return 'The given timestamp is in the future';
    }
    
    if (midnightTimeInSeconds < timestampInSeconds) {
        return evaluateHMS(timeDifference);
    } else {
        return evaluateYMWD((midnightTimeInSeconds - timestampInSeconds) + 24*60*60);
    }
}