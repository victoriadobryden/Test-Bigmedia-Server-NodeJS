Ext.define('Ext.overrides.Component', {
    override: 'Ext.Component',

    onDisable: function() {
        var me = this,
            dom, nodeName;

        if (me.focusable) {
            me.disableFocusable();
        }

        if (!me.ariaStaticRoles[me.ariaRole] && me.ariaEl.dom !== null) {
            me.ariaEl.dom.setAttribute('aria-disabled', true);
        }

        // Only mask if we're set to & nobody above us will do so
        if (me.maskOnDisable && !me.getInheritedConfig('disableMask', true)) {
            dom = me.el.dom;
            nodeName = dom.nodeName;

            if (me.disabledRe.test(nodeName)) {
                dom.disabled = true;
            }

            if (!me.nonMaskableRe.test(nodeName)) {
                me.mask();
            }
        }
    },

    onEnable: function() {
        var me = this,
            dom, nodeName;

        if (me.focusable) {
            me.enableFocusable();
        }

        if (!me.ariaStaticRoles[me.ariaRole] && me.ariaEl.dom !== null) {
            me.ariaEl.dom.setAttribute('aria-disabled', false);
        }

        if (me.maskOnDisable && me.getInherited().hasOwnProperty('masked')) {
            dom = me.el.dom;
            nodeName = dom.nodeName;

            if (me.disabledRe.test(nodeName)) {
                dom.disabled = false;
            }

            if (!me.nonMaskableRe.test(nodeName)) {
                me.unmask();
            }
        }
    },

    onShow: function() {
        var me = this;

        if (!me.ariaStaticRoles[me.ariaRole] && me.ariaEl.dom !== null) {
            me.ariaEl.dom.setAttribute('aria-hidden', false);
        }

        me.el.show();

        me.updateLayout({
            isRoot: false,
            context: me._showContext
        });

        // Constraining/containing element may have changed size while this Component was hidden
        if (me.floating) {
            if (me.maximized) {
                me.fitContainer();
            }
            else if (me.constrain) {
                me.doConstrain();
            }
        }
    }
});
