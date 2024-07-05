Ext.define('Bigmedia.view.dialog.DlgOTSData',{
  extend: 'Bigmedia.view.dialog.MaterialDialog',

  xtype: 'dlgotsdata',

  requires: [
    'Ext.tree.Panel'
  ],

  viewModel: {
    reference : 'ots_analysis',
    data: {
      detsetOTSUpdate:false,
      detsetOTSDoors:false
    }
  },

  closeAction: 'hide',
  referenceHolder: true,
  title: 'Дані розподілення Аудиторії',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  tbar: [
    {
      xtype: 'button',
      text: 'Оновити дані',
      disabled : true,
      handler: function (btn) {
        var view = btn.up('window'),
            data = view.recalcOTSData().data;
        view.updateOTSData(data,view);
        view.getViewModel().set('detsetOTSDoors', false ); 
      },
      bind:{ 
        disabled: "{detsetOTSUpdate}"
      }
    },
    {
      xtype: 'button',
      text: 'Показники DOORS',
      disabled : false,
      handler: function (btn) {
        var view = btn.up('window'),
            data = { ages:[], groups:[], sex:[], doors: true };
        view.updateOTSData(data,view);
        // view.getViewModel().set('detsetOTSDoors', false );
      },
      bind:{ 
        disabled: "{detsetOTSDoors}"
      }
    }
  ],

  updateOTSData: function (data,view){
    var dcots = (+ new Date()).toString();
    // console.log(data);
    // console.log(dcots);
    fetch('/api/v1/heatinfoots?_dc=' + dcots, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then(data => {
        var fStore = Ext.getStore('Faces');
        console.log(data);
        fStore.beginUpdate();
        Ext.suspendLayouts();
        fStore.suspendEvents();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dcots + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          json.forEach(row => {
            var rec = fStore.getById(row.id_face);
            if (rec) { 
              rec.set('ots', row.ots);
              rec.set('grp', row.grp);
            } 
          })
        } catch (e) {
          // some
          console.log(e);
        } finally {
          fStore.resumeEvents();
          Ext.resumeLayouts(true);
          fStore.endUpdate();
          //view.close();
          // view.getViewModel().set('detsetOTSDoors', true );
        }
      });
      let dcmap = (+ new Date()).toString();
      fetch('/api/v1/heatinfoots/map?_dc=' + dcmap, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      })
      .then(response => response.json())
      .then(data => {
        var kspStore = Ext.getStore('KSPolygons');
          kspStore.beginUpdate();
          Ext.suspendLayouts();
          kspStore.suspendEvents();
          kspStore.removeAll();
        try {
          var bytes = CryptoJS.Rabbit.decrypt(data, dcmap + 'j8Z5f644XYePh4g7sEfE');
          decrypted = bytes.toString(CryptoJS.enc.Utf8);
          var json = JSON.parse(decrypted);
          json.forEach(row => {
            var rec = kspStore.getById(row.id);
              if (rec) { rec.set({
                  cnt_transit: row.cnt_transit
                });
              } else {
                kspStore.add(row);
              }
          })
        } catch (e) {
          // some
          console.log(e);
        } finally {
          kspStore.resumeEvents();
          Ext.resumeLayouts(true);
          kspStore.endUpdate();
          kspStore.fireEvent('endupdate');
          view.close();
         // view.getViewModel().set('detsetOTSDoors', true );
        }
      });
  },

  recalcOTSData: function () {
    var me = this,
      tPanel = me.lookup('treepanel'),
      records = tPanel.getChecked(),
      bttDisabled = false,
      data = {
        ages:[],
        groups:[],
        sex:[],
        daysOfWeek:[],
        doors: false
      }
      Ext.Array.each(records, function(rec) {
        // if(data[rec.get('group')]){
        //   data[rec.get('group')].push(rec.get('code'))
        // }
        
        if (data[rec.get('group')]) {
          data[rec.get('group')].push(rec.get('code'))
        } else {
          if (rec.get('group') == 'age') {
            data['ages'].push(rec.get('code'))
          }
          if (rec.get('group') == 'incomeLevel') {
            data['groups'].push(rec.get('code'))
          }         
        }
      });
      bttDisabled = data['ages'].length ==0 || data['groups'].length ==0 || data['sex'].length ==0 || data['daysOfWeek'].length==0 ;
      var result = {btOTS : bttDisabled, data: data};
      return result;
      // return bttDisabled;
  },

  items: [
    {
      xtype: 'treepanel',
      reference: 'treepanel',
      checkPropagation: 'both',
      rootVisible: false,
      width: '100%',
      flex: 1,
      store: 'OTSParamsTree',
      listeners: {
        checkchange: function (node, checked) {
          var view = this.up('window');
          var res = view.recalcOTSData();
          view.getViewModel().set('detsetOTSUpdate', res.btOTS );
        }
      }
    }
  ]
});
