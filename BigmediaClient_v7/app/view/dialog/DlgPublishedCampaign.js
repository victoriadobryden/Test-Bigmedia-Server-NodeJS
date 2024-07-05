Ext.define('Bigmedia.view.dialog.DlgPublishedCampaign', {
    extend: "Ext.window.Window",
    xtype: 'dialog-publishedcamp',

    requires: [
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    viewModel: {
        data: {
            publishedCamp: null,
            password: null
            // orgName: null,
            // cityId: null,
            // firstName: null,
            // lastName: null
        }
    },

    title: 'Presentation properties',
    frame: true,
    width: 400,
    closable: true,
    bodyPadding: 10,
    closeAction: 'hide',

    defaultType: 'textfield',

    items: [{
            fieldLabel: 'Name',
            emptyText: 'Enter presentation\'s title',
            name: 'name',
            bind: {
                value: '{publishedCamp.name}'
            }
        }, {
            fieldLabel: 'Description',
            emptyText: '',
            name: 'note',
            bind: {
                value: '{publishedCamp.note}'
            }
        }
        , {
            fieldLabel: 'Feedback email',
            emptyText: '',
            name: 'email',
            bind: {
                value: '{publishedCamp.email}'
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
                    publishedCamp = model.get('publishedCamp');
                if (publishedCamp.store) {
                    publishedCamp.store.on('update', function () {
                        // console.log('update here');
                    }, {single: true});
                    publishedCamp.store.sync();
                } else {
                    var mainView = dlg.up('mainviewport'),
                        campCard = mainView.down('campcard');
                    var store = campCard.lookupViewModel().get('curCamp.publisheds');
                    store.add(publishedCamp);
                    store.sync();
                }
                dlg.close();
            }
        }
    ],

    listeners: {
        show: function (dlg) {
            dlg.getViewModel().set('password', null);
        }
    },

    defaults: {
        anchor: '100%',
        labelWidth: 120
    }
});
