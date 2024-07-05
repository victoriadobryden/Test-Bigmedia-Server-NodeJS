Ext.define('Bigmedia.model.Campaign', {
    extend: 'Bigmedia.model.BaseSchema',

    requires: [
        "Bigmedia.Locales",
        "Bigmedia.model.Base",
        'Bigmedia.lib.validator.DateRange',
        'Ext.data.validator.Presence',
        'Ext.data.proxy.Rest'
    ],
    convertOnSet: false,
    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string', defaultValue: 'Кампанія без назви ' + Ext.Date.format(new Date(), 'Ymd') },
        { name: 'client' }, //id, name
        { name: 'manager' }, //id, name
        { name: 'clientId',
            convert: function (val) {
                if (!val && Bigmedia.Vars.getUser()) {
                    return Bigmedia.Vars.getUser().get('orgId');
                }
            }
            // defaultValue: Bigmedia.Vars.getUser().get('orgId') }, //id, name
        },
        { name: 'managerId',
            convert: function (val) {
                if (!val && Bigmedia.Vars.getUser()) {
                    return Bigmedia.Vars.getUser().get('defaultManagerId');
                }
            }
            // defaultValue: Bigmedia.Vars.getUser().get('defaultManagerId') }, //id, name
        },
        { name: 'managerName', defaultValue: Bigmedia.Vars.getUser() && Bigmedia.Vars.getUser().get('isManager') ? Bigmedia.Vars.getUser().get('name') : '', persist: false},
        { name: 'owner', defaultValue: Bigmedia.Vars.getUser() ? Bigmedia.Vars.getUser().get('name') : '', persist: false},
        { name: 'subjectId', persist: false },
        { name: 'startDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+1, 1)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
            // this.getDefaultStartDate()
            // convert: function (v) {
            //     if (!v) {
            //         var now = new Date(),
            //             date = new Date(now.getUTCFullYear(), now.getUTCMonth()+1, 1);
            //         return date;
            //     } else {
            //         return v;
            //     }
            // }
        },
        { name: 'endDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
            // this.getDefaultEndDate()
            // convert: function (v) {
            //     if (!v) {
            //         var now = new Date(),
            //             startDate = new Date(now.getUTCFullYear(), now.getUTCMonth()+1, 1);
            //         return new Date(startDate.getUTCFullYear(), startDate.getUTCMonth()+1, startDate.getUTCDate()-1);
            //     } else {
            //         return v;
            //     }
            // }
        },
        { name: 'finBalance' }, //balance, budget
        { name: 'finBudget' },
        { name: 'docStatus'},
        { name: 'mediaStatus'},
        { name: 'advertiserId'},
        { name: 'advertiser',
            calculate: function (data) {
                return data.advertiserId ? Ext.getStore('Advertisers').getById(data.advertiserId) : null;
            }
        },
        { name: 'createdAt', type: 'date', dateFormat: 'c',
            defaultValue: new Date(),
            dateWriteFormat: 'Y-m-d\\TH:i:s.u\\Z'},
        { name: 'modifiedAt', type: 'date', dateFormat: 'c',
            defaultValue: new Date(),
            dateWriteFormat: 'Y-m-d\\TH:i:s.u\\Z'},
        { name: 'publishedId', type: 'string'},
        { name: 'hasPresentation',
          calculate: function (data) {
            return !!data.publishedId;
          }
        },
        { name: 'periodText',
          calculate: function (data) {
            return Bigmedia.Vars.getPeriodText(data.startDate, data.endDate);
          }
        },
        { name: 'filterPeriod',
          calculate: function (data) {
            if (data.filters && data.filters.filter_period) {
              return data.filters.filter_period
            } else {
              return {
                startDate: data.startDate, endDate: data.endDate
              }
            }
          }
        },
        { name: 'filters',
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
              console.log('filters value: %o', value);
              console.log('error parsing saved filters: %o', e);
            } finally {
              return processed;
            }
          },
          serialize: function (value) {
            if (!value) { return null; }
            var processed = Bigmedia.Vars.processObject(value, function (v) {
              return (v instanceof Date) ? Ext.Date.localToUtc(Ext.Date.clearTime(v)) : v;
            });
            // if (value.period) {
            //   value.period.startDate = ;
            //   value.period.endDate = Ext.Date.localToUtc(Ext.Date.clearTime(value.period.endDate));
            // }
            // Ext.Object.each(value, function(k, v) {
            //   if (v instanceof Date) {
            //     console.log([]);
            //     k[v] = Ext.Date.localToUtc(v);
            //   }
            // });
            return JSON.stringify(processed);
          }
        },
        { name: 'params',
          convert: function (value) {
            if (!value) { return null; }
            var processed = null;
            try {
              var obj = (typeof value === 'object') ? value : JSON.parse(value);
              processed = Bigmedia.Vars.processObject(obj, function (v) {
                return (typeof v === 'object') ? v : (Ext.Date.parse(v, 'c', true) || v);
              });
            } catch (e) {
              console.log('params: %o', value);
              console.log('error parsing saved params: %o', e);
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
        },
        { name: 'discountId',
          calculate: function (data) {
            return data.params ? data.params.discountId : null;
          }
        },
        { name: 'filterPeriodText',
          calculate: function (data) {
            return Bigmedia.Vars.getPeriodText(data.filterPeriod.startDate, data.filterPeriod.endDate, data.filterPeriod.disabled);
          }
        },
        { name: 'timeAgo',
          calculate: function (data) {
            var now = new Date(),
              nY = now.getFullYear(),
              nM = now.getMonth(),
              nD = now.getDate(),
              nDay = now.getDay(),
              nW = Ext.Date.getWeekOfYear(now);
            var today = new Date(+new Date(nY, nM, nD + 1) - 1);
            var c = data.createdAt,
              cY = c.getFullYear(),
              cM = c.getMonth(),
              cD = c.getDate(),
              cDay = c.getDay(),
              cW = Ext.Date.getWeekOfYear(c);
            var difD = Ext.Date.diff(c, today, Ext.Date.DAY),
              difW = Math.floor(difD / Ext.Date.DAYS_IN_WEEK),
              difM = Ext.Date.diff(c, today, Ext.Date.MONTH),
              difY = Ext.Date.diff(c, today, Ext.Date.YEAR);
            if (difD < 1) {
              return 'Сьогодні';
            }
            if (difD < 2) {
              return 'Вчора';
            }
            if (difD < nDay) {
              return Ext.Date.dayNames[cDay];
            }
            if (nM === cM) {
              if (difW < 2) {
                return 'На минулому тижні'
              }
              if (difW < 3) {
                return 'Два тижні тому'
              }
              if (difW < 4) {
                return 'Три тижні тому'
              }
              if (difW < 5) {
                return 'Чотири тижні тому'
              }
            }
            var curMStart = new Date(+new Date(nY, nM, 1) - 1);
            if (Ext.Date.diff(c, curMStart, Ext.Date.MONTH) < 1) {
              return 'В минулому місяці'
            }
            if (Ext.Date.diff(c, curMStart, Ext.Date.MONTH) < 2) {
              return 'Два місяці тому'
            }
            return 'Давно'
          }
        }
    ],
    validators: {
        name: 'presence',
        startDate: ['presence', {
            type: 'daterange',
            isStart: true,
            otherField: 'endDate'
        }],
        endDate: ['presence', {
            type: 'daterange',
            isStart: false,
            otherField: 'startDate'
        }],
        managerId: 'presence',
        clientId: 'presence'
    },
    idProperty: 'id',
    proxy: {
        type: 'rest',
        limitParam: null,
        extraParams: {
            fromDate: Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -3),'c')
        },
        pageParam: '',
        startParam: '',
        // url: '/api/v1/campaigns?fromDate=' + window.encodeURIComponent(Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -3),'c')),
        url: '/api/v1/campaigns',
        reader: {
            type: 'json'
        },
        writer: {
            writeAllFields: true
        }
    },
    getDefaultStartDate: function () {
        var now = new Date(),
            date = new Date(Date.UTC(now.getFullYear(), now.getMonth()+1, 1));
        return date;
    },
    getDefaultEndDate: function () {
        var startDate = this.getDefaultStartDate();
        return new Date(startDate.getUTCFullYear(), startDate.getUTCMonth()+1, startDate.getUTCDate()-1);
    }
    // ,
    // proxy: {
    //     type: 'ajax',
    //     limitParam: null,
    //     url: '/campaign?locale=' + Bigmedia.Locales.currentLocale,
    //     reader: {
    //         type: 'json'
    //     }
    // }
});

