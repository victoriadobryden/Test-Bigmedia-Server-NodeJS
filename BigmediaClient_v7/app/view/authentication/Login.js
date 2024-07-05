Ext.define('Bigmedia.view.authentication.Login', {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    xtype: 'loginform',

    requires: [
        'Bigmedia.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button'
    ],

    title: Bigmedia.Locales.authLoginFormTitle,
    defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well
    closable: true,

    items: [
        {
            xtype: 'authdialog',
            defaultButton : 'loginButton',
            autoComplete: true,
            bodyPadding: '20 20',
            cls: 'auth-dialog-login',
            header: false,
            width: 415,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            defaults : {
                margin : '5 0'
            },

            items: [
                {
                    xtype: 'label',
                    text: Bigmedia.Locales.authLoginFormSignToAccountText
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    name: 'username',
                    bind: '{username}',
                    // height: 55,
                    hideLabel: true,
                    allowBlank : false,
                    emptyText: Bigmedia.Locales.authLoginFormLoginEmptyText,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-email-trigger'
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    // height: 55,
                    hideLabel: true,
                    emptyText: Bigmedia.Locales.authLoginFormPasswordEmptyText,
                    inputType: 'password',
                    name: 'password',
                    bind: '{password}',
                    allowBlank : false,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-password-trigger'
                        }
                    }
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'checkboxfield',
                            flex : 1,
                            cls: 'form-panel-font-color rememberMeCheckbox',
                            height: 30,
                            bind: '{rememberMe}',
                            boxLabel: Bigmedia.Locales.authLoginFormRememberMeLabel
                        },
                        {
                            xtype: 'button',
                            cls: 'link-text',
                            text: Bigmedia.Locales.authLoginFormForgotPasswordText,
                            // html: '<a class="link-forgot-password"> Forgot Password ?</a>', //href="#auth.reset"
                            handler: function () {
                                Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.reset');
                            }
                        }
                    ]
                },
                        // {
                        //     xtype: 'component',
                        //     html: '<iframe id="submitTarget" name="submitTarget" style="display:none"></iframe>'
                        // },
                        {
                            xtype: 'component',
                            html: '<input type="submit" id="submitButton" style="display:none">'
                        },
                {
                    xtype: 'button',
                    reference: 'loginButton',
                    scale: 'large',
                    ui: 'soft-green',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: Bigmedia.Locales.authLoginFormLoginBtnText,
                    formBind: true,
                    listeners: {
                        click: 'onLoginButton'
                    }
                },
                {
                    xtype: 'box',
                    html: '<div class="outer-div"><div class="separator">' + Bigmedia.Locales.authFormFieldSeparatorOR + '</div></div>',
                    margin: '10 0'
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'soft-blue',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.authLoginFormFacebookBtnText,
                    listeners: {
                        click: 'onFaceBookLogin'
                    }
                },
                {
                    xtype: 'box',
                    html: '<div class="outer-div"><div class="separator">' + Bigmedia.Locales.authFormFieldSeparatorOR + '</div></div>',
                    margin: '10 0'
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'gray',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-user-plus',
                    text: Bigmedia.Locales.authLoginFormSignupBtnText,
                    listeners: {
                        click: 'onNewAccount'
                    }
                }
            ]
        }
    ],

    // listeners: {
    //     close: function ( win ){
    //         mainView = Ext.ComponentQuery.query('mainviewport');
    //         if (mainView) {
    //             mainView = mainView[0];
    //         }
    //         if (mainView && mainView.getViewModel().get('beforeLoginRouteId')) {
    //             mainView.getController().redirectTo(mainView.getViewModel().get('beforeLoginRouteId'));
    //         } else {
    //             mainView.redirectTo('faces');
    //         }
    //         // Ext.util.History.back();
    //     }
    // },

    initComponent: function() {
        this.addCls('user-login-register-container');
        this.callParent(arguments);
    }
});
