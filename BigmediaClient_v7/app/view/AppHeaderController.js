Ext.define('Bigmedia.view.AppHeaderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.appheader',

    requires: [
        'Ext.window.MessageBox'
    ],

    listen: {
        store: {
            '#ShoppingCart': {
                add: 'onShoppingCartChange',
                remove: 'onShoppingCartChange',
                clear: 'onShoppingCartChange'
            }
        }
    },

    onAutoSelectClick: function (btn) {
        this.redirectTo('autoselect');
    },

    // init: function(view) {
    //     this.getViewModel().bind('{currentUser.picture}', function(src){
    //         console.log(src);
    //     });
    // },

    onCampaignsClick: function ( btn ) {
        console.log('campaigns',btn)
        this.redirectTo('campaigns');
    },
    onMonitoringClick: function ( btn ) {
        console.log('monitoring',btn)
        this.redirectTo('monitoring');
    },
    onFacesClick: function ( btn ) {
        this.redirectTo('faces');
    },

    onBeforeCampaignsToggle: function ( btn, pressed ) {
        this.redirectTo('campaigns');
        return window.location.hash = '#campaigns';
    },

    onBeforeFacesToggle: function ( btn, pressed ) {
        this.redirectTo('faces');
        return true;
    },

    onBeforeMonitoringToggle: function ( btn, pressed ) {
        console.log( 'onBeforeMonitoringToggle', btn, pressed )
        this.redirectTo('monitoring');
        // return true;
        return window.location.hash = '#monitoring';
    },
    emptyCart: function () {
        var me = this,
            facesStore = Ext.getStore('Faces'),
            cartStore = Ext.getStore('ShoppingCart'),
            btn = Ext.getCmp('headercart');

        Ext.MessageBox.show({
            msg: Bigmedia.Locales.cartPrepareItemsRemoveFromCartMsg,
            progressText: Bigmedia.Locales.cartPrepareItemsRemoveProgressText,
            width: 300,
            wait: {
                interval: 200
            },
            animateTarget: btn
        });

        me.timer = Ext.defer(function () {
            //new version in cart filter
            //facesStore.beginUpdate();
            //facesStore.suspendEvents(true);
            //facesStore.removeFilter('filter_in_cart');
            //var ix;
            //while((ix = facesStore.find('inCart',true)) >= 0){
            //    var facesRec = facesStore.getAt(ix);
            //    facesRec.set({inCart: false}, {dirty: false});
            //}
            //var fltr = new Ext.util.Filter({
            //    property: 'inCart',
            //    id: 'filter_in_cart',
            //    operator: '!=',
            //    value: true
            //});
            //facesStore.addFilter(fltr);
            //facesStore.resumeEvents();
            //facesStore.endUpdate();
            var fRec;
            cartStore.each(function(rec){
                fRec = facesStore.getById(rec.getId());
                if (fRec) {
                    fRec.set({inCart: false, selected: false}, {silent: true});
                }
            });
            cartStore.removeAll();
            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast(Bigmedia.Locales.cartRemoveItemsToastText);
        }, 500);
    },

    onShoppingCartChange: function (store) {
        var me = this,
            btn = me.lookupReference('shoppingcartlarge'),
            count = store.getCount();
        btn.setDisabled(count === 0);
        if(count === 0){
            btn.setText('');
            btn.setTooltip(Bigmedia.Locales.headerShoppingCartEmpty);
        } else {
            btn.setText('<span class="cart-badge">' + count + '</span>');
            btn.setTooltip(Ext.String.format(Bigmedia.Locales.headerShoppingCartNotEmpty,count));
        }
    },

    onSelectLocale: function (combo, newLocale) {
        var query = Ext.Object.fromQueryString(location.search),
            queryString;

        query['locale'] = newLocale;

        queryString = Ext.Object.toQueryString(query);
        location.search = queryString;
    },

    showToast: function (s, title) {
        Ext.toast({
            html: s,
            //title: title,
            closable: false,
            align: 't',
            slideInDuration: 400,
            minWidth: 400
        });
    }

});