Ext.define('Bigmedia.model.Advertiser', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' }
    ],
    idProperty: 'id',
    proxy: {
        type: 'rest',
        limitParam: null,
        pageParam: '',
        startParam: '',
        // url: '/api/v1/campaigns?fromDate=' + window.encodeURIComponent(Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.MONTH, -3),'c')),
        url: '/api/v1/advertisers',
        reader: {
            type: 'json'
        }
    }
});

Ext.define('Bigmedia.proxy.CampProxy', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.campproxy',

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
        // console.log('url before: ' + url);
        // console.log(me);
        // console.log(request);

        // if (me.getAppendId() && me.isValidId(id)) {
        //     if (!url.match(me.slashRe)) {
        //         url += '/';
        //     }
        //
        //     url += encodeURIComponent(id);
        //     if (params) {
        //         delete params[me.getIdParam()];
        //     }
        // }
        // console.log('url after: ' + url);

        if (format) {
            if (!url.match(me.periodRe)) {
                url += '.';
            }

            url += format;
        }

        if (!record) {
            var filters = params.filter;
            if (filters) {
                filters = Ext.decode(filters);
                id = filters[0].value;
                var addSlash = (url.charAt() !== '/')?'/':'';
                url = '/api/v1/campaigns/' + encodeURIComponent(id) + addSlash + url;
                delete params['filter'];
                // params.filter = '';
            }
        } else {
            // console.log([me, records]);
            url = '/api/v1/' + url;
        }

        // console.log('url in request: ' + url);

        request.setUrl(url);

        // console.log('url in the end: ' + url);
        // console.log('filter: %o', params.filter);

        return me.callParent([request]);
    }
});

Ext.define('Bigmedia.model.CampBase', {
  extend: 'Bigmedia.model.BaseSchema',
  idProperty: 'id',
  fields: [
    { name: 'id' },
    { name: 'campaignId',
      reference: {
        parent: 'Campaign'
      },
      allowBlank: false
    }
  ],
  proxy: 'campproxy'
});

