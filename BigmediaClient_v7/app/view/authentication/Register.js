Ext.define('Bigmedia.view.authentication.Register', {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    xtype: 'authregister',

    requires: [
        'Bigmedia.view.authentication.Dialog',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button',
        'Bigmedia.lib.AdvancedVType'
    ],

    title: Bigmedia.Locales.authRegisterFormTitle,
    defaultFocus: 'authdialog',  // Focus the Auth Form to force field focus as well
    closable: true,


    items: [
        {
            xtype: 'authdialog',
            bodyPadding: '20 20',
            width: 455,
            reference : 'authDialog',
            referenceHolder: true,

            defaultButton : 'submitButton',
            autoComplete: true,
            cls: 'auth-dialog',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults : {
                margin: '10 0',
                selectOnFocus : true
            },
            items: [
                {
                    xtype: 'label',
                    cls: 'lock-screen-top-label',
                    text: Bigmedia.Locales.authRegisterFormCreateAccountLabel
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    // height: 55,
                    hideLabel: true,
                    allowBlank : false,
                    emptyText: Bigmedia.Locales.authRegisterFormFullnameEmptyText,
                    name: 'fullName',
                    bind: '{signup.fullName}',
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
                    allowBlank : false,
                    emptyText: Bigmedia.Locales.authRegisterFormOrgNameEmptyText,
                    name: 'orgName',
                    bind: '{signup.orgName}',
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
                    allowBlank : false,
                    name: 'userid',
                    bind: '{signup.username}',
                    maskRe: /[\d\.@a-zA-Z\_]/i,
                    invalidText: Bigmedia.Locales.dlgRegisterLoginErrMsg,
                    emptyText: Bigmedia.Locales.authRegisterFormLoginEmptyText,
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
                    allowBlank : false,
                    name: 'email',
                    emptyText: 'user@example.com',
                    vtype: 'email',
                    bind: '{signup.email}',
                    allowBlank : false,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-envelope-trigger'
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    // height: 55,
                    hideLabel: true,
                    emptyText: Bigmedia.Locales.authRegisterFormPasswordEmptyText,
                    reference: 'password',
                    itemId: 'password',
                    name: 'password',
                    inputType: 'password',
                    bind: '{signup.password}',
                    allowBlank : false,
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-password-trigger'
                        }
                    },
                    listeners: {
                        validitychange: 'validatePwd',
                        blur: 'validatePwd'
                    }
                    // validator: function (val) {
                    //     var errMsg = Bigmedia.Locales.dlgRegisterPasswordsErrMsg,
                    //         other = this.up('authdialog').lookupReference('confirmpassword');
                    //     if (val.length < 4) {
                    //         return Bigmedia.Locales.dlgRegisterPasswordLengthErrMsg;
                    //     }
                    //     if (val && val === other.getValue()) {
                    //         other.clearInvalid();
                    //         return true;
                    //     }
                    //     return errMsg;
                    // }
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    // height: 55,
                    hideLabel: true,
                    allowBlank : false,
                    emptyText: Bigmedia.Locales.authRegisterFormConfirmPasswordEmptyText,
                    reference: 'confirmpassword',
                    name: 'confirmpassword',
                    inputType: 'password',
                    initialPassField: 'password',
                    vtype: 'password',
                    // bind: '{signup.confirmpassword}',
                    triggers: {
                        glyphed: {
                            cls: 'trigger-glyph-noop auth-password-trigger'
                        }
                    }
                    // ,
                    // validator: function (val) {
                    //     var errMsg = Bigmedia.Locales.dlgRegisterPasswordsErrMsg,
                    //         other = this.up('authdialog').lookupReference('password');
                    //     if (val && val === other.getValue()) {
                    //         other.clearInvalid();
                    //         return true;
                    //     }
                    //     return errMsg;
                    // }
                },
                {
                    xtype: 'checkbox',
                    flex: 1,
                    name: 'agrees',
                    cls: 'form-panel-font-color rememberMeCheckbox',
                    height: 32,
                    bind: '{signup.agrees}',
                    allowBlank : false,
                    boxLabel: Bigmedia.Locales.dlgRegisterAgreeBoxMsg,

                    // In this case, the form operation is not VALID unless Terms are agreed upon
                    isValid: function() {
                        var me = this;
                        return me.checked || me.disabled;
                    }
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'soft-blue',
                    formBind: true,
                    reference: 'submitButton',
                    bind: false,
                    margin: '5 0',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: Bigmedia.Locales.authRegisterFormSignupBtnText,
                    listeners: {
                        click: 'onSignupClick'
                    }
                },
                {
                    xtype: 'box',
                    html: '<div class="outer-div"><div class="separator">' + Bigmedia.Locales.authFormFieldSeparatorOR + '</div></div>'
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    ui: 'soft-blue',
                    margin: '5 0',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.authLoginFormFacebookBtnText,
                    listeners: {
                        click: 'onFaceBookLogin'
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
