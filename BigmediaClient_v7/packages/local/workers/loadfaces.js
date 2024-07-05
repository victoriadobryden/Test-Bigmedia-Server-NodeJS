// importScripts('crypto-js.js');

onmessage = function(e){
  transport = new XMLHttpRequest();
  var dc = +new Date();
  transport.open('GET', '/api/v1/data?faces=1&locale=' + e.data.locale + '&_dc=' + dc, true);
  transport.onreadystatechange = function(){
    if(transport.readyState == 4){
      try {
        var resp = JSON.parse(transport.responseText),
          records;
        // Crypto - version
        if (typeof resp !== 'object') {
          if (!resp || resp.length === 0) {
            postMessage({faces: [], sides: []});
            return;
          }
          var records = extractData(resp, dc);
        } else {
          records = resp;
        }
        // Zip - version
        // extractData(resp, dc).then(function(records){
        var sides = [];
        records.forEach(function(rec){
            // console.log([rec, sides()]);
            if (rec.sides && rec.sides.length > 0) {
                var occ = [];
                rec.sides.forEach(function(side){
                    occ.push(side.occ);
                    sides.push(side);
                });
                rec.occupancy = occ;
                rec.occByDays = occByDays(rec.occupancy);
                rec.parsedOccupancy = getParsedOccupancy(rec) || [];
            }
        });
        postMessage({faces: records, sides: sides});
        // });
      } catch (e) {
        postMessage({error: e});
      } finally {

      }
    }
  };
  transport.send();
};

function extractData (data, dc) {
  try{
    var bytes = CryptoJS.Rabbit.decrypt(data, dc.toString());
    decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(decrypted);
    return JSON.parse(decrypted);

    var zip = new JSZip();
    // console.log(data);
    return zip.loadAsync(data, {base64: true}).then(function(zip){
        // console.log('here');
        return zip.file("data.txt").async("string");
    }).then(function(data){
        // console.log([data, dc]);
        var bytes = CryptoJS.AES.decrypt(data, dc.toString());
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
        // console.log(decrypted);
        return JSON.parse(decrypted);
    });
    // if (bytes && bytes.words && bytes.words.length) {
    //     decrypted = bytes.toString(CryptoJS.enc.Utf8);
    //     try {
    //         var res = JSON.parse(res);
    //     } catch (e) {
    //         console.error(e);
    //         return null;
    //     } finally {
    //
    //     }
    //     return res;
    // } else {
    //     return null;
    // }
  }
  catch (e) {
    console.error('error extracting data: %o', e);
  }
}

function occByDays (occupancy) {
    var parsedValues = [],
        newValues = occupancy;
    if (!newValues) { return;}

    var res,
        re = /(\d+)(\w)/g;
    var maskedArray = newValues.map(function(occString){
        var occ = occString,
            daysArray = [];
        while ((res = re.exec(occ)) != null) {
            daysArray = daysArray.concat(new Array(+res[1] + 1).join(res[2]).split(''));
        }
        return daysArray;
    }).reduce(function(res, daysArray){
        if (!res) {
            return daysArray;
        }
        return res.map(function(dayStatus, ix){
            if (dayStatus === 'f' || daysArray[ix] === 'f') {
                return 'f';
            }
            if (dayStatus === 't' || daysArray[ix] === 't') {
                return 't';
            }
            if (dayStatus === 'r' || daysArray[ix] === 'r') {
                return 'r';
            }
            if (dayStatus === 's' || daysArray[ix] === 's') {
                return 's';
            }
            if (dayStatus === 'd' || daysArray[ix] === 'd') {
                return 'd';
            }
            return 'n';
        });
    });
    return maskedArray.join('');
}

function Month (year, mon, day) {
    this.day = (day || 1);
    if ( mon > 11 ) {
        this.month = 0;
        this.year = year + 1;
    } else {
        this.month = mon;
        this.year = year;
    }
    this.days = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
    this.emptyDays = this.days - this.day + 1;
    this.actualDays = this.days - this.day + 1;
    this.periods = [];

    this.addDay = function (status) {
        if (this.emptyDays === 0) {
            return false;
        }
        if (this.periods.length === 0) {
            return this.addPeriod(1, status);
        }
        if (this.periods[this.periods.length - 1].status === status) {
            this.periods[this.periods.length - 1].days++;
            this.emptyDays--;
            return -(this.emptyDays);
        }
        return this.addPeriod(1, status);
    };

    this.addPeriod = function (days, status) {
        var diff = days - this.emptyDays;
        var period = {};
        period.status = status;
        if (diff <= 0) {
            period.days = days;
            this.emptyDays = Math.abs(diff);
        }
        else {
            period.days = this.emptyDays;
            this.emptyDays = 0;
        }
        if (period.days > 0) {
            this.periods.push(period);
        }
        return diff;
    }
    this.monthStatus = function () {
        if(this.periods.length == 1){
            return this.periods[0].status;
        } else if (this.periods.length == 0){
            return null;
        }
        var maxPeriod = this.periods.reduce(function(max,cur){
            if(max.days<=cur.days) return cur;
            else return max;
        });
        return maxPeriod.status;
    }
};

var cacheOccupancies = {};

function getParsedOccupancy (data) {
    var parsedValues = [],
        now = new Date(),
        startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
        tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth(), startMonth.getUTCFullYear()],
        newValues = data.occupancy,
        occByDays = data.occByDays;

    if (!newValues) { return;}

    if (cacheOccupancies[occByDays]) {
        parsedValues = cacheOccupancies[occByDays];
    } else {
        var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
        var parsedObjValues = occByDays.split('').reduce(function(res, status){
            var cur = res[res.length - 1];
            if (cur.emptyDays === 0) {
                cur = new Month(cur.year, cur.month + 1);
                res.push(cur);
            }
            cur.addDay(status);
            return res;
        },[curMonth]);
        parsedValues = parsedObjValues.map(function(cur){
            return {
                emptyDays: cur.emptyDays,
                day: cur.day,
                month: cur.month,
                year: cur.year,
                actualDays: cur.actualDays,
                periods: cur.periods,
                monthStatus: cur.monthStatus()
            }
        });
        cacheOccupancies[occByDays] = parsedValues;
    }
    return parsedValues;
}