Ext.define('Bigmedia.model.Poster', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'name', type: 'string'},
        { name: 'type',
            defaultValue: 1},
        { name: 'subject'},
        { name: 'subjectId', type: 'int',
            calculate: function (data) {
                return data.subject ? data.subject.id : null;
            }
        },
        { name: 'subjectBlob'},
        { name: 'ownerId', type: 'int'}
        // ,
        // { name: 'updatedAt', type: 'date', dateFormat: 'c',
        //     defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
        //     dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' }
    ],
    validators: {
        name: 'presence'
    },
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'posters',
        writer: {
            writeAllFields: true
        }
    }
});

Ext.define('Bigmedia.model.Document', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'num',
            calculate: function (data) {
                return data.common ? data.common.num : '';
            }
        },
        { name: 'common' },
        { name: 'typeId' },
        { name: 'type',
            calculate: function (data) {
                return Bigmedia.Locales.refDocumentType[data.typeId];
            }
        },
        { name: 'status',
            convert: function (v) {
                return Bigmedia.Locales.refDocumentStatus[v];
            }
        },
        { name: 'createdAt', type: 'date', format: 'c'},
        { name: 'updatedAt', type: 'date', format: 'c'},
        { name: 'pdf' },
        { name: 'pdfId' ,
            calculate: function (data) {
                return data.pdf ? data.pdf.id : null;
            }
        }
    ],
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'documents'
    }
});

Ext.define('Bigmedia.model.CampServiceOperation', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'sideId', type: 'int'},
        { name: 'type', type: 'int'},
        { name: 'typeName',
            calculate: function (data) {
                return Bigmedia.Locales.refServiceOperationType[data.type];
            }
        },
        { name: 'status', type: 'int',
            convert: function (v) {
                var status;
                switch (+v) {
                    case 2:
                    case 4:
                        status = 2;
                        break;
                    case 3:
                    case 5:
                        status = 3;
                        break;
                    default:
                        status = 1;
                }
                return status;
            }
        },
        { name: 'statusName',
            calculate: function (data) {
                return Bigmedia.Locales.refServiceOperationStatus[data.status];
                // var status;
                // switch (+data.status) {
                //     case 2:
                //     case 4:
                //         status = Bigmedia.Locales.refServiceOperationStatus[2];
                //         break;
                //     case 3:
                //     case 5:
                //         status = Bigmedia.Locales.refServiceOperationStatus[3];
                //         break;
                //     default:
                //         status = Bigmedia.Locales.refServiceOperationStatus[data.status];
                // }
                // return status;
            }
        },
        { name: 'performedAt', type: 'date', format: 'c'},
        { name: 'performedAtDay', type: 'date', format: 'c',
            calculate: function (data) {
                return Ext.util.Format.date(data.performedAt, 'Y-m-d');
            }
        },
        { name: 'coverAt', type: 'date', format: 'c'},
        { name: 'note', type: 'string'},
        { name: 'photoRec'},
        { name: 'photoRecObj',
            calculate: function (data) {
                var obj = Ext.clone(data.photoRec);
                if (obj) {
                    obj.toString = function(){
                        return Bigmedia.Locales.exportServicePhotoText;
                    };
                }
                return obj;
            }
        },
        { name: 'photoRecId', type: 'int'},
        { name: 'posterId', type: 'int'},
        { name: 'face',
            calculate: function(data){
                var sides = Ext.getStore('Sides'),
                    faces = Ext.getStore('Faces'),
                    side = sides.getById(data.sideId);
                if (side) {
                    var face = faces.getById(side.get('faceId'));
                    if (face) {
                        return face;
                    }
                }
                return { get: function () { return '';}}
            }
        },
        { name: 'side',
            calculate: function(data){
                var sides = Ext.getStore('Sides'),
                    side = sides.getById(data.sideId);
                return side?side.getData():{};
            }
        }, {
            name: 'sideNum',
            type: 'number',
            calculate: function(data){
                return data.side.num;
            }
        },{ 
            name: 'faceSupplierNo',
            type: 'string',
            calculate: function(data){
                return data.face.get('supplierNo');
            }
        }, {
            name: 'faceNum',
            type: 'number',
            calculate: function(data){
                return data.face.get('num'); //.num;
            }
        }, {
            name: 'faceCity',
            calculate: function(data){
                return data.face.get('city'); //.city;
            }
        }, {
            name: 'faceAddress',
            calculate: function(data){
                return data.face.get('address'); //.address;
            }
        }
    ],
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'serviceOperations'
    }
});

