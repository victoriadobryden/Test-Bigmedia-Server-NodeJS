Ext.define("Bigmedia.view.dialog.DlgCustomPeriod", {
    extend: "Ext.window.Window",

    requires: [
        "Bigmedia.view.dialog.DlgCustomPeriodController",
        "Bigmedia.view.dialog.DlgCustomPeriodModel"
    ],

    controller: "dialog-dlgcustomperiod",
    // viewModel: {
    //     type: "dialog-dlgcustomperiod"
    // },

    width: 500,
    minWidth: 400,
    height: 380,
    minHeight: 380,
    modal: true,
    hidden: true,
    autoDestroy: false,
    autoShow: false,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgCustomPeriodTitle,
    referenceHolder: true,
    layout: 'vbox',
    items: [
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
                    validator: function (val) {
                        // remove non-numeric characters
                        var valDate = Ext.Date.parse(val, this.format),
                            errMsg = Bigmedia.Locales.dlgCustomPeriodBegErrMsg,
                            other = this.up('window').lookupReference('seldateend'),
                            btn = this.up('window').lookupReference('btnCreateFilter');
                        // if the numeric value is not 10 digits return an error message
                        if (valDate && +valDate <= +other.getValue()) {
                            other.clearInvalid();
                            btn.enable();
                            return true;
                        }
                        btn.disable();
                        return errMsg;
                    }
                }, {
                    xtype: 'datefield',
                    reference: 'seldateend',
                    flex: 1,
                    filedLabel: Bigmedia.Locales.dlgCustomPeriodTo,
                    value: new Date(Date.now() + 86400000 * 31),
                    validator: function (val) {
                        // remove non-numeric characters
                        var valDate = Ext.Date.parse(val, this.format),
                            errMsg = Bigmedia.Locales.dlgCustomPeriodEndErrMsg,
                            other = this.up('window').lookupReference('seldatebeg'),
                            btn = this.up('window').lookupReference('btnCreateFilter');
                        // if the numeric value is not 10 digits return an error message
                        if (valDate && +valDate >= +other.getValue()) {
                            other.clearInvalid();
                            btn.enable();
                            return true;
                        }
                        btn.disable();
                        return errMsg;
                    }
                }
            ]
        },

        //{
        //    xtype: 'fieldset',
        //    title: 'Date Range',
        //    width: '100%',
        //    layout: 'hbox',
        //    defaults: {
        //        flex: 1,
        //        minWidth: 350,
        //        xtype: 'datepicker',
        //        publishes: 'value',
        //        format: 'd.m.Y',
        //        showToday: false,
        //        minDate: new Date(Date.now()+86400000),
        //        maxDate: new Date(Date.now()+86400000*365)
        //    },
        //    items: [{
        //        reference: 'datebeg',
        //        //bind: {
        //        //    maxDate: '{dateend.value}'
        //        //},
        //        value: new Date(Date.now()+86400000),
        //        listeners: {
        //            select: 'onDateBegSelect'
        //        }
        //        //,
        //        //handler: function (picker, date) {
        //        //    picker.getParentByType('window').lookupReference('dateend').setMinDate(date);
        //        //}
        //    }, {
        //        reference: 'dateend',
        //        //bind: {
        //        //    minDate: '{datebeg.value}'
        //        //},
        //        value: new Date(Date.now()+86400000*31),
        //        listeners: {
        //            select: 'onDateEndSelect'
        //        }
        //        //,
        //        //handler: function (picker, date) {
        //        //    picker.getParentByType('window').lookupReference('datebeg').setMaxDate(date);
        //        //}
        //    }
        //    ]
        //},
        {
            xtype: 'fieldset',
            title: Bigmedia.Locales.dlgCustomPeriodAdditParams,
            width: '100%',
            layout: 'vbox',
            items: [
                {
                    xtype: 'radio',
                    name: 'periodtype',
                    fieldLabel: Bigmedia.Locales.dlgCustomPeriodWholePeriod,
                    reference: 'wholeperiod',
                    inputValue: 'whole',
                    value: true,
                    width: '100%'
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    width: '100%',
                    items: [
                        {
                            xtype: 'radio',
                            name: 'periodtype',
                            reference: 'allowparts',
                            fieldLabel: Bigmedia.Locales.dlgCustomPeriodAllowParts,
                            publishes: 'value',
                            inputValue: 'parts',
                            value: false,
                            width: 130
                        },
                        {
                            xtype: 'slider',
                            reference: 'minfreedays',
                            flex:1,
                            minValue: 1,
                            maxValue: 31,
                            increment: 1,
                            bind:{
                                disabled: '{!allowparts.value}'
                            },
                            value: 10,
                            fieldLabel: Bigmedia.Locales.dlgCustomPeriodMinDaysAmount,
                            labelWidth: 150
                        }]
                },
                {
                    xtype: 'checkbox',
                    reference: 'allowtempres',
                    checked: true,
                    width: '100%',
                    fieldLabel: Bigmedia.Locales.dlgCustomPeriodShowTempReserved,
                    labelWidth: 250
                }
            ]
        }
    ],
    buttons: [
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCancelBtnLabel,
            listeners: {
                // Call is routed to our ViewController (Ticket.view.user.UserController) but
                // the "closeView" method is a helper inherited from Ext.app.ViewController.
                click: 'onCloseWindowClick'
            }
        }, '->',
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCreateBtnLabel,
            reference: 'btnCreateFilter',
            //enabled: false,
            listeners: {
                click: 'onCreateFilterClick'
            }
        }
    ],
    listeners: {
        show: 'onShowView'
    },
    showDialog: function (cbTag) {
        this.cbPoiTag = cbTag;
        this.show();
    }
});
