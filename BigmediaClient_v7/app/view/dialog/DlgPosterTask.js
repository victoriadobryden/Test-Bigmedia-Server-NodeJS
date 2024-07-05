Ext.define("Bigmedia.view.dialog.DlgPosterTask", {
    extend: "Ext.window.Window",

    requires: [
        'Bigmedia.view.wizard.WizardForm',
        'Bigmedia.view.wizard.WizardPage'
    ],

    viewModel: {
        // stores: {
        //     campaignsDlg: {
        //         source: '{campaigns}',
        //         sorters: [{
        //             property: 'id',
        //             direction: 'DESC'
        //         }]
        //     }
        //     // campaigns: {
        //     //     model: 'Campaign',
        //     //     autoLoad: true,
        //     //     sorters: [
        //     //         {
        //     //             property: 'id',
        //     //             direction: 'DESC'
        //     //         }
        //     //     ]
        //     // }
        // },
        data: {
            curPoster: null
        }
    },

    width: 700,
    minWidth: 400,
    height: 500,
    minHeight: 380,
    modal: true,
    closable: true,
    title: 'Select subject',
    referenceHolder: true,
    layout: 'fit',
    items: [
        {
            xtype: 'wizardform',
            reference: 'wizard',
            defaults: {
                header: false
            },
            bind: {
                tempStore: '{curCamp.posters}'
            },
            items: [
                {
                    xtype: 'wizardpage',
                    title: 'Select subject',
                    reference: 'subjectscard',
                    iconCls: 'x-fa fa-briefcase',
                    defaults: {
                        margin: '0 0 10 0'
                    },
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'dataview',
                            cls: 'poster-dataview',
                            itemSelector: 'div.posterview-item',
                            // itemCls: 'camp-preview-100 shadow camp-dataitem', //big-50
                            scrollable: 'y',
                            reference: 'postersDataView',
                            tpl: new Ext.XTemplate(
                                '<tpl for=".">',
                                    '<div class="posterview-item poster-preview-100 shadow poster-dataitem">',
                                        '<div class="poster-picture-bg"',
                                            '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                                            '<div class="poster-info">',
                                                '<div class="poster-name">{name}</div>',
                                            '</div>',
                                        '</div>',
                                    '</div>',
                                '</tpl>',
                                {
                                    hasSubject: function (subjectId) {
                                        return !!subjectId;
                                    }
                                }),
                            bind: {
                                store: '{curCamp.posters}',
                                selection: {
                                    bindTo: '{curPoster}'
                                }
                            },
                            width: '100%',
                            flex: 1,
                            listeners: {
                                // containerclick: function (dataview) {
                                //     var store = dataview.getStore().getSource(),
                                //     // var store = Ext.getStore('Campaigns'),
                                //         dlg = dataview.up('window'),
                                //         wizard = dataview.up('wizardform'),
                                //         user   = Bigmedia.Vars.getUser();
                                //     store.rejectChanges();
                                //     var curCamp = store.add({})[0];
                                //     // var curCamp = store.add({clientId: user.get('orgId'), managerId: dlg.getViewModel().get('defaultManagerId')})[0];
                                //     // console.log('new Camp %o', curCamp);
                                //     dlg.getViewModel().set('curCamp', curCamp);
                                //     // wizard.updateNavigation();
                                //     // wizard.lookupReference('nextbutton').click();
                                //     wizard.getController().goNext();
                                // },
                                itemclick: function (dataview, record) {
                                    var store = dataview.getStore(),
                                    // var store = Ext.getStore('Campaigns'),
                                        dlg = dataview.up('window'),
                                        wizard = dataview.up('wizardform');
                                    store.rejectChanges();
                                    dlg.getViewModel().set('curPoster', record);
                                    // wizard.updateNavigation();
                                    // wizard.lookupReference('nextbutton').click();
                                    wizard.getController().goNext();
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'wizardpage',
                    title: 'Select cover date',
                    reference: 'datecoverpage',
                    iconCls: 'x-fa fa-calendar',
                    isCompleted: true,
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'form',
                            reference: 'periodform',
                            defaultType: 'radiofield',
                            defaults: {
                                labelWidth: 90,
                                labelAlign: 'top',
                                labelSeparator: '',
                                submitEmptyText: false,
                                anchor: '100%'
                            },
                            items:[
                                {
                                    boxLabel: 'From proposal\'s begin',
                                    name: 'datecovertype',
                                    reference: 'datecoverauto',
                                    itemId: 'datecoverauto',
                                    checked: true
                                }, {
                                    boxLabel: 'Select date',
                                    name: 'datecovertype'
                                },
                                {
                                    xtype: 'datefield',
                                    reference: 'datecover',
                                    itemId: 'datecover',
                                    bind: {
                                        hidden: '{datecoverauto.checked}',
                                        disabled: '{datecoverauto.checked}'
                                    },
                                    validation: 'Must be selected',
                                    listeners: {
                                        change: function (field) {
                                            if (field.getValue()) {
                                                field.setValidation(null);
                                            } else {
                                                field.setValidation('Must be selected');
                                            }
                                        }
                                    }
                                }
                            ],
                            listeners: {
                                validitychange: function (form, valid) {
                                    // console.log(form);
                                    var form = form.owner,
                                        datecoverauto = form.down('#datecoverauto'),
                                        datecover = form.down('#datecover');
                                    // console.log(datecoverauto.getValue());
                                    // console.log(datecover.getValue());
                                    // form.up('wizardpage').setIsCompleted(datecoverauto.getValue() || datecover.getValue());
                                    form.up('wizardpage').setIsCompleted(valid);
                                }
                            }
                        }
                    ],
                    listeners: {
                        show: function (page) {
                            // var dlg = page.up('window'),
                            //     curCamp = dlg.lookupViewModel().get('curCamp'),
                            //     start = page.down('datefield#startDate'),
                            //     end = page.down('datefield#endDate');
                            // start.setMinValue(curCamp.get('startDate'));
                            // start.setMaxValue(curCamp.get('endDate'));
                            // end.setMinValue(curCamp.get('startDate'));
                            // end.setMaxValue(curCamp.get('endDate'));
                            // var now = new Date(),
                            //     startVal = new Date(Date.UTC(now.getFullYear(), now.getMonth()+1, 1));
                            // if (Ext.Date.between(startVal, curCamp.get('startDate'), curCamp.get('endDate'))) {
                            //     start.setValue(startVal);
                            // } else {
                            //     start.setValue(curCamp.get('startDate'));
                            // }
                            // end.setValue(curCamp.get('endDate'));
                        }
                    }
                },
                {
                    xtype: 'wizardpage',
                    title: 'Finish',
                    iconCls: 'x-fa fa-flag-checkered',
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'middle'
                    },
                    html: '<h4>' + Bigmedia.Locales.dlgAddToCampaignReadyText + '</h4>',
                    items: [

                        {
                            xtype: 'button',
                            scale: 'large',
                            ui: 'soft-green',
                            text: Bigmedia.Locales.dlgAddToCampaignSaveBtnText,
                            handler: function (btn) {
                                var curCamp = btn.up('window').lookupViewModel().get('curCamp'),
                                    posterTasksStore = new Ext.data.Store({
                                        model: Bigmedia.model.PosterTask
                                    }),
                                    proposalsGrid = btn.up('window').lookupViewModel().get('grid'),
                                    datecoverauto = btn.up('window').down('#datecoverauto').getValue(),
                                    dateCover = btn.up('window').down('#datecover').getValue(),
                                    posterId = btn.up('window').lookupViewModel().get('curPoster').getId(),
                                    newRecs = [];
                                if (dateCover) {
                                    dateCover = Ext.Date.localToUtc(dateCover);
                                }
                                proposalsGrid.getSelection().forEach(function(record){
                                    if (datecoverauto || (record.get('startDate')<=dateCover && record.get('endDate')>=dateCover)) {
                                        newRecs.push({proposalId: record.getId(), posterId: posterId, coverDate: datecoverauto ? record.get('startDate') : dateCover});
                                    }
                                });
                                if (newRecs.length > 0) {
                                    posterTasksStore.add(newRecs);
                                    // console.log(newRecs);
                                    posterTasksStore.sync();
                                }

                                // // var  storeCamps = Ext.getStore('Campaigns');
                                // // console.log('sync storeCamps');
                                // function saveProposals(cb) {
                                //     var storeProps = btn.up('wizardform').getTempStore();
                                //     // .getViewModel().getStore('curCamp.proposals'),
                                //     var storeCart = Ext.getStore('ShoppingCart');
                                //     var props = [],
                                //     startDate = btn.up('wizardform').down('datefield#startDate').getValue(),
                                //     endDate = btn.up('wizardform').down('datefield#endDate').getValue();
                                //     startDate = Ext.Date.localToUtc(startDate);
                                //     endDate = Ext.Date.localToUtc(endDate);
                                //     var curCamp = btn.up('window').getViewModel().get('curCamp');
                                //     storeCart.each(function(record){
                                //         props.push({
                                //             campaignId: curCamp.get('id'),
                                //             faceId: record.get('id'),
                                //             startDate: startDate,
                                //             endDate: endDate,
                                //             operationId: 1
                                //         });
                                //     });
                                //     storeProps.add(props);
                                //     storeProps.sync({
                                //         success: function () {
                                //             var cartStore = Ext.getStore('ShoppingCart');
                                //             cartStore.removeAll();
                                //             if (cb) {
                                //                 cb();
                                //             }
                                //         },
                                //         failure: function () {
                                //             storeProps.rejectChanges();
                                //         }
                                //     });
                                // }
                                // // storeCamps.on('write',saveProposals,
                                // //     btn,
                                // //     {
                                // //         single: true
                                // //     }
                                // // );
                                // if (curCamp.dirty || curCamp.phantom) {
                                //     storeCamps.sync({
                                //         success: function () {
                                //             saveProposals(function(){
                                //                 btn.up('window').close();
                                //                 btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                                //             });
                                //         },
                                //         failure: function () {
                                //             storeCamps.rejectChanges();
                                //         }
                                //     });
                                // } else {
                                //     saveProposals(function(){
                                //         btn.up('window').close();
                                //         btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                                //     });
                                // }
                                //btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                            }
                        }
                    ]
                }
            ]
        }
    ],
    onCurCamp: function (curCamp) {
        // var me = this,
        //     wizard = me.lookupReference('wizard'),
        //     campsCard = wizard.lookupReference('campaignscard');
        // if (campsCard) {
        //     campsCard.setIsCompleted(!!curCamp);
        //     // view.lookupReference('wizard').updateNavigation();
        // }
        // console.log('onCurCamp %o', curCamp);
        // view.lookupReference('wizard').pageChanged();
    }
    // ,
    // initComponent: function () {
    //     var me = this;
    //     me.callParent();
    //     // me.getViewModel().bind('{curCamp}', me.onCurCamp, me);
    //
    //     var main = Ext.ComponentQuery.query('mainviewport')[0],
    //         ra = main.getController().getRestrictedArea();
    //
    //     me.getViewModel().setStores({
    //         posters: {
    //             source: ra.getViewModel().get('curCamp.posters')
    //         }
    //     });
    // }
});