Ext.define('Bigmedia.model.CampPhoto', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'sideId', type: 'int'},
        { name: 'type', type: 'int' },
        { name: 'typeName',
            calculate: function (data) {
                return Bigmedia.Locales.refPhotoType[data.type];
            }
        },
        { name: 'deadline', type: 'date', format: 'c'},
        { name: 'createdAt', type: 'date', format: 'c'},
        { name: 'updatedAt', type: 'date', format: 'c'},
        { name: 'personId', type: 'int'},
        { name: 'photoRecs' },
        { name: 'takenAtDay', type: 'date', format: 'c',
            calculate: function (data) {
                if (data.photoRecs && data.photoRecs.length > 0) {
                    return Ext.util.Format.date(data.photoRecs[0].takenAt, 'Y-m-d');
                }
            }
        },
        { name: 'face',
            calculate: function(data){
                var sides = Ext.getStore('Sides'),
                    faces = Ext.getStore('Faces'),
                    side = sides.getById(data.sideId);
                if (side) {
                    var face = faces.getById(side.get('faceId'));
                    if (face) {
                        return face.getData();
                    }
                }
                return {};
            }
        },
        { name: 'side',
            calculate: function(data){
                var sides = Ext.getStore('Sides'),
                    side = sides.getById(data.sideId);
                return side?side.getData():{};
            }
        }, {
            name: 'sideNum',
            type: 'number',
            calculate: function(data){
                return data.side.num;
            }
        }, {
            name: 'faceNum',
            type: 'number',
            calculate: function(data){
                return data.face.num;
            }
        }, {
            name: 'faceCity',
            calculate: function(data){
                return data.face.city;
            }
        }, {
            name: 'faceAddress',
            calculate: function(data){
                return data.face.address;
            }
        }, { 
            name: 'faceSupplierNo',
            type: 'string',
            calculate: function(data){
                return data.face.supplierNo;
            }
        }
    ],
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'photos'
    }
});

Ext.define('Bigmedia.model.Proposal', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'num',
            calculate: function (data) {
                var num = data.doorsNo || '';
                if (data.supplierNo) {
                    num += '(' + data.supplierNo + ')';
                }
                return num;
            }
        },
        { name: 'sideId', type: 'int'},
        { name: 'operationId', type: 'int' },
        { name: 'startDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'endDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' },
        { name: 'confirmDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'confirmed', type: 'int'},
        { name: 'propCreatedAt', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'propUpdatedAt', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'faceId', type: 'int'},
        { name: 'netCost', calculate: function (data) {
          if (data.supplierPriceEnc) {
              return Bigmedia.Vars.decryptPrice(Bigmedia.Vars.getSalt(data.campaignId) || 'gw2AM1XDucz7rPYbQ4q4', data.supplierPriceEnc);
          } else {
              return data.supplierPrice;
          }
        }},
        { name: 'supplierPrice'},
        { name: 'supplierPriceEnc'},
        { name: 'supplierNo', type: 'string'},
        { name: 'doorsNo', type: 'int', allowNull: true},
        { name: 'byPlanner', type: 'int'},
        { name: 'proposalId', type: 'int'},
        { name: 'webProposalId', type: 'int'},
        { name: 'pubCampaignId', type: 'string'},
        { name: 'cityId', type: 'int'},
        {
            name: 'id_city',
            calculate: function (data) {
                return data.cityId;
            }
        },
        { name: 'supplierCity', type: 'string'},
        { name: 'city',
            calculate: function (data) {
                return data.cityId ? Bigmedia.Locales.refCity[data.cityId] : data.supplierCity;
            }
        },
        { name: 'sidetypeId', type: 'int'},
        { name: 'supplierSidetype', type: 'string'},
        { name: 'sidetype',
            calculate: function (data) {
                return data.sidetypeId ? Bigmedia.Locales.refSidetype[data.sidetypeId] : data.supplierSidetype;
            }
        },
        { name: 'sizeId', type: 'int'},
        { name: 'supplierSize', type: 'string'},
        { name: 'size',
            calculate: function (data) {
                return data.sizeId ? Bigmedia.Locales.refSize[data.sizeId] : data.supplierSize;
            }
        },
        { name: 'catab', type: 'string'},
        { name: 'light', type: 'string'},
        { name: 'hide_doors_data'},
        { name: 'grp', allowNull: true},
        { name: 'displayGrp',
          calculate: function (data) {
            if (!data.hide_doors_data) {
              return data.grp
            }
          }},
        { name: 'ots', allowNull: true},
        { name: 'displayOts',
          calculate: function (data) {
            if (!data.hide_doors_data) {
              return data.ots
            }
          }},
        { name: 'lon'},
        { name: 'lat'},
        { name: 'pos'},
        { name: 'angle'},
        { name: 'pubCustomRating'},
        { name: 'pubDecision'},
        { name: 'pubCreatedAt', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'pubUpdatedAt', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'pubProcessed'},
        { name: 'pubProcessedAt', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
        { name: 'address_ukr', type: 'string'},
        { name: 'address_ru', type: 'string'},
        { name: 'address_en', type: 'string'},
        { name: 'address',
            calculate: function (data) {
                return data['address_' + Bigmedia.Locales.currentLocale] || data['address_ru'];
            }
        },
        { name: 'photos',
            convert: function (value, record) {
                if (!value) {
                    return null;
                }
                return typeof value === 'object' ? value : JSON.parse(value);
            }
        }, {
            name: 'urlPhoto', mapping: 'photo_url'
        }, {
            name: 'urlSchema', mapping: 'schema_url'
        },
        { name: 'pubNote', type: 'string'},
        { name: 'displayPubPrice',
            calculate: function (data) {
                if (data.pubPriceEnc) {
                    return Bigmedia.Vars.decryptPrice(Bigmedia.Vars.getPubPassphrase(data.pubCampaignId), data.pubPriceEnc);
                } else {
                    return data.pubPrice;
                }
            }
        },
        { name: 'pubPrice'},
        { name: 'pubPriceEnc'},
        { name: 'pubOwnerNote', type: 'string'},
        { name: 'selected', type: 'boolean', defaultValue: false, persist: false },
        { name: 'inCart', type: 'boolean', defaultValue: false, persist: false },
        { name: 'operationName',
            calculate: function (data) {
                return Bigmedia.Locales.refSaleOpers[data.operationId] || '';
            }
        },
        { name: 'posterId', type: 'int'},
        {
            name: 'geometry',
            calculate: function (data) {
                if (parseFloat(data.lon) && parseFloat(data.lat)) {
                    var coord = [parseFloat(data.lon), parseFloat(data.lat)];
                    return new ol.geom.Point(ol.proj.fromLonLat(coord));
                }
                else return null;
            }
        }, {
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
        }, {
            name: 'coverages',
            calculate: function (data) {
                return Bigmedia.Vars.calculateCoverages(data);
            }
        }, {
            name: 'parsedOccupancy',
            calculate: function (data) {
                if (!data.faceId) {
                    return null;
                }
                var face = Ext.getStore('Faces').getById(data.faceId);
                return face ? face.get('parsedOccupancy') : null;
            }
        }
    ],
    setCampaign: function (args) {
        // console.log(args);
    },
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'proposals',
        listeners: {
            exception: function (proxy, request, operation) {
                // console.log('request: %o', request);
                // console.log('operation: %o', operation);
            }
        }
        // ,
        // writer: {
        //     type: 'json',
        //     transform: {
        //         fn: function(data, request) {
        //             // do some manipulation of the unserialized data object
        //             data.supplierPriceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(data.campaignId), data.supplierPrice);
        //             data.pubPriceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(data.campaignId), data.pubPrice);
        //             console.log([data.supplierPriceEnc, data.pubPriceEnc]);
        //             return data;
        //         },
        //         scope: this
        //     }
        // }
    }
});

