Ext.define('Bigmedia.model.FaceInfo', {
    extend: 'Ext.data.Model',

    requires: [
        "Bigmedia.Locales",
        "Bigmedia.model.Base"
    ],

    fields: [
        {
            name: 'id', type: 'int'
        },
        {name: 'id_sidetype', type: 'int'},
        {
            name: 'num',
            calculate: function (data) {
                var facesStore = Ext.getStore('Faces'); //#1
                var rec = facesStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('num');
                }
                return res;
            }
        },
        {
            name: 'sidetype',
            calculate: function (data) {
                var sidetypesStore = Ext.getStore('Sidetypes'); //#1
                var rec = sidetypesStore.findRecord('id', data.id_sidetype);//#2
                var res = '';
                if (rec) {
                    res = rec.get('name');
                }
                return res;
            }
        }, {
            name: 'city',
            calculate: function (data) {
                var facesStore = Ext.getStore('Faces'); //#1
                var rec = facesStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('city');
                }
                return res;
            }
        }, {
            name: 'address',
            calculate: function (data) {
                var facesStore = Ext.getStore('Faces'); //#1
                var rec = facesStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('address');
                }
                return res;
            }
        }, {
            name: 'size',
            calculate: function (data) {
                var facesStore = Ext.getStore('Faces'); //#1
                var rec = facesStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('size');
                }
                return res;
            }
        }, {
            name: 'network',
            calculate: function (data) {
                var facesStore = Ext.getStore('Faces'); //#1
                var rec = facesStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('network');
                }
                return res;
            }
        }
    ],
    idProperty: 'id',
        proxy: {
            type: 'ajax',
            limitParam: null,
            pageParam: '',
            startParam: '',
            url: '/api/v1/data?faceinfo=1&locale=' + Bigmedia.Locales.currentLocale,
            reader: {
                type: 'json'
            }
        }
});

Ext.define('Bigmedia.model.FacePhoto', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'faceId',
        reference: 'FaceInfo'
    }, {
        name: 'src',
        type: 'string'
    }],
    idProperty: 'id',
    proxy: {
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: '/api/v1/data?facephoto=1&locale=' + Bigmedia.Locales.currentLocale,
        reader: {
            type: 'json',
            rootProperty: 'face'
        }
    }
});
