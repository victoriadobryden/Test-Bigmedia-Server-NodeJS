Ext.define('Bigmedia.view.authentication.LoginByCode', {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    xtype: 'loginbycode',

    requires: [
        'Bigmedia.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    title: Bigmedia.Locales.authLoginByCodeTitle,
    closable: true,

    defaultFocus : 'authdialog',  // Focus the Auth Form to force field focus as well

    items: [
        {
            xtype: 'authdialog',
            width: 455,
            defaultButton: 'loginByCodeBtn',
            autoComplete: true,
            bodyPadding: '20 20',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            defaults : {
                margin: '10 0'
            },

            cls: 'auth-dialog-login',
            items: [
                {
                    xtype: 'label',
                    cls: 'lock-screen-top-label',
                    text: Bigmedia.Locales.authLoginByCodeEnterCodeLabel
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    reference: 'inputcode',
                    height: 55,
                    name: 'code',
                    bind: {
                        value: '{reset.code}'
                    },
                    hideLabel: true,
                    allowBlank: false,
                    emptyText: Bigmedia.Locales.authLoginByCodeEnterCodeEmptyText,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-email-trigger'
                        }
                    }
                },
                {
                    xtype: 'button',
                    reference: 'loginByCodeBtn',
                    scale: 'large',
                    ui: 'soft-blue',
                    formBind: true,
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: Bigmedia.Locales.authLoginFormLoginBtnText,
                    listeners: {
                        click: 'onLoginByCodeClick'
                    }
                }
                // ,
                // {
                //     xtype: 'button',
                //     cls: 'link-text',
                //     text: 'Back to Log In',
                //     handler: function () {
                //         Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.login');
                //     }
                // }
            ]
        }
    ]
});