Ext.define('Bigmedia.model.CampPoi', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'id_category', type: 'int' },
        { name: 'categoryId', type: 'int' },
        {
            name: 'category',
            calculate: function (data) {
                var catStore = Ext.getStore('PoiCategoriesTree'); //#1
                var rec = catStore.getNodeById(+data.id_category || +data.categoryId);//#2
                var res = '';
                if (rec) {
                    res = rec.get('name');
                }
                return res;
            }
        },
        { name: 'custom_category' },
        { name: 'iconId'},
        { name: 'color'},
        { name: 'name', type: 'string' },
        //     calculate: function (data) {
        //         return data['name_' + Bigmedia.Locales.currentLocale] || data['name_ukr'] || data['name_ru'] || data['name_en'] || '';
        //     }
        // },
        // { name: 'name_ukr', type: 'string', persist: false },
        // { name: 'name_ru', type: 'string', persist: false },
        // { name: 'name_en', type: 'string', persist: false },
        { name: 'address'},
        { name: 'housenumber'},
        { name: 'city'},
        { name: 'lon'},
        { name: 'lat'},
        { name: 'geometry', serialize: function (value, record) {
            return Bigmedia.Vars.writeFeatureGeometry(record.get('geometry'));
        }},
        { name: 'centroid', persist: false},
        { name: 'feature' , persist: false},
    ],
    setCampaign: function (args) {
        // console.log(args);
    },
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'pois',
        listeners: {
            exception: function (proxy, request, operation) {
                // console.log('request: %o', request);
                // console.log('operation: %o', operation);
            }
        },
        reader: {
            type: 'json',
            transform: {
                fn: function(data) {
                    var me = this;
                    // do some manipulation of the raw data object
                    data.forEach(function(rec){
                        try {
                            if (rec.geometry && (typeof rec.geometry !== 'object')) {
                                rec.geometry = Bigmedia.Vars.readFeatureGeometry(rec.geometry);
                            }
                            if (parseFloat(rec.lon) && parseFloat(rec.lat)) {
                                var coord = [parseFloat(rec.lon), parseFloat(rec.lat)];
                                rec.centroid = new ol.geom.Point(ol.proj.fromLonLat(coord));
                                if (!rec.geometry) {
                                    rec.geometry = rec.centroid;
                                }
                            }
                        } catch (e) {
                            console.log('error converting geometry');
                        }
                    })
                    return data;
                },
                scope: this
            }
        }
        // ,
        // writer: {
        //     type: 'json',
        //     transform: {
        //         fn: function(data, request) {
        //             // do some manipulation of the unserialized data object
        //             data.supplierPriceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(data.campaignId), data.supplierPrice);
        //             data.pubPriceEnc = Bigmedia.Vars.encryptPrice(Bigmedia.Vars.getSalt(data.campaignId), data.pubPrice);
        //             console.log([data.supplierPriceEnc, data.pubPriceEnc]);
        //             return data;
        //         },
        //         scope: this
        //     }
        // }
    }
});

