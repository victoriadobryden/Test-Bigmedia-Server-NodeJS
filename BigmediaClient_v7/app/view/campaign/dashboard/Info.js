Ext.define('Bigmedia.view.campaign.dashboard.Info', {
    extend: 'Ext.Component',
    xtype: 'campinfo',
    baseCls: 'campinfo-panel',

    border: false,
    height: 80,

    tpl: new Ext.XTemplate('<div class="campinfo-container"><i class="fa fa-info" aria-hidden="true"></i></div>',
         '<div class="campinfo-details-container">',
            "<div>{campName}</div>",
            "<div>{campStartDate:date('d.m.Y')}-{campEndDate:date('d.m.Y')}</div>",
         '</div>')
});
