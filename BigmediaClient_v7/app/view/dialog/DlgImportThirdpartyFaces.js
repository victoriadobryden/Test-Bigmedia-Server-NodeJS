Ext.define("Bigmedia.view.dialog.DlgImportThirdpartyFaces", {
    extend: "Ext.window.Window",

    requires: [
    //     "Bigmedia.view.dialog.DlgFilterByNumberModel",
        "Bigmedia.view.dialog.DlgImportThirdpartyFacesController",
        "Ext.form.RadioGroup"
    ],

    controller: "dialog-dlgimportthirdpartyfaces",
    viewModel: {
        savepriceoption: '1',
        savepricepassword: null,
        savepriceglobaldisable: false,
        savepricepasswordglobal: false,
        sideNo: 'sideNo',
        doorsNo: null,
        startDate: null,
        endDate: null
    },

    config: {
        callbackImport: null,
        callbackScope: null,
        startDate: null,
        endDate: null
    },

    updateStartDate: function (newVal) {
        this.getViewModel().set('startDate', newVal);
    },

    updateEndDate: function (newVal) {
        this.getViewModel().set('endDate', newVal);
    },

    width: 500,
    minWidth: 400,
    height: 600,
    minHeight: 380,
    modal: true,
    hidden: true,
    autoDestroy: false,
    autoShow: false,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgImportThirdPartyTitle,
    referenceHolder: true,
    layout: 'vbox',
    padding: 10,
    items: [
        // {
        //     xtype: 'radiogroup',
        //     padding: '0 10',
        //     fieldLabel: Bigmedia.Locales.dlgImportPricesBindingColumnLabel,
        //     // Arrange checkboxes into two columns, distributed vertically
        //     columns: 2,
        //     vertical: true,
        //     width: '100%',
        //     labelWidth: 180,
        //     items: [
        //         { boxLabel: Bigmedia.Locales.dlgFilterByNumberSideNoLabel, reference: 'chbsideno', inputValue: 'sideNo', checked: true, listeners: { change: 'validateForm'} },
        //         { boxLabel: Bigmedia.Locales.dlgFilterByNumberDoorsNoLabel, reference: 'chbdoorsno', inputValue: 'doorsNo' }
        //     ]
        // },
        {
            xtype: 'fieldset',
            width: '100%',
            title: Bigmedia.Locales.dlgCustomPeriodPeriod,
            layout: 'hbox',
            defaults: {
                format: 'd.m.Y',
                minDate: new Date(Date.now() + 86400000),
                maxDate: new Date(Date.now() + 86400000 * 365)
            },
            items: [
                {
                    xtype: 'datefield',
                    reference: 'seldatebeg',
                    flex: 1,
                    filedLabel: Bigmedia.Locales.dlgCustomPeriodFrom,
                    value: new Date(Date.now() + 86400000),
                    listeners: { change: 'validateForm'},
                    validator: function (val) {
                        // remove non-numeric characters
                        var valDate = Ext.Date.parse(val, this.format),
                            errMsg = Bigmedia.Locales.dlgCustomPeriodBegErrMsg,
                            other = this.up('window').lookupReference('seldateend');
                            // btn = this.up('window').lookupReference('btnCreateFilter');
                        // if the numeric value is not 10 digits return an error message
                        if (valDate && +valDate <= +other.getValue()) {
                            other.clearInvalid();
                            // btn.enable();
                            return true;
                        }
                        // btn.disable();
                        return errMsg;
                    }
                }, {
                    xtype: 'datefield',
                    reference: 'seldateend',
                    flex: 1,
                    filedLabel: Bigmedia.Locales.dlgCustomPeriodTo,
                    value: new Date(Date.now() + 86400000 * 31),
                    listeners: { change: 'validateForm'},
                    validator: function (val) {
                        // remove non-numeric characters
                        var valDate = Ext.Date.parse(val, this.format),
                            errMsg = Bigmedia.Locales.dlgCustomPeriodEndErrMsg,
                            other = this.up('window').lookupReference('seldatebeg');
                            // btn = this.up('window').lookupReference('btnCreateFilter');
                        // if the numeric value is not 10 digits return an error message
                        if (valDate && +valDate >= +other.getValue()) {
                            other.clearInvalid();
                            // btn.enable();
                            return true;
                        }
                        // btn.disable();
                        return errMsg;
                    }
                }
            ]
        },
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
                        value: '{sideNo}'
                        // disabled: '{onlyDoorsNo}'
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
            emptyText: Bigmedia.Locales.dlgImportThirdPartyNumbersEmpty,
            width: '100%',
            listeners: { change: 'validateForm'},
            flex: 1
        }, {
            xtype: 'radiogroup',
            bind: '{savepriceoption}',
            vertical: true,
            simpleValue: true,
            items: [
                { boxLabel: 'Do not save price', name: 'sp', inputValue: '1', checked: true },
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
            text: Bigmedia.Locales.btnImportThirdPartyText,
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
