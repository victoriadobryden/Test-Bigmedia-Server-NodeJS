Ext.define("Bigmedia.view.dialog.DlgManageFacesForReplace", {
    extend: "Ext.window.Window",

    xtype: 'dlgmanagefacesforreplace',

    requires: [
    //     "Bigmedia.view.dialog.DlgFilterByNumberModel",
        'Bigmedia.view.grid.ThirdParty',
        "Ext.form.RadioGroup"
    ],

    viewModel: {
        data: {
            thirdpartyreplace: null
        }
    },

    config: {
        callbackImport: null,
        callbackScope: null,
        store: new Bigmedia.store.ThirdPartyBoards()
    },

    updateStore: function (newVal) {
        var me = this;
        me.getViewModel().set('thirdpartyreplace', newVal);
    },

    showDialog: function (params) {
        var me = this;
        me.onSuccess = params.success;
        me.onCancel = params.cancel;
        me.show();
    },

    width: 500,
    minWidth: 400,
    height: 380,
    minHeight: 380,
    modal: true,
    hidden: true,
    autoDestroy: false,
    autoShow: false,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgImportThirdPartyTitle,
    referenceHolder: true,
    layout: 'fit',
    padding: 10,
    items: [
        {
            xtype: 'thirdparty-grid',
            itemId: 'thirdpartygrid',
            flex: 1,
            bind: {
                store: '{thirdpartyreplace}'
            }
        }
    ],
    buttons: [
        {
            text: Bigmedia.Locales.btnCancelText,
            listeners: {
                // Call is routed to our ViewController (Ticket.view.user.UserController) but
                // the "closeView" method is a helper inherited from Ext.app.ViewController.
                click: function (btn) {
                    var win = btn.up('window');
                    if (win.onCancel) {
                        Ext.callback(win.onCancel, win, [win]);
                    }
                    win.hide();
                }
            }
        }, '->',
        {
            text: 'OK',
            reference: 'btnImport',
            //enabled: false,
            listeners: {
                click: function (btn) {
                    var win = btn.up('window');
                    if (win.onSuccess) {
                        Ext.callback(win.onSuccess, win, [win]);
                        win.hide();
                    }
                }
            }
        }
    ]
    // ,
    // listeners: {
    //     show: 'onShowView'
    // }
});
