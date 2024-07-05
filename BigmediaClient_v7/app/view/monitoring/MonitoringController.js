Ext.define('Bigmedia.view.monitoring.MonitoringController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoring-grid-controller',
    requires: [
        'Ext.window.MessageBox'
    ],
    controller: 'monitoring-grid-controller',

    init: function (args) {
        var me = this;
        me.callParent(args);
        grid = me.lookupReference('DataMonitoring')
    },
    // updateInspection:function(value) {
    //     console.log('updateInspection insp--->>',value)
    //     this.inspection = value;
    // },
    // setInspection:function (insp) {
    //     console.log('setInspection insp--->>',insp)
    // },
    onGridShow: function (grid) {
        console.log('onGridShow grid',grid)
        var me = this;
        // grid = me.lookupReference('Monitoring')
        // me.callParent(view);
        // grid = me.lookupReference('DataMonitoring'),
        // store = Ext.getStore('DataMonitoring');
    },

    onGridLoad: function (grid) {
        var me = this
        // mapView = me.lookupReference('onGridLoad grid',grid),
        // vm = me.getViewModel();
        console.log('onGridLoad grid',grid)
        //console.log('vm-->', vm)
        // console.log('mapView -->',mapView);
    },
    bindings: {
        // onShow
        onUpdateStore: '{DataMonitoring}',
        onLoadMonitoringInspection:'{idIns}'
    //     // onCampPoisChange: '{curCamp.campPois}'
    },
    onUpdateStore: function (store) {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            store = view.getStore(),
            gridMonitoring = vm.get('gridMonitoring');
            //vm.set('gridMonitoring',store);
        // console.log('Store-->', store)
        // console.log('gridMonitoring-->', gridMonitoring)
    //         // grid2 = me.getView(),
    //         // grid = me.lookupReference('DataMonitoring'),
    //         // vm = me.getViewModel();

    //     // console.log('gridMonitoring-->', grid)
    //     // console.log('me.getView-->', grid2)
    //     // console.log('vm-->', vm)
    //     // grid.on('selectionchange', function (selModel, selected) {
    //     //     console.log(selModel, selected);
    //     //     //   selStore.addFilter(new Ext.util.Filter({
    //     //     //     id: 'filter_selected',
    //     //     //     filterFn: function (face) {
    //     //     //       return selected.find((f) => f.getId() === face.getId())
    //     //     //     }
    //     //     //   }));
    //     // });
    // },
    // onRowClick: function (grid, record) {
    //     var me = this,
    //         view = me.getView()
    //     // detFace = view.getDetFace();
    //     // detFace = view.lookup('detface');
    //     // console.log(detFace);
    //     console.log('rowclick');
    //     // if (detFace) {
    //     // detFace.setFace(record);
    //     // }
    // },
    // onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
    //     //this.redirectTo('face/3345', true);
    //     var mv = this.getView().findParentByType('mainviewport');
    //     console.log('onDoubleClick',mv);
    //     // if (mv) {
    //     //     mv.detFace.showFace(record.getId());
    //     // }
    },
    onLoadMonitoringInspection: function(id,cb){
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            dm = Ext.getStore('DataMonitoring');
        view.mask('Please wait...');
        dm.load({params: {MonitoringId:encodeURIComponent(id)}});
        view.unmask();        
    },
    // showSelectedOnlyToggle: function (btn, pressed) {
    //     console.log('showSelectedOnlyToggle');
    //     // var me = this,
    //     //     grid = me.getView(),
    //     //     store = grid.getStore();
    //     // // console.log('pressed',pressed)
    //     // if (pressed) {
    //     //     store.removeFilter('filterselected', true);
    //     //     var ids = grid.getSelectionModel().getSelection().map(function (item) {
    //     //         return item.id;
    //     //     });
    //     //     var fltr = new Ext.util.Filter({
    //     //         property: 'id',
    //     //         id: 'filterselected',
    //     //         operator: 'in',
    //     //         value: ids
    //     //     });
    //     //     store.addFilter(fltr);
    //     // } else {
    //     //     store.removeFilter('filterselected');
    //     // }
    // },
    // onDoubleClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
    //     console.log('onDoubleClick');
    //     //this.redirectTo('face/3345', true);
    //     // var mv = this.getView().findParentByType('mainviewport');
    //     // if (mv) {
    //     //     mv.detFace.showFace(record.getId());
    //     // }
    // },
    // showToast: function (s, title) {
    //     console.log('showToast--->',s, title);
    //     Ext.toast({
    //         html: s,
    //         //title: title,
    //         closable: false,
    //         align: 't',
    //         slideInDuration: 400,
    //         minWidth: 400
    //     });
    // },
    onDateRangePeriodChanged: function(period){
        var me = this,
            vm = me.getViewModel(),
            curMonitoring = vm.get('curMonitoring'),
            oldId = curMonitoring.get('id');
        if (!curMonitoring.get('periods')) {
            console.log('Error Load data');
        } else{
            var periods = curMonitoring.get('periods'),
                RecId = 
                    (period.startDate < curMonitoring.get('minDate')) ? periods[0] 
                    :(period.endDate > curMonitoring.get('maxDate')) ? periods[periods.length-1]
                    :periods.find((d)=> d.periodYear == period.startDate.getFullYear() && d.periodMonth == period.startDate.getMonth());
            
            period.startDate=RecId.startDate;
            period.endDate=RecId.endDate;
            if(oldId != RecId.id ){
                curMonitoring.set('id',RecId.id );
                curMonitoring.set('startDate',RecId.startDate );
                curMonitoring.set('endDate', RecId.endDate );
                curMonitoring.set('name', RecId.name );
                me.onLoadMonitoringInspection(RecId.id);
              }
        }
    },
    destroy: function () {
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
        Ext.Msg.hide();
        this.callParent();
    }
})