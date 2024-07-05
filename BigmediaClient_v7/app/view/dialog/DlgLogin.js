Ext.define('Bigmedia.view.dialog.DlgLogin', {
    extend: "Ext.window.Window",
    xtype: 'dialog-login',

    requires: [
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button',
        'Bigmedia.lib.AdvancedVType'
    ],

    viewModel: {
        data: {
            username: null,
            password: null,
            isSignup: false
        }
    },

    title: Bigmedia.Locales.dlgLoginTitle,
    frame: true,
    width: 320,
    closable: true,
    bodyPadding: 10,

    items: [
        {
            xtype: 'form',
            defaultType: 'textfield',
            items: [{
                allowBlank: false,
                fieldLabel: Bigmedia.Locales.fieldLoginLabel,
                name: 'username',
                bind: {
                    value: '{username}'
                },
                maskRe: /[\d\.@a-zA-Z\_]/i,
                invalidText: Bigmedia.Locales.dlgRegisterLoginErrMsg,
                emptyText: 'login'
            }, {
                allowBlank: false,
                fieldLabel: Bigmedia.Locales.fieldPasswordLabel,
                name: 'password',
                itemId: 'password',
                bind: {
                    value: '{password}'
                },
                emptyText: 'password',
                inputType: 'password'
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
                        if (model.get('isSignup')) {
                            url = '/api/v1/auth/local/signup';
                        } else {
                            url = '/api/v1/auth/local/login';
                        }
                        Ext.Ajax.request({
                            url: url,
                            params: {
                                username: model.get('username'),
                                password: model.get('password')
                            },
                            success: function (response) {
                                Bigmedia.Vars.loadUser();
                                Ext.toast(Bigmedia.Locales.dlgLoginSuccessToastText);
                                dlg.close();
                            },
                            failure: function () {
                                var msg;
                                if (model.get('isSignup')) {
                                    msg = Bigmedia.Locales.dlgLoginErrorIsSignupAlertMsg;
                                } else {
                                    msg = Bigmedia.Locales.dlgLoginErrorAlertMsg;
                                }
                                Ext.Msg.alert(Bigmedia.Locales.dlgLoginErrorAlertTitle, msg);
                            }
                        });
                    }
                }
            ],

            defaults: {
                anchor: '100%',
                labelWidth: 120
            }
        }
    ]

});
