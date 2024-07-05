
Ext.define('Bigmedia.model.PeriodMonitoring', {
//    extend: 'Ext.data.Model',
    extend: 'Bigmedia.model.BaseSchema',
    model: 'PeriodMonitoring',    
    requires: [
        "Bigmedia.Locales",
        "Bigmedia.model.Base",
        'Bigmedia.lib.validator.DateRange',
        'Ext.data.validator.Presence',
        'Ext.data.proxy.Rest'
    ],

    idProperty: 'id',
    convertOnSet: false,
    fields: [
        {name: 'id', type: 'int'},
        {name: 'date',type: 'string'},
        { name: 'startDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()-1, 1)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },
        { name: 'endDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 0)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },
        

        { name: 'minDate', type: 'date', dateFormat: 'c',
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },
        { name: 'maxDate', type: 'date', dateFormat: 'c',
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },

        { name: 'periodText',
            calculate: function (data) {
              return Bigmedia.Vars.getPeriodText(data.startDate, data.endDate);
            }
        },
        { name: 'periodYear', calculate: function (data) { return data.startDate.getFullYear(); } },
        { name: 'periodMonth', calculate: function (data) { return data.startDate.getMonth(); } },
        


        { name: 'periods',
          convert: function (value) {
            if (!value) { return null; }
            if (typeof value === 'object') {
              return value;
            }
            var processed = null;
            try {
              processed = Bigmedia.Vars.processObject(JSON.parse(value), function (v) {
                return (typeof v === 'object') ? v : (Ext.Date.parse(v, 'c', true) || v);
              });
            } catch (e) {
              console.log('select value: %o', value);
              console.log('error parsing saved select: %o', e);
            } finally {
              return processed;
            }
          },
          serialize: function (value) {
            if (!value) { return null; }
            var processed = Bigmedia.Vars.processObject(value, function (v) {
              return (v instanceof Date) ? Ext.Date.localToUtc(Ext.Date.clearTime(v)) : v;
            });
            return JSON.stringify(processed);
          }
        }
    ],
    proxy: {
        type: 'rest',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/monitoring',
        reader: {
            type: 'json'
        },
        appendId: false
    }
});

Ext.define('Bigmedia.proxy.MonitoringProxy', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.monitoringproxy',
    buildUrl: function(request) {
        var me        = this,
            operation = request.getOperation(),
            records   = operation.getRecords(),
            record    = records ? records[0] : null,
            format    = me.getFormat(),
            url       = me.getUrl(request),
            params = request.getParams(),
            id;
        if (record && !record.phantom) {
            id = record.getId();
        } else {
            id = operation.getId();
        }
        if (format) {
            if (!url.match(me.periodRe)) {
                url += '.';
            }
            url += format;
        }

        if (!record) {
          var MonitoringId = Ext.decode(params.MonitoringId);
          if (MonitoringId) {
            var addSlash = (url.charAt() !== '/')?'/':'';
            url = '/api/v1/monitoring/' + encodeURIComponent(MonitoringId) + addSlash + url;
          }
        } else {
            console.log([me, records]);
            url = '/api/v1/monitoring/' + url;
        }
        request.setUrl(url);
        // console.log('url in the end: ' + url);
        // console.log('filter: %o', params.filter);

        return me.callParent([request]);
    }
});

Ext.define('Bigmedia.model.MonitoringBase', {
    extend: 'Bigmedia.model.BaseSchema',
    idProperty: 'id',
    fields: [
      { name: 'id' },
      { name: 'MonitoringId',
        reference: {
          parent: 'PeriodMonitoring'
        },
        allowBlank: false
      }
    ],
    proxy: 'monitoringproxy'
  });

Ext.define('Bigmedia.model.MonitoringData', {
    extend: 'Bigmedia.model.MonitoringBase',
    fields: [
        { name: 'id', type: 'int'},
        { name: 'MonitoringId' , type: 'int' },
        { name: 'date',type: 'string'},
        { name: 'fConstr', type:'int'},
        { name: 'supplierNo', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'constrtype', type: 'string' },
        { name: 'sizetype', type: 'string' },
        { name: 'owner', type: 'string' },
        { name: 'advertisingCategory', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'advevents', type: 'string' },
        { name: 'translate', type: 'string' },
        { name: 'damage',  type: 'int' },
        { name: 'note', type: 'string' },
        { name: 'lon', type :'float' },
        { name: 'lat', type :'float' }, 
        { name: 'catab', type: 'string' },
        { name: 'brandId', type:'int' },
    ],
    setMonitoring: function (args) {
      console.log('setMonitoring',args);
    },
    proxy: {
        type: 'monitoringproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'data',
        // type: 'rest',
        // limitParam: null,
        // pageParam: '',
        // startParam: '',
        // url: '/api/v1/monitoring',
        listeners: {
          exception: function (proxy, request, operation) {
              console.log('request: %o', request);
              console.log('operation: %o', operation);
          }
        },
        reader: {
            type: 'json'
        },
        // appendId: false
    }
});