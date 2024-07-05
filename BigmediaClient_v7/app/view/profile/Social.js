Ext.define('Bigmedia.view.profile.Social', {
    extend: 'Ext.panel.Panel',
    xtype: 'profilesocialpanel',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.layout.container.VBox',
        'Bigmedia.view.dialog.DlgLogin',
        'Bigmedia.view.dialog.DlgLoginCreate',
        'Bigmedia.view.dialog.DlgChangePassword'
    ],

    height: 300,
    bodyPadding: 10,

    layout: {
        type: 'vbox',
        align: 'middle'
    },

    cls: 'social-panel shadow-panel',

    items: [
        {
            xtype: 'image',
            cls: 'userProfilePic',
            height: 120,
            width: 120,
            alt: 'profile-picture',
            bind: {
                src: '{user.pictureUrl}'
            }
        },
        {
            xtype: 'component',
            cls: 'userProfileName',
            height: '',
            bind: {
                html: '{user.displayName}'
            }
        },
        {
            xtype: 'component',
            cls: 'userProfileDesc',
            bind: {
                html: '{user.orgName}'
            }
        },
        {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                xtype: 'button',
                margin: 5
            },
            margin: 5,
            items: [
                {
                    ui: 'blue',
                    iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.profileAddFacebookBtnText,
                    bind: {
                        hidden: '{user.hasFacebookAccount}'
                    },
                    handler: function(btn) {
                        Bigmedia.lib.provider.Facebook.login();
                    }
                }, {
                    ui: 'green',
                    // iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.profileAddLocalBtnText,
                    bind: {
                        hidden: '{user.hasLocalAccount}'
                    },
                    handler: function(btn) {
                        var dlg = Ext.create('Bigmedia.view.dialog.DlgLogin',{
                            modal: true,
                            viewModel: {
                                data: {
                                    username: null,
                                    password: null,
                                    isSignup: false
                                }
                            }
                        });
                        dlg.show();
                    }
                }, {
                    ui: 'green',
                    // iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.profileCreateLocalBtnText,
                    bind: {
                        hidden: '{user.hasLocalAccount}'
                    },
                    handler: function(btn) {
                        var dlg = Ext.create('Bigmedia.view.dialog.DlgLoginCreate',{
                            modal: true
                        });
                        dlg.show();
                    }
                }, {
                    ui: 'blue',
                    iconCls: 'x-fa fa-facebook',
                    text: Bigmedia.Locales.profileRemoveFacebookBtnText,
                    bind: {
                        hidden: '{!user.hasFacebookAccount || !user.hasLocalAccount}',
                        disabled: '{!user.hasLocalAccount}'
                    },
                    handler: function(btn) {
                        Bigmedia.lib.provider.Facebook.removeToken();
                    }
                },
                {
                    ui: 'green',
                    width: 220,
                    text: Bigmedia.Locales.profileChangePasswordBtnText,
                    bind: {
                        hidden: '{!user.hasLocalAccount}'
                    },
                    handler: function(btn) {
                        var dlg = Ext.create('Bigmedia.view.dialog.DlgChangePassword',{
                            modal: true
                        });
                        dlg.show();
                    }
                }
            ]
        }
    ]
});
