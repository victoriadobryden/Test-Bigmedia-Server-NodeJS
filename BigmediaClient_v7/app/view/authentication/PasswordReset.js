Ext.define('Bigmedia.view.authentication.PasswordReset', {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    xtype: 'passwordreset',

    requires: [
        'Bigmedia.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    title: Bigmedia.Locales.authResetPasswordFormTitle,
    closable: true,

    defaultFocus : 'authdialog',  // Focus the Auth Form to force field focus as well

    items: [
        {
            xtype: 'authdialog',
            width: 455,
            defaultButton: 'resetPassword',
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
                    text: Bigmedia.Locales.authResetPasswordEmailLabel
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    height: 55,
                    name: 'email',
                    bind: {
                        value: '{reset.email}'
                    },
                    hideLabel: true,
                    allowBlank: false,
                    emptyText: 'user@example.com',
                    vtype: 'email',
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-email-trigger'
                        }
                    }
                },
                {
                    xtype: 'button',
                    reference: 'resetPassword',
                    scale: 'large',
                    ui: 'soft-blue',
                    formBind: true,
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: Bigmedia.Locales.authResetPasswordFormResetBtnText,
                    listeners: {
                        click: 'onResetClick'
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
