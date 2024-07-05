Ext.define("Bigmedia.view.authentication.CheckOutForm", {
    extend: "Ext.form.Panel",

    requires: [
        "Bigmedia.view.authentication.CheckOutFormController",
        "Bigmedia.view.authentication.CheckOutFormModel"
    ],

    controller: "authentication-checkoutform",
    // viewModel: {
    //     type: "authentication-checkoutform"
    // },

    xtype: 'form-checkout',

    frame: true,
    title: Bigmedia.Locales.checkoutFormTitle,
    bodyPadding: 5,
    url: '/api/v1/submitCheckout',
    jsonSubmit: true,
    referenceHolder: true,

    initComponent: function () {
        Ext.apply(this, {
            width: 550,
            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 90,
                msgTarget: Ext.supports.Touch ? 'side' : 'qtip'
            },

            items: [{
                xtype: 'fieldset',
                title: Bigmedia.Locales.checkoutFormFieldsetContactInfo,
                defaultType: 'textfield',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'fieldcontainer',
                    fieldLabel: Bigmedia.Locales.checkoutFormNameLabel,
                    layout: 'hbox',
                    combineErrors: false,
                    defaultType: 'textfield',
                    defaults: {
                        hideLabel: 'true'
                    },
                    items: [{
                        name: 'firstName',
                        fieldLabel: Bigmedia.Locales.checkoutFormFirstNameLabel,
                        flex: 2,
                        emptyText: Bigmedia.Locales.checkoutFormFirstNameEmpty,
                        allowBlank: false
                    }, {
                        name: 'lastName',
                        fieldLabel: Bigmedia.Locales.checkoutFormLastNameLabel,
                        flex: 3,
                        margin: '0 0 0 6',
                        emptyText: Bigmedia.Locales.checkoutFormLastNameEmpty,
                        allowBlank: false
                    }]
                }, {
                    fieldLabel: Bigmedia.Locales.checkoutFormEmailLabel,
                    name: 'email',
                    vtype: 'email',
                    allowBlank: false
                }, {
                    fieldLabel: Bigmedia.Locales.checkoutFormOrgLabel,
                    name: 'organization',
                    allowBlank: false
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: Bigmedia.Locales.checkoutFormPhoneLabel,
                    combineErrors: false,
                    msgTarget: 'under',
                    defaultType: 'textfield',
                    labelWidth: 90,
                    anchor: '100%',
                    layout: 'hbox',
                    defaults: {
                        hideLabel: true,
                        enforceMaxLength: true,
                        maskRe: /[0-9.]/
                    },
                    items: [
                        {xtype: 'displayfield', value: '(', margin: '0 2 0 0'},
                        {
                            fieldLabel: Bigmedia.Locales.checkoutFormPhoneCodeLabel,
                            name: 'phoneCode',
                            width: 45,
                            allowBlank: false,
                            maxLength: 3
                        },
                        {xtype: 'displayfield', value: ')', margin: '0 5 0 2'},
                        {
                            fieldLabel: Bigmedia.Locales.checkoutFormPhoneNumberLabel,
                            //labelWidth: 100,
                            name: 'phoneNumber',
                            allowBlank: false,
                            maxLength: 8,
                            width: 150,
                            emptyText: 'xxxxxxx',
                            maskRe: /[\d\-]/,
                            regex: /^\d{7}$/,
                            regexText: Bigmedia.Locales.checkoutFormPhoneNumberRegexText
                        }
                        //{xtype: 'textfield',    fieldLabel: 'Phone 2', name: 'phone-2', width: 45, allowBlank: false, margin: '0 5 0 0', maxLength: 3},
                        //{xtype: 'displayfield', value: '-'},
                        //{xtype: 'textfield',    fieldLabel: 'Phone 3', name: 'phone-3', width: 60, allowBlank: false, margin: '0 0 0 5', maxLength: 4}
                    ]
                }]
            }, {
                    xtype: 'fieldset',
                    title: Bigmedia.Locales.checkoutFormPeriodTitle,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    defaults: {
                        format: 'd.m.Y',
                        minDate: new Date(Date.now() + 86400000),
                        maxDate: new Date(Date.now() + 86400000 * 365)
                    },
                    items: [
                        {
                            xtype: 'datefield',
                            reference: 'seldatebeg',
                            name: 'dateBeg',
                            flex: 1,
                            filedLabel: Bigmedia.Locales.dlgCustomPeriodFrom,
                            value: new Date(Date.now() + 86400000),
                            validator: function (val) {
                                // remove non-numeric characters
                                var valDate = Ext.Date.parse(val, this.format),
                                    errMsg = Bigmedia.Locales.dlgCustomPeriodBegErrMsg,
                                    other = this.up('form-checkout').lookupReference('seldateend');
                                // if the numeric value is not 10 digits return an error message
                                if (valDate && +valDate <= +other.getValue()) {
                                    other.clearInvalid();
                                    return true;
                                }
                                return errMsg;
                            }
                        }, {
                            xtype: 'datefield',
                            reference: 'seldateend',
                            name: 'dateEnd',
                            flex: 1,
                            filedLabel: Bigmedia.Locales.dlgCustomPeriodTo,
                            value: new Date(Date.now() + 86400000 * 31),
                            validator: function (val) {
                                // remove non-numeric characters
                                var valDate = Ext.Date.parse(val, this.format),
                                    errMsg = Bigmedia.Locales.dlgCustomPeriodEndErrMsg,
                                    other = this.up('form-checkout').lookupReference('seldatebeg');
                                // if the numeric value is not 10 digits return an error message
                                if (valDate && +valDate >= +other.getValue()) {
                                    other.clearInvalid();
                                    return true;
                                }
                                return errMsg;
                            }
                        }
                    ]
            }, {
                xtype: 'fieldset',
                title: Bigmedia.Locales.checkoutFormDescrTitle,
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'textareafield',
                    name: 'note',
                    fieldLabel: Bigmedia.Locales.checkoutFormNoteLabel,
                    emptyText: Bigmedia.Locales.checkoutFormNoteEmpty
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'button',
                        scale: 'large',
                        ui: 'gray',
                        iconAlign: 'left',
                        iconCls: 'x-fa fa-angle-left',
                        text: Bigmedia.Locales.checkoutFormBtnBackToCartText,
                        listeners: {
                            click: 'onBackToCartClick'
                        }
                    },{
                        xtype: 'button',
                        scale: 'large',
                        ui: 'gray',
                        iconAlign: 'left',
                        iconCls: 'x-fa fa-square-o',
                        text: Bigmedia.Locales.checkoutFormBtnClearFormText,
                        listeners:{
                            click: 'onResetClick'
                        }
                        //handler: this.onResetClick
                    },
                    {
                        flex: 1
                    },
                    {
                        xtype: 'button',
                        scale: 'large',
                        ui: 'soft-green',
                        iconAlign: 'left',
                        iconCls: 'x-fa fa-envelope',
                        text: Bigmedia.Locales.checkoutFormBtnSendText,
                        formBind: true,
                        listeners:{
                            click: 'onCompleteClick'
                        }
                        //handler: this.onCompleteClick
                    }
                ]

            }]


            //buttons: [{
            //    text: 'Reset',
            //    scope: this,
            //    handler: this.onResetClick
            //}, {
            //    text: 'Complete Purchase',
            //    width: 150,
            //    scope: this,
            //    handler: this.onCompleteClick
            //}]
        });
        this.callParent();
    }
    //,
    //
    //backToCart: function () {
    //    var win = this.up('checkoutdialog');
    //    win.close();
    //    window.location = '#cart';
    //}

});
