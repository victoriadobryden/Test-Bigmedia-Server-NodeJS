Ext.define('Bigmedia.view.dialog.MaterialDialog',{
    extend: 'Ext.window.Window',

    // html: 'Hello, World!!',

    modal: true,

    minWidth: 400,
    width: 400,

    // title: 'Base material dialog',

    titlePosition: 1,

    ui: 'material-dialog',

    draggable: false,

    resizable: {
      handles: 'w'
    },

    bodyPadding: 20,

    syncPosAndSize: function () {
      var win = this;
      win.setX((win.ownerCt ? win.ownerCt.getWidth() : document.body.clientWidth) - win.getWidth());
      win.setY(0);
      win.setHeight(win.ownerCt ? win.ownerCt.getHeight() : document.body.clientHeight);
    },

    constructor: function(config) {
        var me = this;
        me.callParent(config);
        Ext.on('resize', me.syncPosAndSize, me);
    },

    listeners: {
      show: function () {
        this.syncPosAndSize();
      },
      destroy: function () {
        var me = this;
        Ext.un('resize', me.syncPosAndSize, me);
      }
    }
});
