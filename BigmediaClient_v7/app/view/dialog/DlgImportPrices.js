Ext.define("Bigmedia.view.dialog.DlgImportPrices", {
    extend: "Ext.window.Window",

    requires: [
    //     "Bigmedia.view.dialog.DlgFilterByNumberModel",
        "Bigmedia.view.dialog.DlgImportPricesController",
        "Ext.form.RadioGroup"
    ],

    controller: "dialog-dlgimportprices",
    // viewModel: {
    //     type: "dialog-dlgcustomperiod"
    // },

    config: {
        callbackImport: null,
        callbackScope: null,
        onlyDoorsNo: false
    },

    updateOnlyDoorsNo: function (newVal) {
        this.lookupViewModel().set('onlyDoorsNo', newVal);
        if (newVal) {
            this.lookupViewModel().set('doorsNo', newVal);
        }
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
    title: Bigmedia.Locales.dlgImportPricesTitle,
    referenceHolder: true,
    layout: 'vbox',
    padding: 10,
    defaultFocus: 'numbers',
    items: [
        {
            xtype: 'radiogroup',
            padding: '0 10',
            fieldLabel: Bigmedia.Locales.dlgImportPricesBindingColumnLabel,
            columns: 2,
            vertical: true,
            width: '100%',
            labelWidth: 180,
            items: [
                { boxLabel: Bigmedia.Locales.dlgFilterByNumberSideNoLabel, reference: 'chbsideno', inputValue: 'sideNo',
                    bind: {
                        // value: '{sideNo}',
                        disabled: '{onlyDoorsNo}'
                    },
                    checked: true,
                 listeners: { change: 'validateForm'} },
                { boxLabel: Bigmedia.Locales.dlgFilterByNumberDoorsNoLabel, reference: 'chbdoorsno', inputValue: 'doorsNo', bind: {
                    value: '{doorsNo}'
                } }
            ]
        },
        {
            xtype: 'textarea',
            reference: 'numbers',
            itemId: 'numbers',
            emptyText: Bigmedia.Locales.dlgImportPricesDataEmptyText,
            width: '100%',
            listeners: { change: 'validateForm'},
            flex: 1
        }
    ],
    buttons: [
        {
            text: Bigmedia.Locales.btnCancelText,
            listeners: {
                // Call is routed to our ViewController (Ticket.view.user.UserController) but
                // the "closeView" method is a helper inherited from Ext.app.ViewController.
                click: 'onCancelClick'
            }
        }, '->',
        {
            text: Bigmedia.Locales.btnImportText,
            reference: 'btnImport',
            //enabled: false,
            listeners: {
                click: 'onImportClick'
            }
        }
    ],
    listeners: {
        show: 'onShowView'
    }
});
