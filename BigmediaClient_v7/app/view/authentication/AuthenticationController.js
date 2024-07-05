Ext.define('Bigmedia.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',

// auth/logout
// auth/local/login
// auth/local/signup
// auth/facebook-token

    //TODO: implement central Facebook OATH handling here

    onFaceBookLogin : function(button, e) {
        // this.redirectTo("dashboard");
        if(! FB.getAccessToken()){
            Bigmedia.lib.provider.Facebook.login();
        } else {
            Bigmedia.lib.provider.Facebook.loginByToken(FB.getAccessToken());
        }
    },

    onLoginSuccess: function () {
        this.fireViewEvent('login',this.getView());
    },

    validatePwd: function(field) {
        field.next().validate();
    },

    onLoginButton: function(button, e, eOpts) {
        var me = this,
            model = me.getViewModel(),
            mainView = Ext.ComponentQuery.query('mainviewport');
        if (mainView) {
            mainView = mainView[0];
        }
        Ext.Ajax.request({
            url: '/api/v1/auth/local/login',
            params: {
                username: model.get('username'),
                password: model.get('password'),
                rememberme: model.get('rememberMe')
            },

            success: function (response, opts) {
                var user = JSON.parse(response.responseText);
                user.provider = 2;
                var newUser = Ext.create('Bigmedia.model.User', user, 2);
                // Bigmedia.Vars.loadUser(function(){
                    // var user = Bigmedia.Vars.getUser();
                    // if (newUser.get('id') !== 'anonymous') {
                    //     var store = Ext.util.LocalStorage.get('user' + newUser.get('id'));
                    //     store.setItem('provider', 2);
                    //     store.release();
                    //     // console.log('Set provider: 1');
                    // }
                    // newUser.initFields();
                    Bigmedia.Vars.setUser(newUser);
                    if (mainView && mainView.getViewModel().get('targetLoginRouteId')) {
                        me.redirectTo(mainView.getViewModel().get('targetLoginRouteId'), true);
                    } else {
                        me.redirectTo('faces', true);
                    }

                // }
            },
            failure: function (response, opts) {
                if (response.status === 401) {
                    Ext.Msg.alert(Bigmedia.Locales.authLoginErrorAlertTitle, Bigmedia.Locales.authLoginErrorAlertText);
                } else {
                    // me.redirectTo('error500');

                }
                // if (mainView && mainView.getViewModel().get('beforeLoginRouteId')) {
                //     me.redirectTo(mainView.getViewModel().get('beforeLoginRouteId'));
                // } else {
                //     me.redirectTo('faces');
                // }
            }
        });
        Ext.getElementById('submitButton').click();
    },

    onLoginAsButton: function(button, e, eOpts) {
        // this.redirectTo("auth.login");
        Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.login');
    },

    onNewAccount:  function(button, e, eOpts) {
        // this.redirectTo("auth.signup");
        Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.signup');
    },

    onSignupClick:  function(button, e, eOpts) {
        var me = this,
            model = me.getViewModel(),
            mainView = Ext.ComponentQuery.query('mainviewport');
        if (mainView) {
            mainView = mainView[0];
        }
        Ext.Ajax.request({
            url: '/api/v1/auth/local/signup',
            params: {
                username: model.get('signup.username').trim(),
                password: model.get('signup.password'),
                email: model.get('signup.email').trim(),
                orgname: model.get('signup.orgName').trim(),
                firstname: model.get('signup.fullName').trim().split(/\s+/)[0],
                lastname: model.get('signup.fullName').trim().split(/\s+/)[1] || ''
            },

            success: function (response, opts) {
                Ext.Msg.alert(Bigmedia.Locales.authSignupSuccessAlertTitle, Bigmedia.Locales.authSignupSuccessAlertText);
                // me.redirectTo('auth.login');
                mainView.getController().setCurrentView('auth.login');
            },
            failure: function (response, opts) {
                if (response.status == 500) {
                    // me.redirectTo('error500');
                    Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('error500');
                } else {
                    Ext.Msg.alert(Bigmedia.Locales.authSignupErrorAlertTitle, Bigmedia.Locales.authSignupErrorAlertText);
                }
                // if (mainView && mainView.getViewModel().get('beforeLoginRouteId')) {
                //     me.redirectTo(mainView.getViewModel().get('beforeLoginRouteId'));
                // } else {
                //     me.redirectTo('faces');
                // }
            }
        });
    },

    onLoginByCodeClick: function(button, e, eOpts) {
        var me = this,
            model = me.getViewModel();
        Ext.Ajax.request({
            url: '/api/v1/auth/password/' + model.get('reset.code'),

            success: function(response, opts) {
                Bigmedia.Vars.loadUser(function(){
                    var mainView = Ext.ComponentQuery.query('mainviewport');
                    if (mainView) {
                        mainView = mainView[0];
                    }
                    if (mainView && mainView.getViewModel().get('targetLoginRouteId')) {
                        mainView.getController().redirectTo(mainView.getViewModel().get('targetLoginRouteId'));
                    } else {
                        mainView.getController().redirectTo('campaigns');
                    }
                });
            },

            failure: function(response, opts) {
                Ext.Msg.confirm({
                    title: Bigmedia.Locales.authLoginByCodeErrorTitle,
                    message: Bigmedia.Locales.authLoginByCodeErrorMsg,
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function (btn) {
                        if (btn === 'yes') {
                            Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.reset');
                        } else {
                            var mainView = Ext.ComponentQuery.query('mainviewport');
                            if (mainView) {
                                mainView = mainView[0];
                            }
                            if (mainView && mainView.getViewModel().get('beforeLoginRouteId')) {
                                mainView.getController().redirectTo(mainView.getViewModel().get('beforeLoginRouteId'));
                            } else {
                                mainView.getController().redirectTo('faces');
                            }
                        }
                    }
                });
            }
        });
    },

    onResetClick: function(button, e, eOpts) {
        var me = this,
            model = me.getViewModel();
        Ext.Ajax.request({
            url: '/api/v1/auth/password',

            params: {
                email: model.get('reset.email').trim(),
                locale: Bigmedia.Locales.currentLocale
            },

            success: function(response, opts) {
                Ext.ComponentQuery.query('mainviewport')[0].getController().showPage('auth.loginByCode');
            },

            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
                Ext.Msg.alert(Bigmedia.Locales.authPasswordResetErrorTitle, Bigmedia.Locales.authPasswordResetErrorMsg);
            }
        });
    }
});
