Ext.define('Bigmedia.view.campaign.CampView', {
    extend: 'Ext.Panel',
    xtype: 'campview',

    requires: [
        'Bigmedia.view.campaign.CampViewController',
        'Bigmedia.view.campaign.CampViewModel',
        'Bigmedia.view.campaign.CampDataView',
        'Bigmedia.view.campaign.CampCard',
        'Ext.toolbar.Toolbar',
        'Ext.toolbar.Fill',
        'Ext.form.field.Text',
        'Ext.tab.Panel',
        'Bigmedia.view.campaign.dashboard.Dashboard',
        'Bigmedia.view.campaign.CampSides'
    ],

    controller: 'campaign-campview',

    layout: {
        type: 'border'
        // ,
        // align: 'stretch'
    },

    closeAction: 'hide',

    bodyBorder: false,

    defaults: {
        collapsible: true,
        split: true,
        bodyPadding: 10
    },

    config: {
        campaignId: null,
        publishedCampaign: null
    },

    updatePublishedCampaign: function (newVal, oldVal) {
        var me = this,
            campCard = me.lookup('campcard'),
            campSides = me.lookup('campsides');
        me.lookupViewModel().set('pubCamp', newVal);
        if (newVal == oldVal) {
            campCard.updatePublishedCampaign(newVal);
            campSides.updatePublishedCampaign(newVal);
        } else {
            campCard.setPublishedCampaign(newVal);
            campSides.setPublishedCampaign(newVal);
        }
    },

    items: [
        {
            title: Bigmedia.Locales.campViewTitle,
            region: 'west',
            collapsed: true,
            minWidth: 300,
            maxWidth: 700,
            width: 500,
            bodyPadding: 0,
            layout: 'vbox',
            items: [{
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
                        xtype: 'textfield',
                        flex: 1,
                        name: 'searchCamp',
                        emptyText: Bigmedia.Locales.campViewSearchCampEmptyText,
                        enableKeyEvents: true,
                        listeners: {
                            change: function (input, newVal, oldVal) {
                                // console.log('change ' + newVal);
                                var store = this.up('campview').lookupReference('campaignsDataView').getStore();
                                if (input.getValue()) {
                                    store.removeFilter('filterName', true);
                                    store.addFilter(new Ext.util.Filter({
                                        id: 'filterName',
                                        filterFn: function (item) {
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
            }, {
                xtype: 'campdataview',
                reference: 'campaignsDataView',
                bind: {
                    store: '{campcardstore}',
                    selection: {
                        bindTo: '{curCamp}'
                    }
                },
                width: '100%',
                flex: 1
            }
            ]
        }, {
            header: false,
            xtype: 'tabpanel',
            itemId: 'viewmodeTabPanel',
            region: 'center',
            layout: 'card',
            activeTab: 0,
            tabBar: {
                items: [{
                    xtype: 'tbfill'
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-remove',
                    reference: 'delCampaignBtn',
                    text: Bigmedia.Locales.campViewDeleteCampaignBtnText,
                    handler: function (delBtn) {
                        Ext.Msg.confirm({
                            title: Bigmedia.Locales.campViewConfirmDeleteCampaignTitle,
                            message: Bigmedia.Locales.campViewConfirmDeleteCampaignMessage,
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function (btn) {
                                if (btn === 'yes') {
                                    var curCamp = delBtn.up('restrictedarea').getViewModel().get('curCamp'),
                                        store = delBtn.up('campview').lookupViewModel().getStore('campaigns');
                                    store.remove(curCamp);
                                    store.sync();
                                    delBtn.up('restrictedarea').getController().redirectTo('campaigns');
                                }
                            },
                            scope: delBtn
                        });
                    }
                }
                ]
            },
            items: [
                {
                    title: Bigmedia.Locales.campCardProposalsTitle,
                    xtype: 'campsides',
                    reference: 'campsides'
                },
                {
                    title: Bigmedia.Locales.campViewDashboardTitle,
                    xtype: 'campaigndashboard',
                    reference: 'campdashboard'
                },
                {
                    title: Bigmedia.Locales.campViewDetailsTitle,
                    xtype: 'campcard',
                    reference: 'campcard',
                    flex: 1
                }
            ]
        }
    ],
    listeners: {
        show: function (panel) {
            // var curCamp = panel.lookupViewModel().get('curCamp');
            // if (curCamp) {
            //     var showDashboard = (curCamp._proposals && curCamp._proposals.getCount()>0),
            //     dashboardActive =  (curCamp._estimations && curCamp._estimations.getCount()>0);
            //     var dashboard = panel.down('campaigndashboard');
            //     dashboard.setHidden(!showDashboard);
            //     if (showDashboard) {
            //         var tabpanel = panel.child('tabpanel#viewmodeTabPanel');
            //         if (dashboardActive) {
            //             tabpanel.getLayout().setActiveItem(dashboard);
            //         } else {
            //             var campcard = panel.down('campcard');
            //             tabpanel.getLayout().setActiveItem(campcard);
            //         }
            //     }
            // }
            // console.log('show');
            // console.log(panel.down('campdataview').getStore());
        }
    }
});
