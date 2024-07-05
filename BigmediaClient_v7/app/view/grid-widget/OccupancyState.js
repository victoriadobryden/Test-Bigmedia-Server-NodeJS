/**
 * Created by Alexander.Ustilov on 05.01.2016.
 */
Ext.define('OccupancyStateWidget', {
    extend: 'Ext.sparkline.BarBase',
    //requires: [
    //  'Ext.sparkline.RangeMap'
    //],

    alias: 'widget.occupancystate',
    occSold: 'Sold',
    occFree: 'Free',
    occReserved: 'Sold',
    occTempReserved: 'Reserved',
    occUnknown: 'Unknown',
    occDemounted: 'Demounted',

    config: {

        /**
         * @cfg {Number} [barWidth=4] The pixel width of each bar.
         */
        barWidth: 16,

        /**
         * @cfg {Number} [barSpacing=1] The pixel spacing between each bar.
         */
        barSpacing: 2,

        /**
         * @cfg {String} [posBarColor=#6f6] The color for positive value bars.
         */
        //posBarColor: '#6f6',
        freeBarColor: '#6f6',

        /**
         * @cfg {String} [negBarColor=#f44] The color for negative value bars.
         */
        //negBarColor: '#f44',
        soldBarColor: '#C92424',

        /**
         * @cfg {String} [zeroBarColor=#999] The color for zero value bars.
         */
        //zeroBarColor: '#999',
        unknownBarColor: '#999',

        demountedBarColor: '#333',

        tempReservedBarColor: '#edd400',

        reservedBarColor: '#ff0000',

        /**
         * @cfg {Object} [colorMap] An object that uses range specifiers as keys to
         * indicate bar color values for a range of values. A range specifier is
         * specified in the form `[number]:[number]`, which indicates start and end range.
         * Omitting either means an open ended range.
         *
         * For example, to render green bars on all values less than -1 and red on values
         * higher than 1, you would use:
         *
         *     colorMap: {
         *         // Open ended range, with max value -1
         *         ":-1": "green",
         *
         *         // Open ended range, with min value 1
         *         "1:": "red"
         *     }
         */
        colorMap: {},

        tipTpl: new Ext.XTemplate('{value:this.states}', {
            states: function (v) {
                var value = v;
                if (value.periods.length == 1) {
                    res = '&#9679; ' + Ext.Date.monthNames[value.month - 1] + '&#39;' + value.year.toString().slice(-2) + ': ';
                    switch (value.periods[0].status) {
                        case 'r':
                            res += value.widget.occReserved;
                            break;
                        case 't':
                            res += value.widget.occTempReserved;
                            break;
                        case 's':
                            res += value.widget.occSold;
                            break;
                        case 'f':
                            res += value.widget.occFree;
                            break;
                        case 'd':
                            res += value.widget.occDemounted;
                            break;
                        default:
                            res += value.widget.occUnknown;
                    }
                }
                else {
                    res = v.widget.genCalendar(v);
                }
                return res;
            }

            //states: function(v) {
            //  var value = Number(v);
            //  if (value === -1) {
            //    return 'Loss';
            //  }
            //  if (value === 0) {
            //    return 'Draw';
            //  }
            //  if (value === 1) {
            //    return 'Win';
            //  }
            //  return v;
            //}
        })
    },

    genCalendar: function (monthItem) {
        // If no parameter is passed use the current date.
        //if(monthItem == null)
        var me = this;
        var date = new Date(Date.UTC(monthItem.year, +monthItem.month - 1, 1));

        var day = date.getUTCDate(),
            month = date.getUTCMonth(),
            year = date.getUTCFullYear();

        var this_month = new Date(Date.UTC(year, month, 1));
        var next_month = new Date(Date.UTC(year, month + 1, 1));

        // Find out when this month starts and ends.
        var first_week_day = this_month.getUTCDay();
        var days_in_this_month = monthItem.days;
        var week_begins = 1; // from Monday to Sunday

        var calendar_html = '<table style="background-color:#666699; color:#ffffff;">';
        calendar_html += '<tr><td colspan="7" style="background-color:#9999cc; color:#000000; text-align: center;">' + Ext.Date.monthNames[month] + ' ' + year + '</td></tr>';
        calendar_html += '<tr>';

        // Fill the first week of the month with the appropriate number of blanks.
        for (var week_day = week_begins; week_day < first_week_day; week_day++) {
            calendar_html += '<td style="background-color:#9999cc; color:#000000;"> </td>';
        }

        week_day = first_week_day;

        var periodItem = monthItem.periods[0], ix = 0, daysLeft = periodItem.days;

        for (var day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
            week_day %= 7;
            if (week_day == week_begins)
                calendar_html += '</tr><tr>';

            // Do something different for the current day.
            calendar_html += '<td style="text-align: center; ';
            if (day_counter < monthItem.day || daysLeft == 0) {
                calendar_html += 'background-color: #aaaaaa; color: #fff';
            }
            else {
                if (periodItem.status == 'r') {
                    calendar_html += 'background-color: ' + me.config.reservedBarColor + '; color: #000';
                }
                else if (periodItem.status == 't') {
                    calendar_html += 'background-color: ' + me.config.tempReservedBarColor + '; color: #000';
                }
                else if (periodItem.status == 's') {
                    calendar_html += 'background-color: ' + me.config.soldBarColor + '; color: #000';
                }
                else if (periodItem.status == 'f') {
                    calendar_html += 'background-color: ' + me.config.freeBarColor + '; color: #000';
                }
                else if (periodItem.status == 'd') {
                    calendar_html += 'background-color: ' + me.config.demountedBarColor + '; color: #000';
                }
                else {
                    calendar_html += 'background-color: ' + me.config.unknownBarColor + '; color: #000';
                }
                daysLeft--;
                if (daysLeft == 0) {
                    if (periodItem = monthItem.periods[++ix]) {
                        daysLeft = periodItem.days;
                    }
                }
            }

            calendar_html += '">' + day_counter + '</td>';

            week_day++;
        }

        calendar_html += '</tr>';
        calendar_html += '</table>';

        // Return the calendar.
        return calendar_html;
    },

    applyColorMap: function (colorMap) {
        var me = this;

        if (Ext.isArray(colorMap)) {
            me.colorMapByIndex = colorMap;
            me.colorMapByValue = null;
        } else {
            me.colorMapByIndex = null;
            me.colorMapByValue = colorMap;
            if (me.colorMapByValue && me.colorMapByValue.get == null) {
                me.colorMapByValue = new Ext.sparkline.RangeMap(colorMap);
            }
        }
        return colorMap;
    },

    // Translate string values into array of objects
    //translateOccupancyItem: function(monthItem) {
    //return JSON.parse(monthItem);
    //},

    // Ensure values is an array of numbers
    applyValues: function (newValues) {
        var me = this;

        //try{
        //  newValues = JSON.parse(newValues);
        //}
        //catch(err){
        //  return;
        //}

        var parsedValues = [],
            arr = [],
            now = new Date(),
            startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
        //tmp = startMonth.match(/(\d+)\.(\d+)\.(\d+)/);
            tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth() + 1, startMonth.getUTCFullYear()];

        //console.log(newValues + ' : ' + tmp);

        var Month = function (year, mon, day) {
            this.day = (day || 1);
            if ( mon > 12 ) {
                this.month = 1;
                this.year = year + 1;
            } else {
                this.month = mon;
                this.year = year;
            }
            this.days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
            this.emptyDays = this.days - this.day + 1;
            this.periods = [];
            this.widget = me;
            //this.genCalendar = me.genCalendar;

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
        };
        var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
        var res,
            re = /(\d+)(\w)/g;
        //console.log(m.occ);
        //while ((res = re.exec(newValues.occ)) != null) {
        while ((res = re.exec(newValues)) != null) {
            var restDays = +res[1],
                status = res[2];
            while (restDays > 0) {
                if (curMonth.emptyDays == 0) {
                    parsedValues.push(curMonth);
                    curMonth = new Month(curMonth.year, curMonth.month + 1);
                }
                restDays = curMonth.addPeriod(restDays, status);
            }
        }
        parsedValues.push(curMonth);

        /*var parsedValues = [],
         arr = [],
         startMonth = newValues.start,
         tmp = startMonth.match(/(\d+)\/(\d+)/);
         arr = newValues.occ.split(/\s/);
         arr.forEach(function(m,i){
         var parsedMonth = {};
         parsedMonth.month = {};
         parsedMonth.month.mm = +tmp[1]+i;
         parsedMonth.month.yy = tmp[2];
         parsedMonth.month.daysInMonth = new Date(parsedMonth.month.yy, parsedMonth.month.mm, 0).getUTCDate();
         parsedMonth.periods = [];
         var res,
         re = /(\d+)(\w)/g;
         //console.log(m.occ);
         while ((res = re.exec(m)) != null){
         var item = {};
         item.days = res[1];
         item.status = res[2];
         //console.log('days: ' + item.days.toString() + ' status: ' + item.status);
         parsedMonth.periods.push(item);
         }
         parsedValues.push(parsedMonth);
         });
         console.log(parsedValues);*/
        /*
         this.disabled = !(newValues && newValues.length);
         var parsedValues = [];
         newValues.forEach(function(m,i,newValues){
         var parsedMonth = {};
         var tmp = m['mon'].match(/(\d+)\/(\d+)/);
         parsedMonth.month = {};
         parsedMonth.month.mm = tmp[1];
         parsedMonth.month.yy = tmp[2];
         parsedMonth.month.daysInMonth = new Date(parsedMonth.month.yy, parsedMonth.month.mm, 0).getUTCDate();
         parsedMonth.periods = [];
         var res,
         re = /(\d+)(\w)/g;
         console.log(m.occ);
         while ((res = re.exec(m.occ)) != null){
         var item = {};
         item.days = res[1];
         item.status = res[2];
         console.log('days: ' + item.days.toString() + ' status: ' + item.status);
         parsedMonth.periods.push(item);
         }
         parsedValues.push(parsedMonth);
         });
         */
        return parsedValues;
    },

    onUpdate: function () {
        this.totalBarWidth = this.getBarWidth() + this.getBarSpacing();
    },

    getBarWidth: function () {
        var values = this.values;

        return this._barWidth || (this.getWidth() - (values.length - 1) * this.getBarSpacing()) / values.length;
    },

    getRegion: function (x, y) {
        return Math.floor(x / this.totalBarWidth);
    },

    getRegionFields: function (region) {
        return {
            isNull: this.values[region] == null,
            value: this.values[region],
            //color: this.calcColor(this.values[region], region),
            offset: region
        };
    },

    calcColor: function (value, valuenum) {
        var me = this,
            values = me.values,
            colorMapByIndex = me.colorMapByIndex,
            colorMapByValue = me.colorMapByValue,
            color, newColor;

        if (colorMapByValue && (newColor = colorMapByValue.get(value))) {
            color = newColor;
        } else if (colorMapByIndex && colorMapByIndex.length > valuenum) {
            color = colorMapByIndex[valuenum];
        } else if (values[valuenum] < 0) {
            color = me.getNegBarColor();
        } else if (values[valuenum] > 0) {
            color = me.getPosBarColor();
        } else {
            color = me.getZeroBarColor();
        }
        return color;
    },

    getColorByStatus: function (status) {
        var res;
        switch (status) {
            case 'r':
                res = this.config.reservedBarColor;
                break;
            case 's':
                res = this.config.soldBarColor;
                break;
            case 't':
                res = this.config.tempReservedBarColor;
                break;
            case 'f':
                res = this.config.freeBarColor;
                break;
            case 'd':
                res = this.config.demountedBarColor;
                break;
            default:
                res = this.config.unknownBarColor;
        }
        return res;
    },

    renderRegion: function (valuenum, highlight) {
        var me = this,
            values = me.values,
            canvas = me.canvas,
            canvasHeight, height, halfHeight, x, y, color;

        canvasHeight = canvas.pixelHeight;
        halfHeight = Math.round(canvasHeight / 2);

        x = valuenum * me.totalBarWidth;
        y = 0;
        height = canvasHeight;

        var mon = values[valuenum];

        if (mon) {
            mon.periods.reduce(function (curWidth, item, ix, arr) {
                var b;
                if (curWidth < me.getBarWidth()) {
                    b = Math.round(item.days * me.getBarWidth() / mon.days);
                    if (b == 0) {
                        b = 1;
                    }
                    if (curWidth + b > me.getBarWidth()) {
                        b = me.getBarWidth() - curWidth;
                    }
                    color = me.getColorByStatus(item.status);
                    if (highlight) {
                        color = me.calcHighlightColor(color);
                    }
                    //console.log('Period: ' + item.days.toString() + ' curWidth: ' + curWidth.toString() + ' getBarWidth: ' + me.getBarWidth().toString() + ' b:' + b.toString());
                    canvas.drawRect(x + curWidth, y, b - 1, height - 1, color, color).append();
                }
                return curWidth + b;
            }, Math.round(mon.day * me.getBarWidth() / mon.days));
        }

        /*var mon = values[valuenum], //JSON.parse(values[valuenum]),
         occ = mon.occ,
         re = /\d+\w/g,
         items = [];
         while (res = re.exec(occ)){
         items.push(res[0]);
         }

         var tmp = mon['mon'].match(/(\d+)\/(\d+)/),
         mm = tmp[1],
         yy = tmp[2];

         var daysInMonth = new Date(yy, mm, 0).getUTCDate();

         //var curWidth;

         items.reduce(function(curWidth,item,ix,arr){
         var b, d, s, t;
         if(curWidth<me.getBarWidth()){
         t = item.match(/(\d{1,2})(\w)/);
         d = t[1]; s = t[2];
         b = Math.round(d * me.getBarWidth() / daysInMonth);
         if(b==0){b = 1;}
         if(curWidth+b > me.getBarWidth()){
         b = me.getBarWidth() - curWidth;
         }
         color = me.getColorByStatus(s);
         if (highlight) {
         color = me.calcHighlightColor(color);
         }
         canvas.drawRect(x, y, b, height - 1, color, color).append();
         }
         return curWidth+b;
         },0);
         */

    }
});
