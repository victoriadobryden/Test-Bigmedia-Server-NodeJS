Ext.define('Bigmedia.view.authentication.CheckOutFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication-checkoutform',

    requires: [
        'Ext.window.MessageBox'
    ],

    onResetClick: function () {
        this.getView().getForm().reset();
    },

    onBackToCartClick: function () {
        var win = this.getView().up('checkoutdialog');
        win.close();
        window.location = '#cart';
    },

    verifyAuthCode: function () {
        var me = this,
            form = me.getView().getForm();
        Ext.MessageBox.prompt(Bigmedia.Locales.checkoutFormMsgVerifyTitle,
            Bigmedia.Locales.checkoutFormMsgVerifyText,
            function (btn, text, opts) {
                if (btn === 'ok') {
                    if (+text === +this.authCode) {
                        this.showToast(Bigmedia.Locales.checkoutFormToastCodeVerified);
                        form.submit({
                            clientValidation: true,
                            params: {
                                authCode: this.authCode,
                                idOrder: this.idOrder
                            }});
                        this.onSuccessSubmit();
                    } else {
                        this.showToast(Bigmedia.Locales.checkoutFormToastCodeWrong);
                        this.verifyAuthCode();
                    }
                } else {
                    this.showToast(Bigmedia.Locales.checkoutFormToastCodeCanceled);
                }
            },
            me
            //    {
            //    title: 'Authorization code',
            //    message: 'Please enter authorization code that was sent you on your mailbox:',
            //    buttons: Ext.Msg.OKCANCEL,
            //    icon: Ext.window.MessageBox.QUESTION,
            //    authCode: authCode,
            //    fn: function (btn, text, opts) {
            //        if(btn === 'ok'){
            //            if(+text === +opts.authCode){
            //                this.showToast('The authorization code was verified');
            //                this.onSuccessSubmit();
            //            } else {
            //                this.showToast('The authorization code is wrong. Please, try again.');
            //                this.verifyAuthCode(opts.authCode);
            //            }
            //        } else {
            //            this.showToast('You canceled email authorization');
            //        }
            //    },
            //    scope: me
            //}
        );
    },

    onCompleteClick: function () {
        var me = this,
            form = me.getView().getForm();
        if (form.isValid()) {
            var faces = [],
                cartStore = Ext.getStore('ShoppingCart');
            cartStore.each(function (rec) {
                faces.push(rec.id);
            });
            if (faces.length > 0) {
                //var param = JSON.stringify(faces);
                form.submit({
                    clientValidation: false,
                    params: {
                        faces: faces,
                        locale: Bigmedia.Locales.currentLocale
                    },
                    success: function (form, action) {
                        //Ext.Msg.alert('Success', action.result.msg);
                        var verified = action.result.verified;
                        me.idOrder = action.result.idOrder;
                        me.authCode = action.result.authCode;
                        if (!verified) {
                            me.verifyAuthCode();
                        } else {
                            me.onSuccessSubmit();
                        }
                    },
                    failure: function (form, action) {
                        switch (action.failureType) {
                            case Ext.form.action.Action.CLIENT_INVALID:
                                Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                break;
                            case Ext.form.action.Action.CONNECT_FAILURE:
                                Ext.Msg.alert('Failure', 'Ajax communication failed');
                                break;
                            case Ext.form.action.Action.SERVER_INVALID:
                                Ext.Msg.alert('Failure', action.result.msg);
                        }
                    }
                });
            } else {
                Ext.Msg.alert('Failure', 'Shopping cart is empty');
            }
        }
    },

    onSuccessSubmit: function () {
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
            //while ((ix = facesStore.find('inCart', true)) >= 0) {
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
            cartStore.removeAll();
            me.timer = null;
            Ext.MessageBox.hide();
            me.showToast('Order was sent successfully. We\'ll contact you as soon as possible.');
            me.redirectTo('#');
            //me.getView().hide();
            var parent = me.getView().up('checkoutdialog');
            parent.close();
            var mv = Ext.getCmp('mainView');
            if (mv.getController().cartView) {
                mv.getController().cartView.close();
            }
        }, 500);
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
