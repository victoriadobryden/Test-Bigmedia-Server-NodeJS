Ext.define('Bigmedia.view.campaign.CampViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.campaign-campview',

    init: function () {
        var me = this;
        me.callParent();

        var ra = Ext.ComponentQuery.query('restrictedarea')[0];

        ra.getViewModel().bind({
            bindTo: '{curCamp}'
        }, function(v) {
            me.updateCurrentCampaign(v);
        });
    },

    updateCurrentCampaign: function (v) {
        var me = this,
            view = me.getView();
        if (me.view.publishedCamps) {
            me.view.publishedCamps.destroy();
        }
        if (v) {
            me.view.publishedCamps = new Ext.data.Store({
                model: 'Bigmedia.model.Published',
                proxy: {
                    type: 'rest',
                    url: '/api/v1/campaigns/'+ encodeURIComponent(v.getId()) + '/published',
                    limitParam: null,
                    pageParam: '',
                    startParam: '',
                    writer: {
                        writeAllFields: true
                    }
                },
                autoLoad: true,
                listeners: {
                    load: function (store) {
                        var pubCamp = store.first();
                        if (pubCamp) {
                            view.setPublishedCampaign(pubCamp);
                        } else {
                            if (view.getPublishedCampaign()) {
                                view.setPublishedCampaign(null);
                            } else {
                                view.updatePublishedCampaign(null);
                            }
                        }
                    }
                }
            });
        } else {
            view.setPublishedCampaign(null);
        }
    }

});
