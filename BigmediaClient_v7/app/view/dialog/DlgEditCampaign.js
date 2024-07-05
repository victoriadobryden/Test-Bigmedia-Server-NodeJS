Ext.define('Bigmedia.view.dialog.DlgEditCampaign', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Date'
    ],

    viewModel: {
        data: {
            camp: null
        }
    },

    config: {
      camp: null
    },

    updateCamp: function (newVal) {
      this.getViewModel().set('camp', newVal);
    },

    title: Bigmedia.Locales.campaignsCreateNewCampaignText,
    width: 400,
    height: 240,
    collapsible: false,
    minWidth: 300,
    minHeight: 240,
    layout: 'fit',
    resizable: true,
    modal: true,
    referenceHolder: true,
    defaultFocus: 'campName',
    closeAction: 'destroy',

    items: [{
        // title: Bigmedia.Locales.campCardtabInfoTitle,
        // iconCls: 'fa fa-info',
        xtype: 'form',
        reference: 'infoform',
        defaultType: 'textfield',
        modelValidation: true,
        padding: 5,
        // trackResetOnLoad: true,
        defaults: {
            labelWidth: 90,
            labelAlign: 'top',
            labelSeparator: '',
            submitEmptyText: false,
            anchor: '100%',
            padding: 5
        },
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            itemId: 'actionBar',
            // hidden: true,
            items: [
                {
                    xtype: 'button',
                    text: Bigmedia.Locales.campCardCancelBtnText,
                    handler: function (btn) {
                        var win = btn.up('window');
                        win.fireEvent('dialogcancelled');
                        win.close();
                    }
                }, '->',
                {
                    xtype: 'button',
                    text: Bigmedia.Locales.campCardSaveBtnText,
                    itemId: 'saveBtn',
                    handler: function (btn) {
                        var win = btn.up('window'),
                            camp = win.getViewModel().get('camp'),
                            user = Bigmedia.Vars.getUser();
                        win.fireEventArgs('campaignchanged', [camp]);
                        // newCamp.set('clientId', user.get('orgId'));
                        // newCamp.save({
                        //     failure: function(record, operation) {
                        //         console.error('failed to save campaign');
                        //     },
                        //     success: function(record, operation) {
                        //         Ext.toast({
                        //             html: Bigmedia.Locales.campCardOnWriteToast,
                        //             //title: title,
                        //             closable: false,
                        //             align: 't',
                        //             slideInDuration: 400,
                        //             minWidth: 400
                        //         });
                        //         var campStore = Ext.getStore('Campaigns');
                        //         if (campStore) {
                        //             campStore.add(record);
                        //         }
                        //
                        //         win.close();
                        //     }
                        // });
                    }
                }
            ]
        }],
        items:[
            {
                emptyText : Bigmedia.Locales.campCardCampaignNameEmptyText,
                reference: 'campName',
                bind: {
                    value: '{camp.name}'
                }
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: Bigmedia.Locales.campCardPeriodLabel,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'datefield',
                        flex: 1,
                        itemId: 'startDate',
                        name: 'startDate',
                        reference: 'startDate',
                        twoWayBindable: 'value',
                        bind: {
                            value: '{camp.startDate}'
                        },
                        listeners: {
                            change: function (field, val, oldVal) {
                                var testDate = Ext.Date.parse(val);
                                if (!testDate) {
                                  return;
                                }
                                var valDate = val,
                                    other = field.nextSibling(),
                                    diff = Math.round(+val - (+oldVal));
                                if (valDate && +valDate <= +other.getValue()) {
                                    other.clearInvalid();
                                    other.checkChange();
                                } else {
                                    other.setValue(new Date(+other.getValue() + diff));
                                }
                                field.validate();
                            }
                        }
                    }, {
                        xtype: 'datefield',
                        flex: 1,
                        itemId: 'endDate',
                        name: 'endDate',
                        reference: 'endDate',
                        twoWayBindable: 'value',
                        bind: {
                            value: '{camp.endDate}'
                        },
                        listeners: {
                            change: function (field, val, oldVal) {
                                var testDate = Ext.Date.parse(val);
                                if (!testDate) {
                                  return;
                                }
                                var valDate = val,
                                    other = this.previousSibling(),
                                    diff = Math.round((+oldVal) - (+val));
                                if (valDate && +valDate >= +other.getValue()) {
                                    other.clearInvalid();
                                    other.checkChange();
                                } else {
                                    other.setValue(new Date(+other.getValue() - diff));
                                }
                                field.validate();
                            }
                        }
                    }
                ]
            }
        ],
        listeners: {
            dirtychange: function (form, dirty) {
                // var curCamp = form.owner.lookupViewModel().get('curCamp');
                // console.log(curCamp.dirty);
                // console.log(curCamp.phantom);
                // form.owner.down('#actionBar').setHidden(!curCamp.dirty && !curCamp.phantom);
            },
            validitychange: function (form , valid) {
                form.owner.down('#saveBtn').setDisabled(!valid);
            }
        }
    }],

    // listeners: {
    //     show: function (win) {
    //         var me = this,
    //             vm = me.getViewModel();
    //         vm.set('newCamp', new Bigmedia.model.Campaign());
    //     },
    //     close: function () {
    //         console.log('close event');
    //         this.getController().redirectTo('campaigns');
    //     }
    // }
});
