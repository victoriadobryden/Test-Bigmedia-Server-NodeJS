Ext.define('Bigmedia.view.user.UserContainerWrapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.user-usercontainerwrap',

    onSaveClick: function () {
        // console.log(this.getView().getSession());
        this.getViewModel().get('currentCampaign').save();
    }
});
