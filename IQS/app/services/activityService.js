'use strict';
app.factory('activityService', ['$http', '$q', 'ngAuthSettings', '$rootScope', function ($http, $q, ngAuthSettings, $rootScope) {



    var serviceFactory = {};
    var _getDashboard = function (cid, mid) {

        var deferred = $q.defer();
        $http.get(serviceBase + 'odata/dashboard/total/' + cid + '/' + mid).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };
    var _getMenuHits = function (cid, uid, mid, top) {

        var deferred = $q.defer();
        $http.get(serviceBase + 'odata/menuhits/top/' + cid + '/' + uid + '/' + mid + '/' + top).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };
    var _getLastActivities = function (cid, mid, uid, top) {

        var deferred = $q.defer();
        $http.get(serviceBase + 'odata/useractivities/top/' + cid + '/' + mid + '/' + uid + '/' + top).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _getFlightsSummary = function (cid, date) {
        var _df = moment(date).format('YYYY-MM-DDTHH:mm:ss');
        var deferred = $q.defer();
        $http.get(serviceBase + 'odata/dashboard/flight/' + cid + '?date=' + _df).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _getIRAirports = function () {

        var deferred = $q.defer();
        $http.get(serviceBase + "odata/airports/all?$filter=CountryId eq 103 and IATA ne '-'").then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _save = function (entity) {

        var deferred = $q.defer();
        $http.post($rootScope.serviceUrl + 'odata/useractivities/save', entity).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };

    var _hitMenu = function (key, url, remark) {
        var entity = {
            Id: -1,
            Date: null,
            UserId: $rootScope.userId,
            Key: key,
            Url: url,
            ModuleId: $rootScope.moduleId,
            IsMain: 1,
            CustomerId: Config.CustomerId,
            Remark: remark,
        };
        _save(entity);
    };


    ///////////////Must move to cmsService///////////////////////////

    //////Hazard//////

    var apiCMS = 'http://localhost:9070/';
    var _get_hazard_list = function (id) {

        var deferred = $q.defer();
        $http.get(apiCMS + "api/cms/get/hazard/list").then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _get_hazard = function (id) {

        var deferred = $q.defer();
        $http.get(apiCMS + "api/cms/get/hazard/" + id).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _save_hazard = function (entity) {

        var deferred = $q.defer();
        $http.post(apiCMS + 'api/cms/save/hazard', entity).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };

    //////Occurrences////////

    var _get_occurrences_list = function (id) {

        var deferred = $q.defer();
        $http.get(apiCMS + "api/cms/get/occurrences/list").then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    var _get_asr = function (id) {

        var deferred = $q.defer();
        $http.get(apiCMS + "api/cms/get/asr/" + id).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;
    };

    ///////linking/////////
    var _link_hazard = function (entity) {

        var deferred = $q.defer();
        $http.post(apiCMS + 'api/cms/link/hazard/occurence', entity).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };


    var _remove_link_hazard = function (id) {

        var deferred = $q.defer();
        $http.post(apiCMS + 'api/cms/remove/link/hazard/occurence', id).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };
    var _get_list_linked = function (id) {

        var deferred = $q.defer();
        $http.get(apiCMS + 'api/cms/get/hazard/linked/' + id).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };


    var _save_hazard_risk = function (entity) {

        var deferred = $q.defer();
        $http.post(apiCMS + 'api/cms/save/hazard/risk', entity).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };
    var _list_hazard_risk = function (hid) {

        var deferred = $q.defer();
        $http.get(apiCMS + 'api/cms/list/hazard/risk/' + hid).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {

            deferred.reject(Exceptions.getMessage(err));
        });

        return deferred.promise;


    };

    //////////Safety Froms///////////

    var _getReferredList = function (referreId, type, entityId) {
        referredId = "4540";

        var deferred = $q.defer();
        $http.get(apiQA + 'api/qa/get/referred/' + referreId + '/' + type + '/' + entityId).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {
            deferred.reject(Exceptions.getMessage(err));
        })

        return deferred.promise;
    }

    var _getMORById = function (Id) {

        var deferred = $q.defer();
        $http.get(apiQA + 'api/get/mor/byid/' + Id).then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {
            deferred.reject(Exceptions.getMessage(err));
        })

        return deferred.promise;
    }

    var _getMORCompnSpec = function () {

        var deferred = $q.defer();
        $http.get(apiQA + 'api/get/mor/compnspec').then(function (response) {
            deferred.resolve(response.data);
        }, function (err, status) {
            deferred.reject(Exceptions.getMessage(err));
        })

        return deferred.promise;
    }

    

    serviceFactory.getIRAirports = _getIRAirports;
    serviceFactory.save = _save;
    serviceFactory.hitMenu = _hitMenu;
    serviceFactory.getMenuHits = _getMenuHits;
    serviceFactory.getLastActivities = _getLastActivities;
    serviceFactory.getDashboard = _getDashboard;
    serviceFactory.getFlightsSummary = _getFlightsSummary;
    //serviceFactory.delete = _delete;


    /////////////Must move to cmsService///////////////
    serviceFactory.get_hazard_list = _get_hazard_list;
    serviceFactory.get_hazard = _get_hazard;
    serviceFactory.save_hazard = _save_hazard;

    serviceFactory.get_occurrences_list = _get_occurrences_list;
    serviceFactory.get_asr = _get_asr;

    serviceFactory.link_hazard = _link_hazard;
    serviceFactory.remove_link_hazard = _remove_link_hazard;
    serviceFactory.get_list_linked = _get_list_linked;

    serviceFactory.save_hazard_risk = _save_hazard_risk;
    serviceFactory.list_hazard_risk = _list_hazard_risk;


    serviceFactory.getMORById = _getMORById;
    serviceFactory.getMORCompnSpec = _getMORCompnSpec;
    serviceFactory.getReferredList = _getReferredList;




    return serviceFactory;

}]);