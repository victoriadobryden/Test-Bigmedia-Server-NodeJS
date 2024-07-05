Ext.define('Bigmedia.store.PoiCategoriesTree', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.poicategoriestree',
    storeId: 'PoiCategoriesTree',

    fields: [
        {name: 'id'},
        {name: 'id_parent', type: 'int'},
        {
            name: 'name',
            calculate: function (data) {
                return data['name_' + Bigmedia.Locales.currentLocale] || data['name_ru'] || '';
            }
        },
        {
            name: 'iconPath',
            calculate: function (data) {
                return data.map_icon ? data.map_icon + '.svg' : null;
            }
        },
        { name: 'map_icon'},
        { name: 'name_ukr'},
        { name: 'name_ru'},
        { name: 'name_en'}
    ],

    // data: Bigmedia.Locales.getRefStoreData('refPoiCategory'),

    proxy: {
        type: 'ajax',
        limitParam: null,
        pageParam: '',
        startParam: '',
        url: 'poicategorytree.json',
        reader: {
            type: 'json'
        }
    },
    autoLoad: true
});
