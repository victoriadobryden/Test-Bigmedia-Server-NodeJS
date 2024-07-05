Ext.define('Bigmedia.view.campaign.CampViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.campaign-campview',
    // formulas: {
    //     theCamp: function (get) {
    //         return get('bigcampview.selection');
    //     },
    //     // curCamp: {
    //     //     get: function () {
    //     //         return Bigmedia.Vars.getCurCamp();
    //     //     },
    //     //     set: function (val) {
    //     //         Bigmedia.Vars.setCurCamp(val);
    //     //     }
    //     // },
    //     campaignId: function (get) {
    //         return get('curCamp.id');
    //     }
    // },
    // stores: {
    //     campaignPosters: {
    //         model: 'Poster',
    //         autoLoad: true,
    //         remoteFilter: true,
    //         filters: [{
    //             property: 'campaignId',
    //             value: '{campaignId}'
    //         }]
    //     },
    // },
    // stores: {
    //     campaigns: {
    //         model: 'Campaign',
    //         autoLoad: true
    //     }
    // },

    data: {
        name: 'Bigmedia'
    }

});
