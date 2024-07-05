Ext.define('Bigmedia.view.campaign.dashboard.DashboardController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dashboard',

    init: function () {
        var me = this;
        me.callParent();

        var ra = Ext.ComponentQuery.query('restrictedarea')[0];

        ra.getViewModel().bind({
            bindTo: '{curCamp.proposals}'
        }, function(v) {
            me.updateProposals(v);
        });
    },

    updateProposals: function (proposals) {
        var chart = this.lookup('chartcoverage');
        // console.log(proposals);
        if (proposals) {
            proposals.setRemoteFilter(false);
            chart.setFacesStore(proposals);
        } else {
            chart.setFacesStore(null);
        }
    },

    updateCurrentCampaign: function (curCamp) {
        console.log(curCamp);
        var chart = this.lookup('chartcoverage');
        if (curCamp) {
            chart.setFacesStore(curCamp.proposals());
        } else {
            chart.setFacesStore(null);
        }
    }
});
