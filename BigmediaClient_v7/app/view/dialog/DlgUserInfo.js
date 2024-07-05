Ext.define('Bigmedia.view.dialog.DlgUserInfo', {
    extend: "Ext.window.Window",
    xtype: 'dialog-userinfo',

    requires: [
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    viewModel: {
        data: {
            user: null
            // orgName: null,
            // cityId: null,
            // firstName: null,
            // lastName: null
        }
    },

    title: Bigmedia.Locales.dlgUserInfoTitle,
    frame: true,
    width: 320,
    closable: true,
    bodyPadding: 10,

    defaultType: 'textfield',

    items: [{
            fieldLabel: Bigmedia.Locales.fieldFirstNameLabel,
            emptyText: Bigmedia.Locales.fieldFirstNameEmptyText,
            name: 'first',
            bind: {
                value: '{user.firstName}'
            }
        }, {
            fieldLabel: Bigmedia.Locales.fieldLastNameLabel,
            emptyText: Bigmedia.Locales.fieldLastNameEmptyText,
            name: 'last',
            bind: {
                value: '{user.lastName}'
            }
        }
        // , {
        //     fieldLabel: 'Company',
        //     emptyText: 'Company',
        //     name: 'company',
        //     bind: {
        //         value: '{user.orgName}'
        //     }
        // }
        , {
            xtype: 'combobox',
            fieldLabel: Bigmedia.Locales.fieldCityLabel,
            name: 'city',
            store: {
                type: 'cities'
            },
            valueField: 'id',
            displayField: 'name',
            bind: {
                value: '{user.cityId}'
            },
            typeAhead: true,
            queryMode: 'local',
            emptyText: Bigmedia.Locales.fieldCityEmptyText
        }, {
            fieldLabel: Bigmedia.Locales.fieldAddressLabel,
            emptyText: Bigmedia.Locales.fieldAddressEmptyText,
            name: 'address',
            bind: {
                value: '{user.address}'
            }
        }
    ],

    buttons: [
        {
            text: Bigmedia.Locales.btnCancelText,
            handler: function (btn) {
                var dlg = btn.up('window');
                dlg.close();
            }
        }, {
            text: Bigmedia.Locales.btnSaveText,
            handler: function (btn) {
                var dlg = btn.up('window'),
                    model = dlg.getViewModel(),
                    user = Bigmedia.Vars.getUser();
                // user.set('firstName', model.get('firstName'));
                // user.set('lastName', model.get('lastName'));
                // user.set('lastName', model.get('lastName'));
                // user.set('cityId', model.get('cityId'));
                // user.set('orgName', model.get('orgName'));
                user.save({
                    failure: function(record, operation) {
                        Ext.Msg.alert(Bigmedia.Locales.dlgUserInfoErrorTitle, Bigmedia.Locales.dlgUserInfoErrorMsg);
                    },
                    success: function(record, operation) {
                        dlg.close();
                    }
                });
            }
        }
    ],

    listeners: {
        show: function (dlg) {
            var model = this.getViewModel();
            model.set('user', Bigmedia.Vars.getUser());
        }
    },

    defaults: {
        anchor: '100%',
        labelWidth: 120
    }
});
