Ext.define('Bigmedia.model.PoiFilter', {
    extend: 'Ext.data.Model',

    idProperty: 'name_ukr',
    fields: [
        //{ name: 'id', type: 'int' },
        { name: 'id_category', type: 'int' },
        {
            name: 'category',
            calculate: function (data) {
                var catStore = Ext.getStore('PoiCategories'); //#1
                var rec = catStore.getById(+data.id_category);//#2
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
                return data['name_' + Bigmedia.Locales.currentLocale] || data['name_ru'] || '';
            }
        },
        { name: 'name_ukr', type: 'string' },
        { name: 'name_ru', type: 'string' },
        { name: 'name_en', type: 'string' },
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'},
        {name: 'totalCount', type: 'int', defaultValue: '0'}
    ]
});
