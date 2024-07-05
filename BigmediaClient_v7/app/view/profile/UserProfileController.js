Ext.define('Bigmedia.view.profile.UserProfileController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userprofile',

    init: function () {
        var me = this;
        Bigmedia.Vars.on('userchanged', me.onUserChanged, me);
        me.callParent();

        if (Bigmedia.Vars.getUser()) {
            me.getViewModel().set('theGroup', Bigmedia.Vars.getDefaultRulesGroup());
        }

        me.getViewModel().bind({
            bindTo: '{theGroup}'
        }, function(v) {
            me.onGroupChanged(v);
        });
    },

    onUserChanged: function (user) {
        this.getViewModel().set('theGroup', Bigmedia.Vars.getDefaultRulesGroup());
    },

    onGroupChanged: function (group) {
        if (!Bigmedia.Vars.getUser()) {
            return;
        }
        if (group !== Bigmedia.Vars.getDefaultRulesGroup()) {
            Bigmedia.Vars.setDefaultRulesGroup(group);
        }
    }
    // TODO - Add control logic or remove if not needed
});
