Ext.define('Bigmedia.view.FacesViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.facesview',
    requires: [
        'Bigmedia.model.Base'
    ],
    stores: {
      selstore: {
        source: '{gridfaces}',
        filters: new Ext.util.Filter({
          id: 'filter_selected',
          filterFn: function () {
            return false
          }
        })
      },
    },
    data: {
      manualNoFiltered: false,
      filterPoi: false,
      buffer: 500,
      beforepoi: false,
      maximumfaces: null,
      filterPeriodDisabled: false,
      showKS: false
    }
});
