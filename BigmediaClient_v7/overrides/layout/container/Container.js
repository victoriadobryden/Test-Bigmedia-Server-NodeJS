Ext.define('Ext.overrides.layout.container.Container', {
  override: 'Ext.layout.container.Container',

  notifyOwner: function() {
    this.owner.afterLayout(this);
  }
});