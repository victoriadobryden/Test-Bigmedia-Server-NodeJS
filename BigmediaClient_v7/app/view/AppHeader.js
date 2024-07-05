Ext.define("Bigmedia.view.AppHeader", {
    extend: "Ext.panel.Panel",

    requires: [
        // "Bigmedia.view.AppHeaderController",
        "Bigmedia.view.AppHeaderModel",
        "Bigmedia.Locales",
        "Bigmedia.view.authentication.AuthenticationModel"
    ],

    controller: "appheader",
    // viewModel: {
    //     type: "appheader"
    // },
    // viewModel: {
    //   type: "authentication"
    // },

    xtype: 'appHeader',
    title: 'Bigmedia',
    header: false,
    id: 'app-header',
    height: 52,
    layout: {
        type: 'hbox',
        align: 'middle'
    },
    cls: 'bigmedia-headerbar toolbar-btn-shadow',

    items: [{
        xtype: 'component',
        id: 'app-header-logo',
        reference: 'senchaLogo'
    }, {
        cls: 'delete-focus-bg', //x-btn-header
        ui: 'faces',
        reference: 'autoSelectBtn',
        id: 'headerautoselect',
        scale: 'large',
        //iconCls: 'pictos pictos-cart',
        iconCls: 'x-fa fa-magic',
        tooltip: 'Auto select',
        text: 'Автоподбор',
        html: '<div class="autoselectbadge">NEW</div>',
        //text: '<span class="cart-badge">15</span>',
        //xtype: 'button',
        xtype: 'button',
        // enableToggle: true,
        margin: '0 10 0 0',
        listeners: {
            // beforetoggle: 'onBeforeFacesToggle'
            click: 'onAutoSelectClick'
        }
    }, {
        xtype: 'tbspacer',
        flex: 1
    }, {
        cls: 'delete-focus-bg', //x-btn-header
        ui: 'faces',
        reference: 'facesBtn',
        id: 'headerfaces',
        scale: 'large',
        //iconCls: 'pictos pictos-cart',
        iconCls: 'x-fa fa-desktop',
        tooltip: 'Faces',
        text: Bigmedia.Locales.appHeaderBtnFacesText,
        //text: '<span class="cart-badge">15</span>',
        //xtype: 'button',
        xtype: 'button',
        // enableToggle: true,
        toggleGroup: 'mainNavGroup',
        allowDepress: false,
        pressed: true,
        margin: '0 10 0 0',
        listeners: {
            // beforetoggle: 'onBeforeFacesToggle'
            click: 'onFacesClick'
        }
        // handler: function () {
        //     this.getController().redirectTo("faces");
        // },
    }, 
    {//campaignsBtn
         cls: 'delete-focus-bg', //x-btn-header
         ui: 'campaigns',
         reference: 'campaignsBtn',
         id: 'headercampaigns',
         scale: 'large',
         //iconCls: 'pictos pictos-cart',
         iconCls: 'x-fa fa-briefcase',
         tooltip: 'Campaigns',
         text: Bigmedia.Locales.appHeaderBtnCampaignsText,
         xtype: 'button',
         toggleGroup: 'mainNavGroup',
         allowDepress: false,
         margin: '0 10 0 0',
         listeners: {
             click: 'onCampaignsClick'
         }
    },
    {//monitoringBtn
        cls: 'delete-focus-bg', //x-btn-header
        ui: 'monitoring',
        reference: 'monitoringBtn',
        id: 'headermonitoring',
        scale: 'large',
        //iconCls: 'pictos pictos-cart',
        iconCls: 'x-fa fa-briefcase',
        tooltip: 'Monitoring',
        text: Bigmedia.Locales.appHeaderBtnMonitoringText,
        xtype: 'button',
        toggleGroup: 'mainNavGroup',
        allowDepress: false,
        margin: '0 20 0 0',
        listeners: {
             click: 'onMonitoringClick'
        }
    },
    
    {
        xtype: 'tbspacer',
        width: '100px'
    },
    {
        cls: 'delete-focus-bg', //x-btn-header
        ui: 'shopping-cart',
        reference: 'shoppingcartlarge',
        id: 'headercart',
        scale: 'large',
        disabled: true,
        //iconCls: 'pictos pictos-cart',
        iconCls: 'x-fa fa-shopping-cart',
        tooltip: Bigmedia.Locales.headerShoppingCartEmpty,
        //text: '<span class="cart-badge">15</span>',
        //xtype: 'button',
        xtype: 'splitbutton',
        margin: '0 10 0 0',
        handler: function () {
            window.location = "#cart";
        },
        menu: {
            items: [{
                text: Bigmedia.Locales.headerShoppingCartMenuShowText,
                href: '#cart',
                hrefTarget: '_self'
            }, {
                text: Bigmedia.Locales.headerShoppingCartMenuEmptyText,
                handler: 'emptyCart'
            }]
        }
    },
    { //headerSelectLocale
        xtype: 'combobox',
        id: 'app-header-locale',
        cls: 'app-header-text',
        fieldLabel: Bigmedia.Locales.headerSelectLocale,
        store: {
            fields: ['code', 'name'],
            data: [
                { "code": "ukr", "name": Bigmedia.Locales.localeUkr },
                { "code": "ru", "name": Bigmedia.Locales.localeRu },
                { "code": "en", "name": Bigmedia.Locales.localeEn }
            ]
        },
        displayField: "name",
        valueField: "code",
        value: Bigmedia.Locales.currentLocale,
        listeners: {
            change: 'onSelectLocale'
        },
        margin: '0 10 0 0'
    },
    {
        xtype: 'image',
        cls: 'header-right-profile-image',
        height: 35,
        width: 35,
        //  autoEl: {
        //      tag: 'div',
        //     //  height: 35,
        //     //  width: 35,
        //      href: '#profile'
        //  },
        alt: 'current user image',
        bind: {
            src: {
                bindTo: '{curUser.pictureUrl}',
                deep: true
            }
        },
        margin: '0',
        scale: 'large'
        //src: '/resources/anonymous-icon.png'
    },
    {
        cls: 'delete-focus-bg', //x-btn-header
        ui: 'user-menu',
        iconCls: 'x-fa',
        scale: 'large',
        // disabled: true,
        xtype: 'splitbutton',
        text: '',
        menu: {
            items: [
                {
                    text: 'Login',
                    bind: {
                        hidden: '{curUser.id}'
                    },
                    // href: '#auth.login',
                    // hrefTarget: '_self',
                    handler: function (btn) {
                        Bigmedia.showPage();
                    }
                }, {
                    // text:{
                    //     bindTo: '{currentUser.fullName}',
                    //     deep: true
                    // },
                    xtype: 'menuitem',
                    bind: {
                        text: '{curUser.displayName}'
                    },
                    href: '#profile',
                    hrefTarget: '_self'
                }, {
                    text: 'Logout',
                    bind: {
                        hidden: '{!curUser.id}'
                    },
                    handler: function () { Bigmedia.Vars.logoutUser(); }
                }]
        },
        margin: '0 10 0 0'
    }
    ]
});
