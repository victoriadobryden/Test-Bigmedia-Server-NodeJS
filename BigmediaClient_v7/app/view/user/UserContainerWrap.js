Ext.define('Bigmedia.view.user.UserContainerWrap',{
    extend: 'Ext.container.Container',

    xtype: 'restrictedarea',

    requires: [
        'Bigmedia.view.user.UserContainerWrapController'
    ],

    config: {
        curCamp: null,
        pubCamp: null
    },

    // session: true,

    controller: 'user-usercontainerwrap',

    autoShow: false,
    flex: 1,
    layout: {
        type: 'card',
        anchor: '100%'
    },

    updateCurCamp: function (newVal, prevCamp) {
        // var prevCamp = this.getCurCamp();
        var me = this;
        if (prevCamp && (prevCamp.dirty || prevCamp.phantom)) {
            Ext.Msg.show({
                title: Bigmedia.Locales.userContainerSaveCampaignConfirmTitle,
                message: Bigmedia.Locales.userContainerSaveCampaignConfirmMsg,
                buttons: Ext.Msg.YESNOCANCEL,
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    if (btn === 'yes') {
                        // prevCamp.store.sync();
                        me.getViewModel().getStore('campaigns').sync();
                        return newVal;
                    } else if (btn === 'no') {
                        me.getViewModel().getStore('campaigns').rejectChanges();
                        return newVal;
                    } else {
                        return;
                    }
                }
            });
        } else {
            return newVal;
        }
    }

    // initComponent: function () {
    //     var me = this;
    //     me.getViewModel().set('curUser')
    // }
});
