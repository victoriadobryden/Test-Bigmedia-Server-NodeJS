// importScripts('ol/turf.min.js');
// importScripts('ol/jsts.min.js');

var algorithms = ['MinPrice', 'MaxGRPDivPrice', 'MaxCoverage'];

var workers = [],
    busyWorkers = [],
    freeWorkers = [],
    nextId = 0;

var queryableFunctions = {
    processAutoPlan: function (source, cities, params) {
        processAutoPlan(source, cities, params);
    },

    stopAll: function () {
        stopAll();
    }
};

function getNextId () {
    return nextId++;
}

function getCityWorker () {
    var worker = freeWorkers.pop();
    if (!worker) {
        worker = new QueryableWorker('plancity.min.js');
        worker.addListener('algorithmCompleted', algorithmCompleted);
        workers.push(worker);
    }
    return worker;
}

// system functions

function defaultReply(message) {
    // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
    // do something
}

function reply() {
    if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
    postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

onmessage = function(oEvent) {
    if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
        queryableFunctions[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
    } else {
        defaultReply(oEvent.data);
    }
};

cityPrepared = function (cityId, faces, initial, wid) {
    reply('cityPrepared', cityId, faces, initial);
    busyWorkers = busyWorkers.filter(function(w){return w !== this.pWorker;});
    algorithms.forEach(function(a){
        var cityPlanner = getCityWorker();
        busyWorkers.push(cityPlanner);
        cityPlanner.sendQuery('getFacesByAlgorithm', this.cities[cityId], a, faces, this.params, initial);
    });
};

// getInitialCampaignByCityId = function (cityId) {
//     if (!this.params.initialCampaign) {
//         return null;
//     }
//     return this.params.initialCampaign.filter(function(face){ return (face.id_city === cityId);});
// };

algorithmCompleted = function (cityId, algorithm, faces, worker) {
    reply('algorithmCompleted', cityId, algorithm, faces);
    busyWorkers = busyWorkers.filter(function(w){return w!==worker;});
    freeWorkers.push(worker);
};

function stopAll () {
    while (busyWorkers.length > 0) {
        var worker = busyWorkers.pop();
        worker.terminate();
        if (worker === this.pWorker) {
            this.pWorker = null;
        }
    }
    reply('terminated');
}

function processAutoPlan (source, cities, params) {
    this.params = params;
    this.cities = cities;
    if (!this.pWorker) {
        this.pWorker = new QueryableWorker('prepare.min.js');
        this.pWorker.wid = getNextId();
        this.pWorker.addListener('cityCompleted', cityPrepared);
        busyWorkers.push(pWorker);
        workers.push(pWorker);
    }
    this.pWorker.sendQuery('prepareFaces', source, cities, params);
}

function QueryableWorker (url, defaultListener, onError) {
    var instance = this,
    worker = new window.Worker(url),
    listeners = {};

    this.wid = getNextId();

    worker.wrapper = this;

    this.defaultListener = defaultListener || function() {};

    if (onError) {worker.onerror = onError;}

    this.postMessage = function(message) {
        worker.postMessage(message);
    }

    this.terminate = function() {
        worker.terminate();
    }

    this.addListener = function(name, listener) {
        listeners[name] = listener;
    }

    this.removeListener = function(name) {
        delete listeners[name];
    }

    /*
    This functions takes at least one argument, the method name we want to query.
    Then we can pass in the arguments that the method needs.
    */
    this.sendQuery = function() {
        if (arguments.length < 1) {
            throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
            return;
        }
        worker.postMessage({
            'queryMethod': arguments[0],
            'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
        });
    }

    worker.onmessage = function(event) {
        if (event.data instanceof Object &&
            event.data.hasOwnProperty('queryMethodListener') &&
            event.data.hasOwnProperty('queryMethodArguments')) {
                listeners[event.data.queryMethodListener].apply(instance, event.data.queryMethodArguments.concat(this.wrapper));
            } else {
                this.defaultListener.call(instance, event.data);
            }
    }
}
