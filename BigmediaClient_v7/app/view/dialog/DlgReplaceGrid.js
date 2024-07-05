Ext.define("Bigmedia.view.dialog.DlgReplaceGrid", {
    extend: "Ext.window.Window",

    xtype: 'dlgreplacegrid',

    config: {
        replaceStore: null,
        mapView: null
    },

    tools: [
    //     {
    //     type:'gear',
    //     tooltip: 'Add boards for replace',
    //     enableToggle: true,
    //     // hidden:true,
    //     handler: function(event, toolEl, panelHeader) {
    //         // refresh logic
    //     }
    // },
    {
        xtype: 'button',
        bind: {
            pressed: '{showToolbar}'
        },
        padding: 2,
        iconCls: 'x-fa fa-gear',
        enableToggle: true
    }],

    viewModel: {
        data: {
            replaceStore: null,
            replaceRadius: 300,
            showToolbar: false,
            replaceFaceId: null
        }
    },

    initComponent: function () {
        this.callParent();
        this.enableBubble(['radiuschanged', 'addclick', 'replaceclick', 'sourcechanged']);
    },

    updateReplaceStore: function (newVal) {
        this.getViewModel().set('replaceStore', newVal);
    },

    width: 700,
    minWidth: 400,
    height: 250,
    minHeight: 200,
    autoShow: false,
    alwaysOnTop: true,
    closeAction: "hide",
    modal: false,
    closable: true,
    title: Bigmedia.Locales.dlgReplaceTitle,
    referenceHolder: true,
    layout: 'fit',

    items: [
        {
            xtype: 'replaces-grid',
            bind: '{replaceStore}',
            listeners: {
                //
                radiuschanged: function (radius) {
                    this.up('window').fireEventArgs('radiuschanged', [radius]);
                },
                select: function (selModel, record) {
                    this.up('window').fireEventArgs('recordselected', [record]);
                }
            }
        }
    ]
});