// Ext.define('Bigmedia.model.Proposal', {
//     extend: 'Bigmedia.model.CampBase',
//     fields: [
//         { name: 'sideId', type: 'int'},
//         { name: 'faceId', type: 'int'},
//         { name: 'startDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
//         { name: 'endDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' },
//         { name: 'operationId', type: 'int' },
//         { name: 'selected', type: 'boolean', defaultValue: false },
//         { name: 'operationName',
//             calculate: function (data) {
//                 return Bigmedia.Locales.refSaleOpers[data.operationId];
//             }
//         },
//         { name: 'posterId', type: 'int'},
//         { name: 'face',
//             calculate: function(data){
//                 var sides = Ext.getStore('Sides'),
//                     faces = Ext.getStore('Faces'),
//                     side = sides.getById(data.sideId);
//                 if (side) {
//                     var face = faces.getById(side.get('faceId'));
//                     if (face) {
//                         return face; //.getData();
//                     }
//                 } else if (data.faceId) {
//                     var face = faces.getById(data.faceId);
//                     if (face) {
//                         return face; //.getData();
//                     }
//                 }
//                 return null;
//             }
//         },
//         { name: 'side',
//             calculate: function(data){
//                 var sides = Ext.getStore('Sides'),
//                     side = sides.getById(data.sideId);
//                 return side?side.getData():{};
//             }
//         }, {
//             name: 'sideNum',
//             type: 'number',
//             calculate: function(data){
//                 return data.side.num;
//             }
//         }, {
//             name: 'faceNum',
//             type: 'number',
//             calculate: function(data){
//                 return data.face ? data.face.get('num') : null; //.num;
//             }
//         }, {
//             name: 'faceCity',
//             calculate: function(data){
//                 return data.face ? data.face.get('city') : null; //.city;
//             }
//         }, {
//             name: 'faceAddress',
//             calculate: function(data){
//                 return data.face ? data.face.get('address') : null; //.address;
//             }
//         }, {
//             name: 'faceCatab',
//             calculate: function(data){
//                 return data.face ? data.face.get('catab') : null; //.catab;
//             }
//         }, {
//             name: 'faceSize',
//             calculate: function(data){
//                 return data.face ? data.face.get('size') : null; //.size;
//             }
//         }, {
//             name: 'faceNetwork',
//             calculate: function(data){
//                 return data.face ? data.face.get('network') : null; //.network;
//             }
//         }, {
//             name: 'faceRating',
//             calculate: function(data){
//                 return data.face ? data.face.get('rating') : null; //.rating;
//             }
//         }, {
//             name: 'faceZone',
//             calculate: function(data){
//                 return data.face ? data.face.get('zone') : null; //.zone;
//             }
//         }, {
//             name: 'faceGrp',
//             calculate: function(data){
//                 return data.face ? data.face.get('grp') : null; //.grp;
//             }
//         }, {
//             name: 'faceOts',
//             calculate: function(data){
//                 return data.face ? data.face.get('ots') : null; //.ots;
//             }
//         }, {
//             name: 'faceDoors_no',
//             calculate: function(data){
//                 return data.face ? data.face.get('doors_no') : null; //.doors_no;
//             }
//         }, {
//             name: 'geometry',
//             calculate: function(data){
//                 return data.face ? data.face.get('geometry') : null; //.geometry;
//             }
//         }, {
//             name: 'angle',
//             calculate: function(data){
//                 return data.face ? data.face.get('angle') : null; //.angle;
//             }
//         }, {
//             name: 'icon',
//             calculate: function(data){
//                 return data.face ? data.face.get('icon') : null; //.icon;
//             }
//         }, {
//             name: 'coverages',
//             calculate: function (data) {
//                 return Bigmedia.Vars.calculateCoverages(data);
//             }
//         }
//     ],
//     proxy: {
//         type: 'campproxy',
//         limitParam: null,
//         pageParam: '',
//         startParam: '',
//         url: 'proposals',
//         listeners: {
//             exception: function (proxy, request, operation) {
//                 // console.log('request: %o', request);
//                 // console.log('operation: %o', operation);
//             }
//         }
//     }
// });

Ext.define('Bigmedia.model.PosterTask', {
    extend: 'Bigmedia.model.CampBase',
    // extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        { name: 'id' },
        // { name: 'campaignId',
        //     reference: {
        //         parent: 'Campaign'
        //     },
        //     allowBlank: false
        // },
        { name: 'proposalId',
            reference: {
                parent: 'Proposal'
            },
            allowBlank: false
        },
        { name: 'posterId',
            reference: {
                parent: 'Poster'
            },
            allowBlank: false
        },
        { name: 'coverDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' }
    ],
    proxy: {
        // type: 'campproxy',
        type: 'rest',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/postertasks',
        writer: {
            writeAllFields: true
        }
    }
});

Ext.define('Bigmedia.model.Estimation', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
        { name: 'total' },
        { name: 'measureUnit', type: 'int' }
    ],
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'estimations'
    }
});

Ext.define('Bigmedia.proxy.CampProxy2', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.campproxy2',

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

        // console.log('url before: ' + url);
        // console.log(me);
        // console.log(request);

        // if (me.getAppendId() && me.isValidId(id)) {
        //     if (!url.match(me.slashRe)) {
        //         url += '/';
        //     }
        //
        //     url += encodeURIComponent(id);
        //     if (params) {
        //         delete params[me.getIdParam()];
        //     }
        // }
        // console.log('url after: ' + url);

        if (format) {
            if (!url.match(me.periodRe)) {
                url += '.';
            }

            url += format;
        }

        if (!record) {
            var filters = params.filter;
            if (filters) {
                filters = Ext.decode(filters);
                id = filters[0].value;
                var addSlash = (url.charAt() !== '/')?'/':'';
                url = '/api/v1/campaigns/' + encodeURIComponent(id) + addSlash + url;
                delete params['filter'];
                // params.filter = '';
            }
        } else {
            if (record.get('campaignId')) {
                id = record.get('campaignId');
                var addSlash = (url.charAt() !== '/')?'/':'';
                url = '/api/v1/campaigns/' + encodeURIComponent(id) + addSlash + url;
            } else {
                url = '/api/v1/' + url;
            }
        }

        // console.log('url in request: ' + url);

        request.setUrl(url);

        // console.log('url in the end: ' + url);
        // console.log('filter: %o', params.filter);

        return me.callParent([request]);
    }
});

