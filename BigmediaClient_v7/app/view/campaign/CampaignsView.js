Ext.define('Bigmedia.view.campaign.CampaignsView',{
    extend: 'Ext.panel.Panel',

    xtype: 'campaignsview',

    requires: [
        'Bigmedia.view.campaign.CampaignsViewController',
        'Bigmedia.view.campaign.CampaignsViewModel',
        'Bigmedia.view.campaign.CampDataView'
    ],

    controller: 'campaign-campaignsview',
    // viewModel: {
    //     type: 'campaign-campaignsview'
    // },

    layout: 'fit',

    tbar: {
        layout: {
            type: 'hbox'
        },
        width: '100%',
        items: [
            {
                xtype: 'datefield',
                fieldLabel: Bigmedia.Locales.campViewFromDateLabel,
                value: Ext.Date.add(new Date(), Ext.Date.MONTH, -3),
                maxValue: new Date(),  // limited to the current date or prior
                listeners: {
                    change: function (input, newVal, oldVal) {
                        if (newVal && newVal !== oldVal && input.isValid()) {
                            var campStore = this.lookupViewModel().getStore('campaigns');
                            // var store = this.up('campaignsview').lookupReference('bigcampview').getStore();
                            campStore.getProxy().setExtraParams({fromDate: Ext.Date.format(newVal,'c')});
                            campStore.load();
                        }
                    }
                }
            }, {
                xtype    : 'textfield',
                flex: 1,
                name     : 'searchCamp',
                emptyText: Bigmedia.Locales.campViewSearchCampEmptyText,
                enableKeyEvents: true,
                listeners: {
                    change: function (input, newVal, oldVal) {
                        // console.log('change ' + newVal);
                        var store = this.up('campaignsview').lookupReference('bigcampview').getStore();
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

    // session: true,

    items: [{
            xtype: 'campdataview',
            reference: 'bigcampview',
            bind: {
                store: '{campsviewstore}',
                selection: {
                    bindTo: '{curCamp}'
                }
            },
            // itemCls: 'big-50 shadow camp-dataitem'
            tpl: new Ext.XTemplate(
                '<a href="#campaigns/new"><div class="newcamp-item big-50 small-100 shadow camp-dataitem">',
                    '<div class="camp-picture" style="background-image: url(resources/images/newcamp.png)">',
                        '<div class="camp-info">',
                            '<div class="camp-name">' + Bigmedia.Locales.campaignsCreateNewCampaignText + '</div>',
                            '<div class="camp-period">' + Bigmedia.Locales.campaignsWithCustomPeriodText + '</div>',
                            // '<div class="camp-toolbar">',
                            //     '<div class="camp-stat">',
                            //     '</div>',
                            //     '<div class="camp-budget">',
                            //     '</div>',
                            //     '<div class="camp-balance">',
                            //     '</div>',
                            // '</div>',
                        '</div>',
                    '</div>',
                '</div></a>',
                '<tpl for=".">',
                    '<div class="campview-item big-50 small-100 shadow camp-dataitem">',
                        '<div class="camp-picture"',
                            '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                            '<div class="camp-info">',
                                '<div class="camp-name">{name}</div>',
                                '<div class="camp-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                                // '<div class="camp-toolbar">',
                                //     '<div class="camp-stat">',
                                //         '<div class="label">Statistics:</div>',
                                //         '<div>OTS:&hellip; GRP:&hellip;</div>',
                                //     '</div>',
                                //     '<div class="camp-budget">',
                                //         '<div class="label">Budget:</div>',
                                //         '<div>{fin.budget:number("0.00")}</div>',
                                //     '</div>',
                                //     '<div class="camp-balance">',
                                //         '<div class="label">Balance:</div>',
                                //         '<div<tpl "if = "fin.balance &lt; 0"> class="neg-balance"</tpl>>{fin.balance:number("0")}</div>',
                                //     '</div>',
                                // '</div>',
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
                }
            )
        }
    ]
});
