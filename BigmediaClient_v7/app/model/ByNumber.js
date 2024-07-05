Ext.define('Bigmedia.model.ByNumber', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string'},
        { name: 'faces' },
        { name: 'addCount', type: 'int'},
        { name: 'totalCount', type: 'int'}
    ]
});
