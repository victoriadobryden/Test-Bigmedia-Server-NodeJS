/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Bigmedia.Application', {
    extend: 'Ext.app.Application',
    namespace: 'Bigmedia',

    name: 'Bigmedia',

    // controllers: [
    //     'User@Bigmedia.controller'
    // ],

    stores: [
        // TODO: add global / shared stores here
        'Cities',
        // 'Advertisers',
        'CityBoundaries',
        'Sizes',
        'Networks',
        'Sidetypes',
        'FacesInfo',
        'PoiCategories',
        'PoiCategoriesTree',
        'Catabs',
        // 'Faces',
        'Sides',
        'ShoppingCart',
        'NavigationTree',
        'ThirdPartyBoards',
        'RulesGroups',
        'DiscountTypes',
        'MarginTypes',
        'MarginRoundTypes',
        'Suppliers',
        'Pois',
        'PoisManual',
        'UserIcons',
        // 'Campaigns',
        'LocalCampaigns',
        'GoogleMapSearchHistory',
        'FormatsTree',
        'LinkPoiRulesTree',
        'KSParamsTree',
        'OTSParamsTree',
        'OTSParamsTreeClient',
        'KSPolygons',
        'CityPolygon',
        'KSStreets',
	'DataMonitoring'
    ],

    views: ['Bigmedia.view.main.Viewport', "Bigmedia.view.authentication.ShoppingCart"],

    requires: [
        //'Ext.app.*',
        'Ext.ux.statusbar.StatusBar',
        'Bigmedia.*',
        'Bigmedia.Locales',
        'Bigmedia.lib.provider.Facebook',
        'Bigmedia.Vars',
        'Bigmedia.AutoPlan',
        'Bigmedia.store.MarginTypes',
        'Bigmedia.store.MarginRoundTypes'
    ],

    // defaultToken: 'faces',

    mainView: "Bigmedia.view.main.Viewport",

    constructor: function (config) {
      Bigmedia.localStorageStateProvider = new Ext.state.LocalStorageProvider({prefix: 'bma-state-'});
      Ext.state.Manager.setProvider(
        Bigmedia.localStorageStateProvider
      );
      this.callParent();
      this.initConfig(config);
      Bigmedia.appVersion = '2.0.2';
    },

    launch : function() {

        myDateFormatter = function (date) {
            // console.log(date);
            return Ext.Date.utc(date.getFullYear(), date.getMonth(), date.getDate());
        }
        Ext.Date.formatFunctions['utc-date'] = myDateFormatter;
        Ext.util.Format.currencySign = '\u20b4';
        Ext.ariaWarn = Ext.emptyFn;
        var me = this;
        me.appready = false;

        // Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
        // me.session = new Ext.data.Session({
        //     autoDestroy: false
        // });
        Bigmedia.Vars.on('userchanged', me.onUser, me);
        // Bigmedia.Vars.on('userchanged', ()=>{
        //   var campStore = Ext.getStore('Campaigns');
        //   if (!campStore.isLoaded()) {
        //     campStore.on('load',)
        //   }
        //   Ext.getStore('Campaigns').add({});
        // }, {single: true});
        Bigmedia.Vars.loadUser();
    },

    initCurrentCampaign: function () {
      var me = this;
      // me.getMainView().
    },

    onUser : function(user) {
        var me = this;
        me.appready = true;
        me.fireEvent('appready', me, user);
    },

    showPage: function (hashTag) {
        var me = this;
        if (me.appready) {
            me.getMainView().getController().showPage(hashTag);
            // Ext.ComponentQuery.query('mainviewport')[0].getController().showPage(hashTag);
        } else {
            me.on(
                'appready',
                Ext.Function.bind(me.showPage, me, [hashTag]),
                me,
                { single : true }
            );
        }
    }
});
