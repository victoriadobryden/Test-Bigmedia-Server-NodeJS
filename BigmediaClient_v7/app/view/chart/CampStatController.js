Ext.define('Bigmedia.view.chart.CampStatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.campstat',

    initViewModel: function (vm) {
        var me = this;
        // console.log('initViewModel');
        // console.log(vm.get('srcStore'));
        // vm.getStore('srcStore').on('datachanged', me.sourceDataChanged, me);
        vm.bind({
            bindTo: '{srcStore}'
        },
        function (store) {
            me.recalcStores(store);
            if (store) {
                store.on('datachanged', me.sourceDataChanged, me);
            }
            // console.log('x: ' + x); // only called once
        });
    },

    recalcStores: function (source, city) {
        var me = this,
            vm = me.getViewModel(),
            store = source || vm.get('campStore'),
            groups = {cities: {}, sizes: {}, catabs: {}, networks:{}, zones: {}, suppliers: {}};
        if (!store) {
            vm.get('campByCities').removeAll();
            vm.get('campBySizes').removeAll();
            vm.get('campByCatabs').removeAll();
            vm.get('campByNetworks').removeAll();
            vm.get('campByZones').removeAll();
            vm.get('campBySuppliers').removeAll();
            return;
        }
        store.each(function(face){
            if (!city || face.get('city') == city) {
                me.addItemToGroup(groups.cities, 'city', face);
                me.addItemToGroup(groups.sizes, 'size', face);
                me.addItemToGroup(groups.catabs, 'catab', face);
                me.addItemToGroup(groups.networks, 'network', face);
                me.addItemToGroup(groups.zones, 'zone', face);
                me.addItemToGroup(groups.suppliers, 'supplier', face);
            }
        });
        if (!city) {
            vm.get('campByCities').loadData(me.getGroupData(groups, 'cities'));
        }
        vm.get('campBySizes').loadData(me.getGroupData(groups, 'sizes'));
        vm.get('campByCatabs').loadData(me.getGroupData(groups, 'catabs'));
        vm.get('campByNetworks').loadData(me.getGroupData(groups, 'networks'));
        vm.get('campByZones').loadData(me.getGroupData(groups, 'zones'));
        vm.get('campBySuppliers').loadData(me.getGroupData(groups, 'suppliers'));
    },

    getGroupData: function (groups, field) {
        return Object.keys(groups[field]).reduce(function(res, key){ var item = groups[field][key]; res.push({label: item.name, budget: item.budget, count: item.count}); return res},[]);
    },

    addItemToGroup: function (group, fieldName, face) {
        if(! group[face.get(fieldName)]) {
            group[face.get(fieldName)] = {name: face.get(fieldName), budget: face.get('finalPrice'), count: 1};
        } else {
            group[face.get(fieldName)].budget += face.get('finalPrice');
            group[face.get(fieldName)].count++;
        }
    },

    sourceDataChanged: function (source) {
        var me = this;
        me.recalcStores(source);
    },

    onCityItemHighlight: function (chart, cityItem) {
        var me = this,
            vm = me.getViewModel();
        // vm.set('selectedCity', cityItem.record);
        // console.log([me, vm, vm.get('campStore')]);
        me.recalcStores(vm.get('srcStore'), cityItem.record.get('label'));
        // me.updateCity(cityItem.record.getId(), cityItem.record.get('value'));
    }

});
