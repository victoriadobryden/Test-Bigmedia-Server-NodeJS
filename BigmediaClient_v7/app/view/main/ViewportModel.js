Ext.define('Bigmedia.view.main.ViewportModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.mainviewport',

  requires: [
    'Bigmedia.Vars'
  ],

  stores: {
    campaigns: {
      model: 'Campaign',
      autoLoad: true,
      // listeners: {
      //   datachanged: me.onCampaignsStoreChange,
      //   // load: me.onCampaignsStoreChange,
      //   scope: me
      // },
      storeId: 'Campaigns'
      // listeners: {
      //   write: function (store) {
      //     // console.log('write event');
      //     store.reload();
      //   }
      // }
    },
    gridfaces: {
      type: 'faces',
      id: 'Faces',
      statefulFilters: true,
      listeners: {
      }
    },
    proposals: {
      source: '{curCamp.proposals}'
    },
    pois: {
      source: '{curCamp.campPois}'
    },
    periodMonitoring: {
      model: 'PeriodMonitoring',
      type: 'periodMonitoring',
      storeId: 'periodMonitoring',
      statefulFilters: true,
    },
    gridMonitoring: {
      //source:'{curMonitoring.dataMonitoring}',
      source:'MonitoringData',
      model: 'MonitoringData',
      type: 'DataMonitoring',
      storeId: 'DataMonitoring',
      statefulFilters: true,
    }
    
  },
  formulas: {
    curCamp: {
      get: function (get) {
        if (!get('currentCampaign')) {
          var newCamp = Ext.getStore('Campaigns').add({})[0];
          this.set({currentCampaign: newCamp});
        } else {
          return get('currentCampaign');
        }
      },
      set: function (v) {
        this.set({currentCampaign: v});
      }
    },
    curMonitoring:{
      get: function(get){
        if (!get('currentMonitoring')) {
          var me = this; 
          var monitStore = Ext.getStore('periodMonitoring').add({})[0];
          this.set({currentMonitoring: monitStore});
          var monitStoreLoad = Ext.getStore('periodMonitoring');
          monitStoreLoad.load({
            callback: function(records, operation, success) {
              if (success == true) {                
                var data=[],minDate,maxDate;
                for(var i=0; i< records.length; i++) {
                  data.push(records[i].data);
                  if (i==0){
                    minDate=records[i].data.startDate;
                    maxDate=records[i].data.endDate;
                  } else{
                    minDate = (records[i].data.startDate < minDate) ? records[i].data.startDate : minDate;
                    maxDate = (records[i].data.endDate   > maxDate) ? records[i].data.endDate   : maxDate;
                  }
                }
                var RecordId = records.length-1;
                // var RecordId = 0;
                monitStore.set('id',data[RecordId].id);
                monitStore.set('name',data[RecordId].name);
                monitStore.set('minDate',minDate);
                monitStore.set('maxDate',maxDate);
                monitStore.set('startDate',data[RecordId].startDate);
                monitStore.set('endDate',data[RecordId].endDate);
                monitStore.set('periods',data);
                me.set({ currentMonitoring: monitStore });
              } else {
                console.warn('Error Connection to Store');
              }
            }
          });
        } else {
          return get('currentMonitoring');
        }
      },
      set: function(v){
        console.log('currentMonitoring -->  v -->',v)
        this.set({currentMonitoring: v});
      }
    },
    pubCamp: {
      get: function (get) {
        return get('publishedCampaign');
      },
      set: function (v) {
        // restrictedArea.setPubCamp(v);
        this.set({publishedCampaign: v});
      }
    },
    curCampDirty: function (get) {
      if (get('currentCampaign')) {
        return get('currentCampaign').dirty || get('currentCampaign').phantom;
      }
    },
    curCampValid: function (get) {
      if (get('currentCampaign')) {
        return get('currentCampaign').isValid();
      }
    },
    userLoggedIn: function (get) {
      return !!get('user') && get('user').get('id') !== 'anonymous';
    },
    visiblePrice: function (get) {
      return get('userLoggedIn');
    }
  },
  data: {
    currentCampaign: null,
    publishedCampaign: null,
    currentMonitoring: null,
    filterStart: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+1, 1)),
    filterEnd: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
    currentView: null,
    beforeLoginRouteId: null,
    targetLoginRouteId: null,
    user: null,
    persistentViews: {},
    discountGroup: null,
    useEncryption: false,
    showMonitoring: false,
    savePrice: true
  }
});
