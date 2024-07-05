Ext.define('Bigmedia.lib.provider.Facebook', {
    mixins: ['Ext.mixin.Observable'],
    singleton: true,

    requires: [
        'Bigmedia.model.User'
    ],

    config: {
        appId: '1308134669200550'
    },

    constructor: function (config) {
        var me = this;

        me.mixins.observable.constructor.call(me, config);
        me.initConfig(config);
        me.callParent([config]);

        window.fbAsyncInit = Ext.bind(me.onFacebookInit, me);

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.com/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    },

    removeToken: function () {
        var me = this;
        Ext.Ajax.request({
            url: '/api/v1/auth/facebook-token',
            method: 'DELETE',
            success: function(response, opts) {
                if (FB.getAccessToken()) {
                    me.logout();
                } else {
                    Bigmedia.Vars.loadUser();
                }
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },

    login: function (cb, scope) {
        var args = [].slice.call(arguments, 2);
        FB.login(function(response) {
                // console.log('login response');
                // console.log(response);
                // handle the response
                if (response.status === 'connected' && cb) {
                    Ext.callback(cb, scope, args);
                }
            }, {
                scope: 'email',
                return_scopes: true
            });
    },

    logout: function () {
        if (FB.getAccessToken()) {
            FB.logout();
        }
    },

    onFacebookInit: function(){
        // console.log('onFacebookInit');
        var me = this;
        FB.init({
            appId      : me.getAppId(),
            cookie : true,
            // xfbml      : true,
            version    : 'v2.12'
        });
        FB.Event.subscribe('auth.authResponseChange', Ext.bind(me.onFacebookAuthResponseChange, me));
    },

    loginByToken: function (token) {
        Ext.Ajax.request({
            url: '/api/v1/auth/facebook-token',
            params: {
                access_token: token
            },

            success: function (response, opts) {
                var user = JSON.parse(response.responseText);
                user.provider = 1;
                var newUser = Ext.create('Bigmedia.model.User', user, 1);
                Bigmedia.Vars.setUser(newUser);
                var mainView = Ext.ComponentQuery.query('mainviewport');
                if (mainView && mainView.length > 0) {
                    mainView = mainView[0];
                    if (mainView.getViewModel().get('targetLoginRouteId')) {
                        mainView.getController().redirectTo(mainView.getViewModel().get('targetLoginRouteId'), true);
                    } else {
                        mainView.getController().redirectTo('faces', true);
                    }
                }
            },
            failure: function (response, opts) {
                if (response && response.status == 500) {
                    var mainView = Ext.ComponentQuery.query('mainviewport');
                    if (mainView && mainView.length > 0) {
                        mainView = mainView[0];
                        // mainView.getController().redirectTo('#error500');
                        Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('error500');
                    }
                } else if (response && response.status == 401) {
                    //TODO Error We already have this token in database linked with local user
                }
                console.log('error facebook-token request');
            }
        });
    },

    onFacebookAuthResponseChange: function(response){
        // var me = Bigmedia.Facebook;
        // console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            var accessToken = response.authResponse.accessToken;
                userId = response.authResponse.userID;
            this.loginByToken(accessToken);
        } else {
            Bigmedia.Vars.loadUser();
            // Ext.Ajax.request({
            //     url: '/auth/user',
            //     success: function (response, opts) {
            //         var obj = Ext.decode(response.responseText);
            //         console.dir(obj);
            //     },
            //     failure: function(response, opts) {
            //         console.log('server-side failure with status code ' + response.status);
            //     }
            // })
            // User not logged or just has been logged out
            // var curUser = Ext.create('Bigmedia.model.User',{id: 'anonymous'});
            // Bigmedia.Vars.setUser(curUser);
        }
    }
});
