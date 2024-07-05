Ext.define('Bigmedia.view.cart.WinCoverage', {
    extend: 'Ext.window.Window',

    xtype: 'wincoverage',

    requires: [
        'Bigmedia.view.chart.CoverageInteractive'
    ],

    width: 600,
    height: 500,

    title: 'Coverage',
    iconCls: 'x-fa fa-line-chart',

    hidden: true,
    autoShow: false,
    alwaysOnTop: true,
    closeAction: "hide",
    layout: 'fit',
    items: [
        {
            xtype: 'chartscoverageinteractive',
            header: false,
            hideCitiesBar: false,
            bind: {
                facesStore: '{facesStore}',
                mapView: '{mapView}'
            }
        }
    ]
});
