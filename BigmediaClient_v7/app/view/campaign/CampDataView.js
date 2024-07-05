Ext.define('Bigmedia.view.campaign.CampDataView',{
    extend: 'Ext.view.View',
    xtype: 'campdataview',

    cls: 'camp-dataview',

    requires: [
        'Bigmedia.store.Campaigns'
    ],

    // store: 'Campaigns',
    itemSelector: 'div.campview-item',
    // itemCls: 'camp-preview-100 shadow camp-dataitem', //big-50
    scrollable: 'y',
    // data: {
    //     testText: 'sdalsjdalskj sadlfkjsalfdkj salfdkjsa'
    // },
    // itemTpl: new Ext.XTemplate(
    // data: {
    //         test: 'dfsfd'
    // },
    tpl: new Ext.XTemplate(
        '<a href="#campaigns/new"><div class="newcamp-item camp-preview-100 shadow camp-dataitem">',
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
            '<div class="campview-item camp-preview-100 shadow camp-dataitem">',
                '<div class="camp-picture"',
                    '<tpl if="this.hasSubject(subjectId) == true"> style="background-image: url(/api/v1/subjects/{subjectId}/image.jpeg)"</tpl>>',
                    '<div class="camp-info">',
                        '<div class="camp-name">{name}</div>',
                        '<div class="camp-period">{startDate:date("d.m.Y")}&nbsp;-&nbsp;{endDate:date("d.m.Y")}</div>',
                        '<div class="camp-toolbar"><div></div></div>',
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
        }),
    emptyText: 'No active campains yet',
    listeners: {
        itemclick: function (view, record) {
            // console.log('itemclick');
            var parent = this.up('campaignsview') || this.up('campview');
            if (parent) {
                // Bigmedia.Vars.setCurCamp(record);
                parent.getController().redirectTo('campaigns/' + record.getId());
            }
            // console.log(record);
        }
    }
    // ,
    //
    // initComponent: function () {
    //     var me = this;
    //     var store = Ext.getStore('Campaigns');
    //     if (!store) {
    //         // console.log('create store');
    //         store = Ext.create('Bigmedia.store.Campaigns');
    //         me.setStore(store);
    //     } else {
    //         // console.log('create chained');
    //         var chained = Ext.create('Ext.data.ChainedStore', {
    //             source: store
    //         });
    //         me.setStore(chained);
    //         // me.setStore(store);
    //     }
    //     me.callParent();
    // }
});