Ext.define('Bigmedia.model.Published', {
    extend: 'Bigmedia.model.CampBase',
    fields: [
        { name: 'id', type: 'string'},
        { name: 'name', type: 'string' },
        { name: 'startDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+1, 1)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },
        { name: 'endDate', type: 'date', dateFormat: 'c',
            defaultValue: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
            dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'
        },
        { name: 'note', type: 'string', defaultValue: ''},
        { name: 'closed', type: 'int', defaultValue: 0},
        { name: 'deleted', type: 'int'},
        { name: 'email', type: 'string'},
        { name: 'cryptoHash', type: 'string'},
        { name: 'createdAt', type: 'date', dateFormat: 'c', persist: false},
        { name: 'updatedAt', type: 'date', dateFormat: 'c', persist: false},
        { name: 'ownerId', type: 'int'},
        { name: 'showBigmediaCodes', defaultValue: true,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showSupplierCodes', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showDoorsCodes', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showSuppliers', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showMetrics', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showCptMetrics', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showCoverage', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showPrices', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'showHeatmap', defaultValue: false,
            serialize: function (value) { return value ? 1 : 0} },
        { name: 'heatmapName', },
        { name: 'heatmapParams',
            convert: function (value) {
              try {
                return value && typeof value != 'object' ? JSON.parse(value): value
              } catch (e) {
                console.error(e);
                return null;
              }
            },
            serialize: function (value) { return value ? JSON.stringify(value) : null} },
        { name: 'heatmapParamsXml' }
    ],
    proxy: {
        type: 'campproxy',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'published',
        writer: {
            writeAllFields: true
        }
    }
});

// Ext.define('Bigmedia.model.PublishedProposal', {
//     extend: 'Bigmedia.model.CampBase',
//     // extend: 'Ext.data.Model',
//     idProperty: 'id',
//     fields: [
//         { name: 'id', type: 'int'},
//         { name: 'publishedCampaignId', type: 'string',
//             reference: {
//                 parent: 'Published'
//             },
//             allowBlank: false
//         },
//         { name: 'proposalId', type: 'int',
//             reference: {
//                 parent: 'Proposal'
//             },
//             allowBlank: false
//         },
//         // { name: 'proposalId', type: 'int'},
//         { name: 'price', type: 'number'},
//         { name: 'ownerNote', type: 'string'},
//         { name: 'customRating', type: 'int'},
//         { name: 'decision', type: 'string'},
//         { name: 'note', type: 'string'},
//         { name: 'processed', type: 'int'},
//         { name: 'name', type: 'string' },
//         { name: 'createdAt', type: 'date', format: 'c'},
//         { name: 'updatedAt', type: 'date', format: 'c'},
//         { name: 'processedAt', type: 'date', format: 'c'},
//         {
//             name: 'coverages',
//             calculate: function (data) {
//                 return Bigmedia.Vars.calculateCoverages(data);
//             }
//         }
//     ],
//     proxy: {
//         type: 'campproxy2',
//         limitParam: null,
//         pageParam: '',
//         startParam: '',
//         url: 'proposals'
//     }
// });

// Ext.define('Bigmedia.model.JoinedProposal', {
//     extend: 'Bigmedia.model.CampBase',
//     fields: [
//         { name: 'sideId', type: 'int'},
//         { name: 'startDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
//         { name: 'endDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' },
//         { name: 'operationId', type: 'int' },
//         { name: 'operationName',
//             calculate: function (data) {
//                 return Bigmedia.Locales.refSaleOpers[data.operationId];
//             }
//         },
//         { name: 'posterId', type: 'int'},
//         { name: 'face',
//             calculate: function(data){
//                 var sides = Ext.getStore('Sides'),
//                     faces = Ext.getStore('Faces'),
//                     side = sides.getById(data.sideId);
//                 if (side) {
//                     if (side.get('faceId')) {
//                         var face = faces.getById(side.get('faceId'));
//                         if (face) {
//                             return face; //.getData();
//                         }
//                     }
//                 }
//                 return null;
//             }
//         },
//         { name: 'side',
//             calculate: function(data){
//                 var sides = Ext.getStore('Sides'),
//                     side = sides.getById(data.sideId);
//                 return side?side.getData():{};
//             }
//         }, {
//             name: 'sideNum',
//             type: 'number',
//             calculate: function(data){
//                 return data.side.num;
//             }
//         }, {
//             name: 'faceNum',
//             type: 'number',
//             calculate: function(data){
//                 return data.face ? data.face.get('num') : null; //.num;
//             }
//         }, {
//             name: 'faceCity',
//             calculate: function(data){
//                 return data.face ? data.face.get('city') : null; //.city;
//             }
//         }, {
//             name: 'faceAddress',
//             calculate: function(data){
//                 return data.face ? data.face.get('address') : null; //.address;
//             }
//         }, {
//             name: 'faceCatab',
//             calculate: function(data){
//                 return data.face ? data.face.get('catab') : null; //.catab;
//             }
//         }, {
//             name: 'faceSize',
//             calculate: function(data){
//                 return data.face ? data.face.get('size') : null; //.size;
//             }
//         }, {
//             name: 'faceNetwork',
//             calculate: function(data){
//                 return data.face ? data.face.get('network') : null; //.network;
//             }
//         }, {
//             name: 'faceRating',
//             calculate: function(data){
//                 return data.face ? data.face.get('rating') : null; //.rating;
//             }
//         }, {
//             name: 'faceZone',
//             calculate: function(data){
//                 return data.face ? data.face.get('zone') : null; //.zone;
//             }
//         }, {
//             name: 'faceGrp',
//             calculate: function(data){
//                 return data.face ? data.face.get('grp') : null; //.grp;
//             }
//         }, {
//             name: 'faceOts',
//             calculate: function(data){
//                 return data.face ? data.face.get('ots') : null; //.ots;
//             }
//         }, {
//             name: 'faceDoors_no',
//             calculate: function(data){
//                 return data.face ? data.face.get('doors_no') : null; //.doors_no;
//             }
//         }, {
//             name: 'geometry',
//             calculate: function(data){
//                 return data.face ? data.face.get('geometry') : null; //.geometry;
//             }
//         }, {
//             name: 'angle',
//             calculate: function(data){
//                 return data.face ? data.face.get('angle') : null; //.angle;
//             }
//         }, {
//             name: 'icon',
//             calculate: function(data){
//                 return data.face ? data.face.get('icon') : null; //.icon;
//             }
//         },
//         { name: 'publishedProposalId', type: 'int'},
//         { name: 'publishedCampaignId', type:'string'},
//         { name: 'price', type: 'number'},
//         { name: 'ownerNote', type: 'string'},
//         { name: 'customRating', type: 'int',
//             convert: function (val) {
//                 return val || 0;
//             }
//         },
//         { name: 'decision', type: 'string', defaultValue: 'W'},
//         { name: 'note', type: 'string'},
//         {
//             name: 'coverages',
//             calculate: function (data) {
//                 return Bigmedia.Vars.calculateCoverages(data);
//             }
//         }
//     ],
//     proxy: {
//         type: 'campproxy2',
//         limitParam: null,
//         pageParam: '',
//         startParam: '',
//         url: 'proposals'
//     }
// });

// Ext.define('Bigmedia.model.ThirdpartyProposal', {
//     extend: 'Bigmedia.model.CampBase',
//     fields: [
//         { name: 'dix', type: 'int'},
//         { name: 'doorsNo', type: 'int'},
//         { name: 'startDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z'},
//         { name: 'endDate', type: 'date', dateWriteFormat: 'Y-m-d\\T00:00:00.000\\Z' },
//         { name: 'city'},
//         { name: 'address' },
//         { name: 'type' },
//         { name: 'catab'},
//         { name: 'size'},
//         { name: 'supplier'},
//         { name: 'grp'},
//         { name: 'ots'},
//         { name: 'lon'},
//         { name: 'lat'},
//         {
//             name: 'geometry',
//             calculate: function (data) {
//                 if (parseFloat(data.lon) && parseFloat(data.lat)) {
//                     var coord = [parseFloat(data.lon), parseFloat(data.lat)],
//                         pos = 0;
//                     if (+pos !== 0) {
//                         var offset = [pos * 0.00005, 0],
//                             angleRad = (data.angle) *  Math.PI / 180;
//                         ol.coordinate.rotate(offset, angleRad);
//
//                         ol.coordinate.add(coord, offset);
//                     }
//                     return new ol.geom.Point(ol.proj.fromLonLat(coord));
//                 }
//                 else return null;
//             }
//         },
//         { name: 'angle'},
//         {
//             name: 'icon',
//             calculate: function (data) {
//                 var s = 'l'; //s-small(<18 sq.m.), b-board(~18 sq.m.), l-large(>18 sq.m.)
//                 switch (data.size) {
//                     case '1.2x1.8':
//                     case '1.2x3.6':
//                     case '1.5x3':
//                     case '2.3x3.14':
//                     case '2.3x3.5':
//                         s = 's';
//                         break;
//                     case '3x4':
//                     case '3x6':
//                     case '6x3':
//                     case '7x4':
//                     case '3x11':
//                     case '3x12':
//                         s = 'b';
//                         break;
//                 }
//                 return s;
//             }
//         },
//         { name: 'publishedCampaignId', type:'string'},
//         { name: 'price', type: 'number'},
//         { name: 'ownerNote', type: 'string'},
//         { name: 'customRating', type: 'int',
//             convert: function (val) {
//                 return val || 0;
//             }
//         },
//         { name: 'decision', type: 'string', defaultValue: 'W'},
//         { name: 'note', type: 'string'},
//         {
//             name: 'coverages',
//             calculate: function (data) {
//                 return Bigmedia.Vars.calculateCoverages(data);
//             }
//         }
//     ],
//     proxy: {
//         type: 'campproxy2',
//         limitParam: null,
//         pageParam: '',
//         startParam: '',
//         url: 'third-party'
//     }
// });
