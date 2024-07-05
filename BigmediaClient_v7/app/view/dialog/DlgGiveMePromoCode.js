Ext.define("Bigmedia.view.dialog.DlgGiveMePromoCode", {
    extend: "Ext.window.Window",

    closable: true,
    closeAction: 'destroy',

    title: Bigmedia.Locales.dlgGiveMePromoCode.title,
    width: 400,
    height: 500,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: false,
    modal: true,
    defaultFocus: 'name',
    closeAction: 'hide',
    referenceHolder: true,

    viewModel: {
        data: {
            userName: null,
            userEmail: null,
            userOrganization: null
        }
    },

    items: [
        {
            xtype: 'form',
            reference: 'windowForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            bodyPadding: 10,

            url: 'api/v1/givemepromocode',
            method: 'POST',
            jsonSubmit: true,

            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelWidth: 100,
                labelStyle: 'font-weight:bold'
            },

            items: [
                {
                    xtype: 'component',
                    margin: '5 5 10 5',
                    html: Bigmedia.Locales.dlgGiveMePromoCode.descrText
                },
                {
                    xtype: 'textfield',
                    name: 'name',
                    itemId: 'name',
                    bind: {
                        value: '{userName}'
                    },
                    afterLabelTextTpl: [
                        '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>'
                    ],
                    fieldLabel: Bigmedia.Locales.dlgGiveMePromoCode.nameLabel,
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: Bigmedia.Locales.dlgGiveMePromoCode.emailLabel,
                    name: 'email',
                    bind: {
                        value: '{userEmail}'
                    },
                    afterLabelTextTpl: [
                        '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>'
                    ],
                    vtype: 'email',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    name: 'organization',
                    bind: {
                        value: '{userOrganization}'
                    },
                    fieldLabel: Bigmedia.Locales.dlgGiveMePromoCode.orgLabel,
                    allowBlank: true
                }, {
                    xtype: 'textareafield',
                    fieldLabel: Bigmedia.Locales.dlgGiveMePromoCode.messageLabel,
                    name: 'message',
                    labelAlign: 'top',
                    flex: 1,
                    margin: '0',
                    allowBlank: true
                }
            ],

            buttons: [{
                text: Bigmedia.Locales.btnCancelText,
                handler: function (btn) {
                    btn.up('window').close();
                }
            }, {
                text: Bigmedia.Locales.btnSendText,
                handler: function (btn) {
                    var formPanel = btn.up('window').lookupReference('windowForm'),
                        form = formPanel.getForm();

                    if (form.isValid()) {
                        form.submit({
                            success: function(form, action) {
                                Ext.Msg.alert(Bigmedia.Locales.dlgGiveMePromoCode.successTitle,
                                Bigmedia.Locales.dlgGiveMePromoCode.successText);
                            },
                            failure: function(form, action) {
                                switch (action.failureType) {
                                    case Ext.form.action.Action.CLIENT_INVALID:
                                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                        break;
                                    case Ext.form.action.Action.CONNECT_FAILURE:
                                        Ext.Msg.alert('Failure', 'Ajax communication failed');
                                        break;
                                    case Ext.form.action.Action.SERVER_INVALID:
                                       Ext.Msg.alert('Failure', action.result.msg);
                               }
                            }
                        });
                        btn.up('window').close();
                    }
                }
            }]
        }
    ]
});
