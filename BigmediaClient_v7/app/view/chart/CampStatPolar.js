Ext.define('Bigmedia.view.chart.CampStatPolar', {
    extend: 'Ext.chart.PolarChart',
    xtype: 'campstatpolar',

    theme: 'default-gradients',
    // flex: 1,
    width: '100%',
    insetPadding: 0,
    innerPadding: 10,
    legend: false,
    // {
    //     // type: 'dom',
    //     docked: 'right',
    // },
    interactions: ['rotate'], //, 'itemhighlight'
    series: [
        {
            type: 'pie',
            angleField: 'budget',
            // bind: {
            //     hidden: '{angleField!="budget"}'
            // },
            donut: 80,
            colors: ['#94ae0a',
            '#115fa6',
            '#a61120',
            '#ff8809',
            '#ffd13e',
            '#a61187',
            '#24ad9a',
            '#7c7474',
            '#a66111'],
            label: {
                field: 'label',
                calloutLine: {
                    length: 60,
                    width: 3
                    // specifying 'color' is also possible here
                }
            },
            // highlight: true,
            tooltip: {
                trackMouse: true,
                renderer: function (tooltip, record, item) {
                    var xVal = record.get('label');
                    tooltip.setHtml(xVal + ' - ' +
                    record.get(item.field));
                }
            }
        },
        {
            type: 'pie',
            angleField: 'count',
            radiusFactor: 70,
            donut: 20,
            showInLegend: false,
            // bind: {
            //     hidden: '{angleField!="quantity"}'
            // },
            colors: ['#94ae0a',
            '#115fa6',
            '#a61120',
            '#ff8809',
            '#ffd13e',
            '#a61187',
            '#24ad9a',
            '#7c7474',
            '#a66111'],
            label: {
                field: 'label'
            //     calloutLine: {
            //         length: 60,
            //         width: 3
            //         // specifying 'color' is also possible here
            //     }
            },
            // highlight: true,
            tooltip: {
                trackMouse: true,
                renderer: function (tooltip, record, item) {
                    var xVal = record.get('label');
                    tooltip.setHtml(xVal + ' - ' +
                    record.get(item.field));
                }
            }
        }
    ]
});
