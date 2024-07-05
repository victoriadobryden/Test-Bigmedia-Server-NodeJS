Ext.define("Bigmedia.view.dialog.DlgImportSupplierPrices", {
    extend: "Ext.window.Window",

    requires: [
    //     "Bigmedia.view.dialog.DlgFilterByNumberModel",
        "Bigmedia.view.dialog.DlgImportSupplierPricesController",
        "Ext.form.RadioGroup"
    ],

    controller: "dialog-dlgimportsupplierprices",
    // viewModel: {
    //     type: "dialog-dlgcustomperiod"
    // },

    config: {
        callbackImport: null,
        callbackScope: null,
        onlyDoorsNo: false
    },

    viewModel: {
        savepriceoption: '3',
        savepricepassword: null,
        savepriceglobaldisable: false,
        savepricepasswordglobal: false
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
        },
        {
            xtype: 'radiogroup',
            bind: '{savepriceoption}',
            vertical: true,
            simpleValue: true,
            items: [
                // { boxLabel: 'Do not save price', name: 'sp', inputValue: '1', checked: true },
                { boxLabel: 'Save using global password', name: 'sp', inputValue: '2', bind: {
                    disabled: '{savepriceglobaldisable}'
                } },
                { boxLabel: 'Input special password', name: 'sp', inputValue: '3' }
            ]
        },
        {
            xtype: 'textfield',
            bind: {
                hidden: '{savepriceoption != "3"}',
                value: '{savepricepassword}'
            },
            width: '100%',
            validator: function(val) {
                // remove non-numeric characters
                var errMsg = "Поле не може бути порожнім";
                // if the numeric value is not 10 digits return an error message
                return (this.isHidden() || !!val) ? true : errMsg;
            }
        },
        {
            xtype: 'checkbox',
            bind: {
                hidden: '{savepriceoption != "3"}',
                value: '{savepricepasswordglobal}'
            },
            fieldLabel: 'Save as global password'
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
