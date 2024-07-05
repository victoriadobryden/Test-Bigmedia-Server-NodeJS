Ext.define('Bigmedia.model.Period', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string'},
        { name: 'faces' },
        { name: 'facesReserved' },
        { name: 'addCount', type: 'int'},
        { name: 'totalCount', type: 'int'}
    ]
});
