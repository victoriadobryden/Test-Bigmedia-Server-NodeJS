Ext.define('Bigmedia.view.campaign.CampCardModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.campaign-campcard',

    // links: {
    //     curCamp: Bigmedia.Vars.getCurCamp()
    // },
    // stores: {
    //     posters: {
    //         model: 'Poster',
    //         autoLoad: true
    //     }
    // },

    formulas: {
        isNotEditable: function (get) {
            // TODO check for user's access rights
            return !get('unlockEditing');
        },
        btnEditSaveText: function (get) {
            return get('unlockEditing') ? 'Save' : 'Edit';
        }
    },

    data: {
        name: 'Bigmedia',
        // curCamp: null,
        unlockEditing: false
    }

});
