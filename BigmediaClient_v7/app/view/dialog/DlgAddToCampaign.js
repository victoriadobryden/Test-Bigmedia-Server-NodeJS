Ext.define("Bigmedia.view.dialog.DlgAddToCampaign", {
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
            curCamp: null,
            defaultManagerId: 911
        }
        // ,
        // formulas: {
        //     curCampProposals: {
        //         bind: {
        //             bindTo: '{curCamp}'
        //             // ,
        //             // deep: true
        //         },
        //         get: function(camp) {
        //             console.log(camp);
        //             if (camp) {
        //                 return camp.proposals;
        //             }
        //         }
        //     }
        // }
    },

    width: 700,
    minWidth: 400,
    height: 500,
    minHeight: 380,
    modal: true,
    closable: true,
    title: Bigmedia.Locales.dlgAddToCampaignTitle,
    referenceHolder: true,
    layout: 'fit',
    items: [
        {
            xtype: 'wizardform',
            reference: 'wizard',
            defaults: {
                header: false
            // },
            // bind: {
            //     tempStore: {
            //         bindTo: '{curCamp.proposals}',
            //         deep: true
            //     }
            //     // tempStore: '{curCamp.proposals}'
            },
            items: [
                {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAddToCampaignSelectTitle,
                    reference: 'campaignscard',
                    iconCls: 'x-fa fa-briefcase',
                    defaults: {
                        margin: '0 0 10 0'
                    },
                    layout: 'vbox',
                    items: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            layout: {
                                type: 'hbox'
                            },
                            width: '100%',
                            items: [
                                // {
                                //     xtype: 'button',
                                //     text: 'Add campaign',
                                //     handler: function (btn) {
                                //         var newCamp = btn.up('campview').lookupReference('campaignsDataView').getStore().add({
                                //             name: '', startDate: '2017-01-01', endDate: '2017-01-31'
                                //         });
                                //         console.log(newCamp);
                                //         btn.up('campview').lookupReference('campaignsDataView').getSelectionModel().select(newCamp);
                                //     }
                                // },
                                {
                                    xtype    : 'textfield',
                                    flex: 1,
                                    name     : 'searchCamp',
                                    emptyText: Bigmedia.Locales.campViewSearchCampEmptyText,
                                    enableKeyEvents: true,
                                    listeners: {
                                        change: function (input, newVal, oldVal) {
                                            // console.log('change ' + newVal);
                                            var store = input.up('toolbar').nextSibling('campdataview').getStore();
                                            if (input.getValue()) {
                                                store.removeFilter('filterName',true);
                                                store.addFilter(new Ext.util.Filter({
                                                    id: 'filterName',
                                                    filterFn: function(item) {
                                                        var re = new RegExp(newVal, 'i');
                                                        return re.test(item.get('name'));
                                                    }
                                                }));
                                            } else {
                                                store.removeFilter('filterName');
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'campdataview',
                            reference: 'campaignsDataView',
                            tpl: new Ext.XTemplate(
                                // '<a><div class="newcamp-item camp-preview-100 shadow camp-dataitem">',
                                //     '<div class="camp-picture" style="background-image: url(resources/images/newcamp.png)">',
                                //         '<div class="camp-info">',
                                //             '<div class="camp-name">' + Bigmedia.Locales.campaignsCreateNewCampaignText + '</div>',
                                //             '<div class="camp-period">' + Bigmedia.Locales.campaignsWithCustomPeriodText + '</div>',
                                //         '</div>',
                                //     '</div>',
                                // '</div></a>',
                                '<tpl for=".">',
                                    '<div class="campview-item camp-preview-100 shadow camp-dataitem">',
                                        '<div class="camp-picture"',
                                            '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                                            '<div class="camp-info">',
                                                '<div class="camp-name">{name}</div>',
                                                '<div class="camp-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                                            '</div>',
                                        '</div>',
                                    '</div>',
                                '</tpl>',
                                {
                                    formatDate: function (date) {
                                        return Ext.Date.format(date, 'd.m.Y');
                                    },
                                    hasSubject: function (subjectId) {
                                        return !!subjectId;
                                    }
                                }),
                            bind: {
                                store: '{campaigns}',
                                selection: {
                                    bindTo: '{curCamp}'
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
                                    var store = dataview.getStore().getSource(),
                                    // var store = Ext.getStore('Campaigns'),
                                        dlg = dataview.up('window'),
                                        wizard = dataview.up('wizardform');
                                    store.rejectChanges();
                                    dlg.getViewModel().set('curCamp', record);
                                    // wizard.updateNavigation();
                                    // wizard.lookupReference('nextbutton').click();
                                    wizard.getController().goNext();
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            ui: 'soft-green',
                            scale: 'large',
                            iconCls: 'fa fa-plus-square',
                            width: '100%',
                            text: Bigmedia.Locales.campaignsCreateNewCampaignText,
                            handler: function (btn) {
                                var dataview = btn.previousSibling(),
                                    store = dataview.getStore().getSource(),
                                // var store = Ext.getStore('Campaigns'),
                                    dlg = dataview.up('window'),
                                    wizard = dataview.up('wizardform'),
                                    user   = Bigmedia.Vars.getUser();
                                store.rejectChanges();
                                var curCamp = store.add({})[0];
                                // var curCamp = store.add({clientId: user.get('orgId'), managerId: dlg.getViewModel().get('defaultManagerId')})[0];
                                // console.log('new Camp %o', curCamp);
                                dlg.getViewModel().set('curCamp', curCamp);
                                // wizard.updateNavigation();
                                // wizard.lookupReference('nextbutton').click();
                                wizard.getController().goNext();
                            }
                        }
                    ]
                },
                {
                    xtype: 'wizardpage',
                    reference: 'infopage',
                    title: Bigmedia.Locales.dlgAddToCampaignEditTitle,
                    iconCls: 'fa fa-info',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'form',
                            reference: 'infoform',
                            defaultType: 'textfield',
                            modelValidation: true,
                            defaults: {
                                labelWidth: 90,
                                labelAlign: 'top',
                                labelSeparator: '',
                                submitEmptyText: false,
                                anchor: '100%'
                            },
                            items:[
                                {
                                    fieldLabel: Bigmedia.Locales.dlgAddToCampaignNameLabel,
                                    emptyText : Bigmedia.Locales.dlgAddToCampaignNameEmptyText,
                                    bind: {
                                        value: '{curCamp.name}'
                                    }
                                }, {
                                    xtype: 'fieldcontainer',
                                    fieldLabel: Bigmedia.Locales.dlgAddToCampaignPeriodLabel,
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'datefield',
                                            flex: 1,
                                            bind: {
                                                value: '{curCamp.startDate}'
                                            },
                                            listeners: {
                                                change: function (field, val, oldVal) {
                                                    var valDate = val,
                                                        other = field.nextSibling(),
                                                        diff = Math.round(+val - (+oldVal));
                                                    if (valDate && +valDate <= +other.getValue()) {
                                                        other.clearInvalid();
                                                        other.checkChange();
                                                    } else {
                                                        other.setValue(new Date(+other.getValue() + diff));
                                                    }
                                                }
                                            }
                                        }, {
                                            xtype: 'datefield',
                                            flex: 1,
                                            bind: {
                                                value: '{curCamp.endDate}'
                                            },
                                            listeners: {
                                                change: function (field, val, oldVal) {
                                                    var valDate = val,
                                                        other = this.previousSibling(),
                                                        diff = Math.round((+oldVal) - (+val));
                                                    if (valDate && +valDate >= +other.getValue()) {
                                                        other.clearInvalid();
                                                        other.checkChange();
                                                    } else {
                                                        other.setValue(new Date(+other.getValue() - diff));
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            ],
                            listeners: {
                                validitychange: function (form , valid) {
                                    // console.log(form);
                                    form.owner.up('wizardpage').setIsCompleted(valid);
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAddToCampaignSetPeriodLabel,
                    reference: 'period',
                    iconCls: 'x-fa fa-calendar',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'form',
                            reference: 'periodform',
                            defaultType: 'datefield',
                            defaults: {
                                labelWidth: 90,
                                labelAlign: 'top',
                                labelSeparator: '',
                                submitEmptyText: false,
                                anchor: '100%'
                            },
                            items:[
                                {
                                    fieldLabel: Bigmedia.Locales.fieldStartDateLabel,
                                    itemId: 'startDate',
                                    name: 'startDate',
                                    reference: 'startDate',
                                    validator: function (val) {
                                        var valDate = Ext.Date.parse(val, this.format),
                                            errMsg = Bigmedia.Locales.dlgCustomPeriodBegErrMsg,
                                            other = this.up('form').child('#endDate');
                                        if (valDate && +valDate <= +other.getValue()) {
                                            other.clearInvalid();
                                            return true;
                                        }
                                        return errMsg;
                                    },
                                    listeners: {
                                        change: function (field, val, oldVal) {
                                            var valDate = val,
                                                other = field.nextSibling(),
                                                diff = Math.round(+val - (+oldVal));
                                            if (valDate && +valDate <= +other.getValue()) {
                                                other.clearInvalid();
                                                other.checkChange();
                                            } else {
                                                other.setValue(new Date(+other.getValue() + diff));
                                            }
                                        }
                                    }
                                }, {
                                    fieldLabel: Bigmedia.Locales.fieldEndDateLabel,
                                    itemId: 'endDate',
                                    name: 'endDate',
                                    reference: 'endDate',
                                    validator: function (val) {
                                        var valDate = Ext.Date.parse(val, this.format),
                                            errMsg = Bigmedia.Locales.dlgCustomPeriodEndErrMsg,
                                            other = this.up('form').child('#startDate');
                                        if (valDate && +valDate >= +other.getValue()) {
                                            other.clearInvalid();
                                            return true;
                                        }
                                        return errMsg;
                                    },
                                    listeners: {
                                        change: function (field, val, oldVal) {
                                            var valDate = val,
                                                other = this.previousSibling(),
                                                diff = Math.round((+oldVal) - (+val));
                                            if (valDate && +valDate >= +other.getValue()) {
                                                other.clearInvalid();
                                                other.checkChange();
                                            } else {
                                                other.setValue(new Date(+other.getValue() - diff));
                                            }
                                        }
                                    }
                                }
                            ],
                            listeners: {
                                validitychange: function (form , valid) {
                                    form.owner.up('wizardpage').setIsCompleted(valid);
                                }
                            }
                        }
                    ],
                    listeners: {
                        show: function (page) {
                            var dlg = page.up('window'),
                                curCamp = dlg.lookupViewModel().get('curCamp'),
                                start = page.down('datefield#startDate'),
                                end = page.down('datefield#endDate');
                            start.setMinValue(curCamp.get('startDate'));
                            start.setMaxValue(curCamp.get('endDate'));
                            end.setMinValue(curCamp.get('startDate'));
                            end.setMaxValue(curCamp.get('endDate'));
                            var now = new Date(),
                                startVal = new Date(Date.UTC(now.getFullYear(), now.getMonth()+1, 1));
                            if (Ext.Date.between(startVal, curCamp.get('startDate'), curCamp.get('endDate'))) {
                                start.setValue(startVal);
                            } else {
                                start.setValue(curCamp.get('startDate'));
                            }
                            end.setValue(curCamp.get('endDate'));
                        }
                    }
                },
                {
                    xtype: 'wizardpage',
                    title: Bigmedia.Locales.dlgAddToCampaignFinishTitle,
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
                                var storeCamps = btn.up('window').getViewModel().getStore('campaigns').getSource(),
                                    curCamp = btn.up('window').lookupViewModel().get('curCamp'),
                                    pBar = btn.nextSibling('progressbar');
                                // var  storeCamps = Ext.getStore('Campaigns');
                                // console.log('sync storeCamps');
                                // pBar.updateProgress(0, 'start saving');
                                pBar.show();
                                pBar.wait({text: 'Saving data...'});
                                // function saveProposals(cb) {
                                //     // var storeProps = btn.up('wizardform').getTempStore();
                                //     // var storeProps = btn.up('wizardform').lookupViewModel().get('curCamp').proposals;
                                //     // var storeProps = btn.up('window').lookupViewModel().get('curCamp').proposals;
                                //
                                //     var storeCart = Ext.getStore('ShoppingCart');
                                //     var props = [],
                                //     startDate = btn.up('wizardform').down('datefield#startDate').getValue(),
                                //     endDate = btn.up('wizardform').down('datefield#endDate').getValue();
                                //     startDate = Ext.Date.localToUtc(startDate);
                                //     endDate = Ext.Date.localToUtc(endDate);
                                //     // var curCamp = btn.up('window').getViewModel().get('curCamp');
                                //     var storeProps = new Ext.data.Store({
                                //         model: 'Bigmedia.model.Proposal',
                                //         proxy: {
                                //             type: 'rest',
                                //             url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/proposals',
                                //             limitParam: null,
                                //             pageParam: '',
                                //             startParam: ''
                                //         },
                                //         autoLoad: false
                                //     });
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
                                //             pBar.reset();
                                //             pBar.updateText('Done!');
                                //             var cartStore = Ext.getStore('ShoppingCart');
                                //             cartStore.removeAll();
                                //             if (cb) {
                                //                 cb();
                                //             }
                                //             pBar.hide();
                                //         },
                                //         failure: function () {
                                //             pBar.reset();
                                //             pBar.updateText('Error');
                                //             storeProps.rejectChanges();
                                //             if (cb) {
                                //                 cb();
                                //             }
                                //             pBar.hide();
                                //         }
                                //     });
                                // }

                                function bulkSaveProposals(cb) {
                                    var storeCart = Ext.getStore('ShoppingCart'),
                                        faces = [],
                                        startDate = btn.up('wizardform').down('datefield#startDate').getValue(),
                                        endDate = btn.up('wizardform').down('datefield#endDate').getValue();
                                    startDate = Ext.Date.localToUtc(startDate);
                                    endDate = Ext.Date.localToUtc(endDate);
                                    storeCart.each(function(face){
                                        faces.push('<face date_beg="' + Ext.Date.format(startDate, 'Y-m-d') + '" date_end="' + Ext.Date.format(endDate, 'Y-m-d') + '" id="' + face.getId() + '"></face>');
                                    });
                                    // var curCamp = btn.up('window').getViewModel().get('curCamp');
                                    Ext.Ajax.request({
                                        url: '/api/v1/campaigns/' + encodeURIComponent(curCamp.getId()) + '/bulkAddProposals',
                                        params: {
                                            faces: faces.join(''),
                                            doorsNums: '',
                                            startDate: startDate,
                                            endDate: endDate
                                        },

                                        success: function () {
                                            pBar.reset();
                                            pBar.updateText('Done!');
                                            var cartStore = Ext.getStore('ShoppingCart');
                                            cartStore.removeAll();
                                            if (cb) {
                                                cb();
                                            }
                                            pBar.hide();
                                        },
                                        failure: function () {
                                            pBar.reset();
                                            pBar.updateText('Error');
                                            storeProps.rejectChanges();
                                            if (cb) {
                                                cb();
                                            }
                                            pBar.hide();
                                        }
                                    });
                                }
                                // storeCamps.on('write',saveProposals,
                                //     btn,
                                //     {
                                //         single: true
                                //     }
                                // );
                                if (curCamp.dirty || curCamp.phantom) {
                                    storeCamps.sync({
                                        success: function () {
                                            bulkSaveProposals(function(){
                                                btn.up('window').destroy();
                                                btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                                            });
                                        },
                                        failure: function () {
                                            storeCamps.rejectChanges();
                                        }
                                    });
                                } else {
                                    bulkSaveProposals(function(){
                                        btn.up('window').destroy();
                                        btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                                    });
                                }
                                //btn.lookupController().redirectTo('campaigns/' + curCamp.get('id'));
                            }
                        },
                        {
                            xtype: 'progressbar',
                            reference: 'progressbar',
                            width: '100%',
                            margin: 20,
                            hidden: true,
                            value: 0
                        }
                    ]
                }
            ]
        }
    ],
    onCurCamp: function (curCamp) {
        var me = this,
            wizard = me.lookupReference('wizard'),
            campsCard = wizard.lookupReference('campaignscard');
        if (campsCard) {
            campsCard.setIsCompleted(!!curCamp);
            // view.lookupReference('wizard').updateNavigation();
        }
        // console.log('onCurCamp %o', curCamp);
        // view.lookupReference('wizard').pageChanged();
    },
    initComponent: function () {
        var me = this;
        me.callParent();
        me.getViewModel().bind('{curCamp}', me.onCurCamp, me);

        var main = Ext.ComponentQuery.query('mainviewport')[0],
            ra = main.getController().getRestrictedArea();
        me.getViewModel().setStores({
            campaigns: {
                source: ra.getViewModel().getStore('campaigns'),
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }]
            }
        });


        var user = Bigmedia.Vars.getUser(),
            wizard = me.lookupReference('wizard'),
            infoform = wizard.lookupReference('infoform'),
            manStore = Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data : user.get('org').managers.map(function(man){ return {id: man.id, name: man.firstName + ' ' + man.lastName}})
            });
        if (manStore.getCount() > 0) {
            me.getViewModel().set('defaultManagerId', manStore.getAt(0).getId());
        } else {
            me.getViewModel().set('defaultManagerId', 911);
        }
        // console.log(user);
        if (manStore.getCount() > 1) {
            infoform.add(Ext.create('Ext.form.field.ComboBox', {
                reference: 'managers',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                fieldLabel: 'Manager',
                bind: {
                    value: '{curCamp.managerId}'
                },
                store: manStore
            }));
        } else if (manStore.getCount() === 1) {
            infoform.add(Ext.create('Ext.form.field.Text',{
                readOnly: true,
                fieldLabel: 'Manager',
                value: manStore.getAt(0).get('name')
            }));
        } else {
            me.noManagers = true;
        }
    }
});
