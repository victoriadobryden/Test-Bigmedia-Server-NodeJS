Ext.define("Bigmedia.AutoPlan", {
    mixins: ['Ext.mixin.Observable'],

    required: [
        'Bigmedia.Vars'
    ],

    singleton: true,

    algorithms: ['MinPrice', 'MaxGRPDivPrice', 'MaxCoverage'],

    workers: [],
    busyWorkers: [],
    freeWorkers: [],
    nextId: 0,

    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
    },

    listeners: {
        start: function (source, cities, params) {
            var me = this;
            me.startAutoPlan(source, cities, params);
        },
        stop: function () {
            var me = this;
            me.stopAll();
        }
    },

    startAutoPlan: function (source, cities, params) {
        var me = this;
        me.params = params;
        me.cities = cities;
        if (!me.pWorker) {
            me.pWorker = new me.QueryableWorker(me, 'packages/local/autoplan/prepare.min.js?ver=' + Bigmedia.appVersion);
            me.pWorker.wid = me.getNextId();
            me.pWorker.addListener('citycompleted', me.cityPrepared);
            // me.busyWorkers.push(me.pWorker);
            // me.workers.push(me.pWorker);
        }
        me.pWorker.sendQuery('prepareFaces', source, cities, params);
    },

    getNextId: function () {
        return this.nextId++;
    },

    getCityWorker: function () {
        var me = this,
            worker = me.freeWorkers.pop();
        if (!worker) {
            worker = new me.QueryableWorker(me, 'packages/local/autoplan/plancity.min.js?ver=' + Bigmedia.appVersion);
            worker.addListener('algorithmcompleted', me.algorithmCompleted);
            me.freeWorkers.push(worker);
            me.workers.push(worker);
        }
        return worker;
    },

    cityPrepared: function (cityId, faces, initial, wid) {
        var me = this;
        if (me.stopped) {
            return;
        }
        me.fireEventArgs('cityprepared', [cityId, faces], me);
        // me.busyWorkers = me.busyWorkers.filter(function(w){return w !== me.pWorker;});
        me.busyWorkers.splice(me.busyWorkers.indexOf(me.pWorker), 1);
        me.algorithms.forEach(function (a) {
            var cityPlanner = me.getCityWorker();
            me.freeWorkers.splice(me.freeWorkers.indexOf(cityPlanner), 1);
            cityPlanner.sendQuery('getFacesByAlgorithm', me.cities[cityId], a, faces, me.params, initial);
            me.busyWorkers.push(cityPlanner);
        });
    },

    algorithmCompleted: function (cityId, algorithm, faces, worker) {
        var me = this;
        if (me.stopped) {
            return;
        }
        me.busyWorkers.splice(me.busyWorkers.indexOf(worker), 1);
        me.freeWorkers.push(worker);
        me.fireEventArgs('algorithmcompleted', [cityId, algorithm, faces], me);
        // me.busyWorkers = me.busyWorkers.filter(function(w){return w !== worker;});
    },

    stopAll: function () {
        var me = this;
        me.stopped = true;
        me.pWorker.terminate();
        delete me.pWorker;
        while (me.busyWorkers.length > 0) {
            var worker = me.busyWorkers.pop();
            worker.terminate();
            // if (worker !== this.pWorker) {
            // this.pWorker = null;
            // me.freeWorkers.push(worker);
            // }
        }
        me.stopped = false;
        me.fireEvent('terminated', me);
        // console.log([me.freeWorkers, me.pWorker, me.workers, me.busyWorkers]);
    },

    QueryableWorker: function (handler, url, defaultListener, onError) {
        var me = this,
            worker = new window.Worker(url);
        me.listeners = {};

        me.handler = handler;

        me.wid = handler.getNextId();

        me.defaultListener = defaultListener || function () { };

        if (onError) { worker.onerror = onError; }

        me.postMessage = function (message) {
            worker.postMessage(message);
        }

        me.terminate = function () {
            // me.listeners = {};
            worker.terminate();
        }

        me.addListener = function (name, listener) {
            me.listeners[name] = listener;
        }

        me.removeListener = function (name) {
            delete me.listeners[name];
        }

        me.sendQuery = function () {
            if (arguments.length < 1) {
                throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
                return;
            }
            worker.postMessage({
                'queryMethod': arguments[0],
                'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
            });
        }

        worker.onmessage = function (event) {
            if (event.data instanceof Object &&
                event.data.hasOwnProperty('queryMethodListener') &&
                event.data.hasOwnProperty('queryMethodArguments')) {
                me.listeners[event.data.queryMethodListener].apply(me.handler, event.data.queryMethodArguments.concat(me));
            } else {
                me.defaultListener.call(me.handler, event.data);
            }
        }
    }
});
