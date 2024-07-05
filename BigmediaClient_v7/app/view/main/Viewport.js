Ext.define('Bigmedia.view.main.Viewport', {
  extend: 'Ext.container.Viewport',
  xtype: 'mainviewport',

  requires: [
    'Ext.list.Tree',
    'Bigmedia.view.AppHeader',
    'Bigmedia.view.main.MainContainerWrap',
    "Bigmedia.view.dialog.DlgPoiCategories",
    "Bigmedia.view.dialog.DlgCustomPeriod",
    "Bigmedia.view.dialog.DlgFilterByNumber",
    "Bigmedia.view.dialog.DlgAutoPlan",
    'Bigmedia.view.grid.Proposals',
    'Bigmedia.view.main.ViewportController',
    'Bigmedia.view.main.ViewportModel'
  ],

  responsiveConfig: {

  },

  controller: 'mainviewport',
  viewModel: {
    type: 'mainviewport'
  },

  dlgPoiCat: null,
  dlgCustomPeriod: null,
  dlgFilterByNumber: null,
  // dlgAutoSelect: null,

  cls: 'sencha-dash-viewport',
  itemId: 'mainView',
  id: 'mainViewport',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  listeners: {
    render: 'onMainViewRender'
  },

  items: [
    {
      region: 'north',
      xtype: 'panel',
      id: 'app-header',
      reference: 'app-header',
      title: 'Bigmedia',
      header: false,
      height: 40,
      layout: {
        type: 'hbox',
        align: 'middle'
      },
      // cls: 'bigmedia-headerbar toolbar-btn-shadow',
      items: [
        {
          xtype: 'component',
          // id: 'app-header-logo',
          reference: 'senchaLogo',
          margin: '0 0 0 10',
          style: {
            background: 'center / contain no-repeat url(resources/images/bma.png)'
          },
          width: 100,
          height: 30
        }, {
          xtype: 'tbspacer',
          width: 20
        },
        {
          xtype: 'button',
          text: Bigmedia.Locales.appHeaderBtnMyCampaignsText,
          menu: [],
          handler: 'onMyCampaignsClick',
          arrowHandler: 'onMyCampaignsClick',
          bind: {
            hidden: '{showMonitoring}'
          }
        },
        // {
        //   xtype: 'button',
        //   text: Bigmedia.Locales.appHeaderBtnMonitoringText,
        //   handler: 'onMonitoringClick',
        //   bind: {
        //     hidden: '{user.showMonitoring != 1 || showMonitoring}'
        //   }
        // },
        // {
        //   xtype: 'button',
        //   text: Bigmedia.Locales.appHeaderBtnCampaignsText,
        //   handler: 'onMonitoringClick',
        //   bind: {
        //     hidden: '{!showMonitoring}'
        //   }
        // },
        {
          xtype: 'tbspacer',
          flex: 1
        },
        {//'Select language'
          xtype: 'button',
          iconCls: 'x-fa fa-globe',
          tooltip: 'Select language',
          menu: {
            plain: true,
            // width: 50,
            indent: false,
            minWidth: 50,
            items: [
              {
                text: Bigmedia.Locales.locales[0].full
              }, {
                text: Bigmedia.Locales.locales[1].full
              }, {
                text: Bigmedia.Locales.locales[2].full
              }
            ],
            listeners: {
              click: function (menu, item) {
                var query = Ext.Object.fromQueryString(location.search),
                  queryString;
                var l = Bigmedia.Locales.getLocaleByFull(item.text);

                if (!l) {
                  return;
                }

                query['locale'] = l.code;

                queryString = Ext.Object.toQueryString(query);
                location.search = queryString;
              }
            }
          },
          handler: function () {
            this.getMenu().show();
          },
          arrowHandler: function () {
            // alert('select campaign from tree list')
          }
        },
        {//User
          // cls: 'delete-focus-bg user-menu-btn', //x-btn-header
          // ui: 'user-menu',
          // iconCls: 'x-fa',
          // scale: 'large',
          xtype: 'splitbutton',
          // width: '45px',
          iconCls: 'user-icon',
          text: '',
          // margin: '0 10 0 0',
          // bind: {
          //     icon:
          //     {
          //         bindTo: '{user.pictureUrl}',
          //         deep: true
          //     }
          // },
          listeners: {
            click: 'onUserClick'
          },
          menu: {
            plain: true,
            items: [
              {
                text: Bigmedia.Locales.appHeaderBtnLoginText,
                bind: {
                  hidden: '{userLoggedIn}'
                },
                // handler: function (btn) {
                //     Bigmedia.app.showPage();
                // }
                href: '#auth.login',
                hrefTarget: '_self'
              }, {
                xtype: 'menuitem',
                bind: {
                  text: '{user.displayName}'
                },
                href: '#profile',
                hrefTarget: '_self'
              }, {
                text: Bigmedia.Locales.appHeaderBtnLogoutText,
                bind: {
                  hidden: '{!userLoggedIn}'
                },
                handler: function () { Bigmedia.Vars.logoutUser(); }
              }]
          }
        }
      ]
    }, {
      // xtype: 'maincontainerwrap',
      // id: 'main-view-detail-wrap',
      // reference: 'mainContainerWrap',
      // flex: 1,
      // region: 'center',
      // layout: 'fit',
      // items: [
      //     {
      xtype: 'container',
      region: 'center',
      flex: 1,
      reference: 'mainCardPanel',
      cls: 'sencha-dash-right-main-container',
      itemId: 'contentPanel',
      // layout: 'fit' - is not working because setActiveItem method
      layout: {
        type: 'card',
        anchor: '100%'
      },      
      // }
      // ]
    }
  ],

  constructor: function (config) {
    var me = this;
    me.callParent([config]);
    // me.dlgPoiCat = Ext.create('Bigmedia.view.dialog.DlgPoiCategories',{
    //     reference: 'dlgPoiCat'
    // });
    // me.dlgCustomPeriod = Ext.create('Bigmedia.view.dialog.DlgCustomPeriod',{
    //     reference: 'dlgCustomPeriod'
    // });
    // me.dlgFilterByNumber = Ext.create('Bigmedia.view.dialog.DlgFilterByNumber',{
    //     reference: 'dlgFilterByNumber'
    // });
    // me.dlgAutoSelect = Ext.create('Bigmedia.view.autoselectfaces.DlgAutoSelectFaces',{
    //     reference: 'dlgAutoSelect'
    // });
  }
});
