Ext.define('Bigmedia.model.ThirdParty', {
    extend: 'Ext.data.Model',
    idProperty: 'id',

    fields: [
        {name: 'id', type: 'int'},
        { name: 'supplier_no', type: 'string', allowNull: true},
        {name: 'inPlatform', type: 'boolean', defaultValue: false},
        {name: 'supplierNo',
            calculate: function (data){
                return data.supplier_no;
            }, allowNull: true
        },
        { name: 'doors_no', type: 'int', allowNull: true},
        { name: 'doorsNo',
            calculate: function (data) {
                return data.doors_no;
            }, allowNull: true
        },
        {
            name: 'id_city',
            type: 'int'
        },
        {
            name: 'id_size',
            type: 'int'
        },
        {
            name: 'id_network',
            type: 'int'
        },{ name: 'id_catab', type: 'int'},
        { name: 'city',
            calculate: function (data) {
                return Bigmedia.Locales.refCity[data.id_city];
            }
        },
        { name: 'address' },
        { name: 'type' },
        { name: 'catab'},
        { name: 'supplier_size'},
        { name: 'supplier'},
        { name: 'streets'},
        { name: 'grp', allowNull: true},
        { name: 'ots', allowNull: true},
        { name: 'lon', type: 'float'},
        { name: 'lat', type: 'float'},
        {
            name: 'geometry',
            calculate: function (data) {
                if (parseFloat(data.lon) && parseFloat(data.lat)) {
                    var coord = [parseFloat(data.lon), parseFloat(data.lat)];
                    // if (+pos !== 0) {
                    //     var offset = [pos * 0.00005, 0],
                    //         angleRad = (data.angle) *  Math.PI / 180;
                    //     ol.coordinate.rotate(offset, angleRad);
                    //
                    //     ol.coordinate.add(coord, offset);
                    // }
                    return new ol.geom.Point(ol.proj.fromLonLat(coord));
                }
                else {
                    return null;
                }
            }
        },
        { name: 'angle'},
        { name: 'size',
            calculate: function (data) {
                return Bigmedia.Locales.refSize[data.id_size];
            }
        },
        {
            name: 'icon',
            calculate: function (data) {
                var s = 'l'; //s-small(<18 sq.m.), b-board(~18 sq.m.), l-large(>18 sq.m.)
                switch (data.size) {
                    case '1.2x1.8':
                    case '1.2x3.6':
                    case '1.5x3':
                    case '2.3x3.14':
                    case '2.3x3.5':
                        s = 's';
                        break;
                    case '3x4':
                    case '3x6':
                    case '6x3':
                    case '7x4':
                    case '3x11':
                    case '3x12':
                        s = 'b';
                        break;
                }
                return s;
            }
        },
        { name: 'price', type: 'number', allowNull: true},
        // {
        //     name: 'coverages',
        //     calculate: function (data) {
        //         return Bigmedia.Vars.calculateCoverages(data);
        //     }
        // },
        {
            name: 'finalPrice',
            // type: 'number', defaultValue: 0,
            calculate: function (data) {
                // Bigmedia.Vars.getPromocode() ? data.price - data.price * Bigmedia.Vars.getPromocode().discount / 100 :
                return data.price;
            }, allowNull: true
        }
        // ,
        // {name: 'occupancy', type: 'string', defaultValue: '600f'},
        // {
        //     name: 'parsedOccupancy',
        //     calculate: function (data) {
        //         var parsedValues = [],
        //             now = new Date(),
        //             startMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
        //             tmp = [startMonth.getUTCDate(), startMonth.getUTCMonth(), startMonth.getUTCFullYear()],
        //             newValues = data.occupancy;
        //
        //         var Month = function (year, mon, day) {
        //             this.day = (day || 1);
        //             if ( mon > 11 ) {
        //                 this.month = 0;
        //                 this.year = year + 1;
        //             } else {
        //                 this.month = mon;
        //                 this.year = year;
        //             }
        //             this.days = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
        //             this.emptyDays = this.days - this.day + 1;
        //             this.actualDays = this.days - this.day + 1;
        //             this.periods = [];
        //
        //             this.addPeriod = function (days, status) {
        //                 var diff = days - this.emptyDays;
        //                 var period = {};
        //                 period.status = status;
        //                 if (diff <= 0) {
        //                     period.days = days;
        //                     this.emptyDays = Math.abs(diff);
        //                 }
        //                 else {
        //                     period.days = this.emptyDays;
        //                     this.emptyDays = 0;
        //                 }
        //                 if (period.days > 0) {
        //                     this.periods.push(period);
        //                 }
        //                 return diff;
        //             }
        //             this.monthStatus = function () {
        //                 if(this.periods.length == 1){
        //                     return this.periods[0].status;
        //                 } else if (this.periods.length == 0){
        //                     return null;
        //                 }
        //                 var maxPeriod = this.periods.reduce(function(max,cur){
        //                     if(max.days<=cur.days) return cur;
        //                     else return max;
        //                 });
        //                 return maxPeriod.status;
        //             }
        //         };
        //         var curMonth = new Month(+tmp[2], +tmp[1], +tmp[0]);
        //         var res,
        //             re = /(\d+)(\w)/g;
        //         while ((res = re.exec(newValues)) != null) {
        //             var restDays = +res[1],
        //                 status = res[2];
        //             while (restDays > 0) {
        //                 if (curMonth.emptyDays == 0) {
        //                     parsedValues.push(curMonth);
        //                     curMonth = new Month(curMonth.year, curMonth.month + 1);
        //                 }
        //                 restDays = curMonth.addPeriod(restDays, status);
        //             }
        //         }
        //         parsedValues.push(curMonth);
        //         return parsedValues;
        //     }
        // }
    ],
    proxy: {
        type: 'memory'
    }
    // proxy: {
    //     type: 'ajax',
    //     url: '/api/v1/thirdparty',
    //     limitParam: null,
    //     pageParam: '',
    //     startParam: '',
    //     paramsAsJson: true,
    //     actionMethods: {
    //         // create: 'POST',
    //         read: 'POST'
    //         // update: 'POST',
    //         // destroy: 'POST'
    //     }
    // }
});
