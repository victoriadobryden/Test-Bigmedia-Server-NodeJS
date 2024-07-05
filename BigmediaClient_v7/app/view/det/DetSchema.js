Ext.define('Bigmedia.view.det.DetSchema', {
    extend: 'Ext.window.Window',

    xtype: 'detschema',
    title: '',
    width: 300,
    height: 250,
    collapsible: false,
    minWidth: 250,
    minHeight: 180,
    layout: 'fit',
    resizable: true,
    modal: false,
    referenceHolder: true,
    closeAction: 'hide',
    // autoRender: false,

    config: {
        record: null,
        face: null,
        map: null
    },

    viewModel: {
        data: {
            record: null
        }
    },

    updateRecord: function (newVal) {
        var me = this;
        me.setFace(newVal);
    },

    updateFace: function (newVal) {
        var me = this;
        me.getViewModel().set('record', newVal);
        if (newVal) {
            var title = newVal.get('supplierNo') + (newVal.get('doorsNo') ? ' (' + newVal.get('doorsNo') + ')' : '');

            me.setTitle(title);
        }
    },

    updateMap: function (newVal) {
        var me = this,
          schema = me.lookup('schema');
        if (newVal) {
            schema.setGrid(newVal.getGrid());
            schema.setCartGrid(newVal.getCartGrid());
            schema.setSelStore(newVal.getSelStore());
            schema.setPoiStore(Ext.getStore('Pois'));
        }
    },

    items: [
      {
        xtype: 'panel',
        layout: 'fit',
        items: {
          xtype: 'facesmap',
          detFace: false,
          reference: 'schema'
        }
      }
    ],

    listeners: {
      render: function (win) {
        var schema = win.lookup('schema');
        // schema.setGrid(win.getMap().getGrid());
        // schema.setCartGrid(win.getMap().getCartGrid());
        // schema.setCartStore(Ext.getStore('ShoppingCart'));
        // schema.setPoiStore(Ext.getStore('Pois'));
        schema.map.getView().setZoom(17);
      }
    }

});
