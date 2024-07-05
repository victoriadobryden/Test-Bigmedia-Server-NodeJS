Ext.define('Bigmedia.view.dialog.DlgKyivstarData',{
  extend: 'Bigmedia.view.dialog.MaterialDialog',

  xtype: 'dlgksdata',

  requires: [
    'Ext.tree.Panel'
  ],

  viewModel: {
    data: {

    }
  },

  closeAction: 'hide',
  referenceHolder: true,
  title: 'Дані Kyivstar',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  tbar: [
    {
      xtype: 'button',
      text: 'Завантажити дані',
      handler: function (btn) {
        var view = btn.up('window'),
          tPanel = view.lookup('treepanel'),
          formPanel = detPublished.lookupReference('windowForm'),
          form = formPanel.getForm(),
          vm = detPublished.getViewModel();

        var records = tPanel.getChecked();
        var data = {
          daysOfWeek: [],
          hours: [],
          groups: []
        }
        var ages = [], levels = [], columns = [], considerMarketShare = false, calculatePerMonth = false;
        Ext.Array.each(records, function(rec) {
          if (data[rec.get('group')]) {
            data[rec.get('group')].push(rec.get('code'))
          } else {
            if (rec.get('group') == 'age') {
              ages.push(rec.get('code'))
            }
            if (rec.get('group') == 'incomeLevel') {
              levels.push(rec.get('code'))
            }
            if (rec.get('group') == 'columns') {
              columns.push(rec.get('code'));
            }
            if (rec.get('code') == 'considermarketshare') {
              considerMarketShare = true;
            }
          }
        });

        ages.forEach((a) => {
          levels.forEach((l, i) => {
            data.groups.push(a + ' ' + l);
          });
        });

        fetch('/api/v1/ksdata', {
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
            fStore.beginUpdate();
            Ext.suspendLayouts();
            fStore.suspendEvents();
            try {
              data.forEach(row => {
                var rec = fStore.getById(row.id_face);
                if (rec) {
                  rec.set({
                    cnt_only_home: row.cnt_only_home,
                    cnt_only_work: row.cnt_only_work,
                    cnt_home_work: row.cnt_home_work,
                    cnt_transit: row.cnt_transit,
                    cnt_all_subs: row.cnt_all_subs,
                    cnt_home_general: row.cnt_home_general,
                    cnt_work_general: row.cnt_work_general
                  });
                }
              })
              view.recalcKSData();
            } catch (e) {
              // some
            } finally {
              fStore.resumeEvents();
              Ext.resumeLayouts(true);
              fStore.endUpdate();
            }
          });

          fetch('/api/v1/ksdata/polygons', {
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
              try {
                data.forEach(row => {
                  var rec = kspStore.getById(row.id);
                  if (rec) {
                    rec.set({
                      cnt_transit_male: row.cnt_transit_male,
                      cnt_transit_female: row.cnt_transit_female,
                      cnt_transit: row.cnt_transit
                    });
                  } else {
                    kspStore.add(row);
                  }
                })
                // view.recalcKSData();
              } catch (e) {
                // some
                console.error(e);
              } finally {
                kspStore.resumeEvents();
                Ext.resumeLayouts(true);
                kspStore.endUpdate();
                kspStore.fireEvent('endupdate');
              }
            });
      }
    }
  ],

  recalcKSData: function () {
    var me = this,
      tPanel = me.lookup('treepanel');
    var records = tPanel.getChecked();
    var columns = [], considerMarketShare = false;
    Ext.Array.each(records, function(rec) {
      if (rec.get('group') == 'columns') {
        columns.push(rec.get('code'));
      }
      if (rec.get('code') == 'considermarketshare') {
        considerMarketShare = true;
      }
    });
    var fStore = Ext.getStore('Faces');
    fStore.beginUpdate();
    Ext.suspendLayouts();
    fStore.suspendEvents();
    try {
      fStore.getDataSource().each((rec) => {
        var ks = columns.reduce( (sum, c) => { return sum + (+rec.get(c))}, 0);
        if (considerMarketShare) {
          ks = Math.round(ks / 0.45)
        }
        if (!ks) {
          ks = null;
        }
        rec.set('ks', ks);
      })
    } catch (e) {
      console.error(e);
      // some
    } finally {
      fStore.resumeEvents();
      Ext.resumeLayouts(true);
      fStore.endUpdate();
    }
  },

  items: [
    {
      xtype: 'treepanel',
      reference: 'treepanel',
      checkPropagation: 'both',
      rootVisible: false,
      width: '100%',
      flex: 1,
      store: 'KSParamsTree',
      listeners: {
        checkchange: function (node, checked) {
          var view = this.up('window');
          if (node.get('group') == 'sex' || node.get('group') == 'columns' || node.get('code') == 'considermarketshare') {
            view.recalcKSData();
          }
        }
      }
    }
  ]
});
