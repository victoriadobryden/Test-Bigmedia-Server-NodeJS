Ext.define('Bigmedia.model.Street', {
    extend: 'Ext.data.Model',
    
    fields: [
        { name: 'id', type: 'int' },
        { name: 'id_city', type: 'int' },
        {
            name: 'city',
            calculate: function (data) {
                var citiesStore = Ext.getStore('Cities'); //#1
                var rec = citiesStore.findRecord('id', data.id_city);//#2
                var res = '';
                if (rec) {
                    res = rec.get('name');
                }
                return res;
            }
        },
        {
            name: 'name',
            calculate: function (data) {
                return data['name_' + Bigmedia.Locales.currentLocale] || '';
            }
        },
        { name: 'name_ukr', type: 'string' },
        { name: 'name_ru', type: 'string' },
        { name: 'name_en', type: 'string' },
        { name: 'faces' },
        { name: 'addCount', type: 'int'},
        { name: 'subCount', type: 'int'},
        { name: 'totalCount', type: 'int'}

    ]
});
