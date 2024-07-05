Ext.define('Bigmedia.model.PoiCategoryFaces', {
    extend: 'Ext.data.TreeModel',
    idProperty: 'id',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'id_parent', type: 'int'},
        {
            name: 'name',
            calculate: function (data) {
                var catStore = Ext.getStore('PoiCategories'); //#1
                //console.log(data.id);
                if(!catStore){return '';}
                var rec = catStore.getById(data.id);//#2
                var res = '';
                if (rec) {
                    res = rec.get('name');
                }
                return res;
            }
        },
        {name: 'addCount', type: 'int', defaultValue: '0'},
        {name: 'subCount', type: 'int', defaultValue: '0'},
        {name: 'totalCount', type: 'int', defaultValue: '0'}
    ]
});
