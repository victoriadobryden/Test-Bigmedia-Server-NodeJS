Ext.define('Bigmedia.model.Coverage', {
    extend: 'Ext.data.Model',

    fields: [
        'id', 'day', 'id_city',
        {
            name: 'cityName',
            calculate: function (data) {
                var cityStore = Ext.getStore('Cities');
                return cityStore.getById(data.id_city).get('name');
            }
        },
        {
            name: 'covMax',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'one',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * data.grps/(data.covMax + data.grps);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'three',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 3);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'five',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 5);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'ten',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 10);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'fifteen',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 15);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'twenty',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 20);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'thirty',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 30);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'fourty',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 40);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'fifty',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 50);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'sixty',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 60);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'seventy',
            calculate: function (data) {
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 70);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'eighty',
            calculate: function (data) {
                // console.log([data.covMax, data.grps, data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 80)]);
                if (data.covMax && data.grps) {
                    return data.covMax * Math.pow(data.grps/(data.covMax + data.grps), 80);
                } else {
                    return 0;
                }
            }
            // type: 'float',
            // defaultValue: 0
        }, {
            name: 'coverages'
        }, {
            name: 'grps'
        }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'items'
        }
    }
});
