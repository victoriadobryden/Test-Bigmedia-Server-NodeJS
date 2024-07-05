Ext.define('Bigmedia.view.dialog.DlgChangePassword', {
    extend: "Ext.window.Window",
    xtype: 'dialog-changepassword',

    requires: [
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button',
        'Bigmedia.lib.AdvancedVType'
    ],

    viewModel: {
        data: {
            password: null
        }
    },

    title: Bigmedia.Locales.dlgChangePasswordTitle,
    frame: true,
    width: 320,
    closable: true,
    bodyPadding: 10,

    items: [{
        xtype: 'form',
        defaultType: 'textfield',
        items: [{
            allowBlank: false,
            fieldLabel: Bigmedia.Locales.fieldPasswordLabel,
            name: 'password',
            itemId: 'password',
            bind: {
                value: '{password}'
            },
            emptyText: 'password',
            inputType: 'password',
            listeners: {
                validitychange: function (field) {
                    field.next().validate();
                },
                blur: function (field) {
                    field.next().validate();
                }
            }
        }, {
            allowBlank: false,
            fieldLabel: Bigmedia.Locales.fieldConfirmPasswordLabel,
            name: 'confirmpassword',
            initialPassField: 'password',
            emptyText: 'password',
            inputType: 'password',
            vtype: 'password'
        }],

        buttons: [
            {
                text: Bigmedia.Locales.btnCancelText,
                handler: function (btn) {
                    var dlg = btn.up('window');
                    dlg.close();
                }
            }, {
                text: Bigmedia.Locales.btnSaveText,
                formBind: true,
                handler: function (btn) {
                    var dlg = btn.up('window'),
                    model = dlg.getViewModel(),
                    url;
                    url = '/api/v1/auth/password';
                    Ext.Ajax.request({
                        url: url,
                        method: 'PUT',
                        params: {
                            password: model.get('password')
                        },
                        success: function (response) {
                            Bigmedia.Vars.loadUser();
                            Ext.toast(Bigmedia.Locales.dlgChangePasswordSuccessToastText);
                            dlg.close();
                        },
                        failure: function () {
                            var msg;
                            msg = Bigmedia.Locales.dlgChangePasswordErrorAlertMsg;
                            Ext.Msg.alert(Bigmedia.Locales.dlgChangePasswordErrorAlertTitle, msg);
                        }
                    });
                }
            }
        ],

        defaults: {
            anchor: '100%',
            labelWidth: 120
        }
    }]

});
