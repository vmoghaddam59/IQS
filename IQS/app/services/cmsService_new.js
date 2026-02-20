'use strict';
app.factory('cmsService', ['$http', '$q', 'ngAuthSettings', '$rootScope',
    function ($http, $q, ngAuthSettings, $rootScope) {

        var api_cms = 'http://localhost:9070/';
        var serviceFactory = {};
        var token = "-";
        var _get_audit_hub = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/hub').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_hubs = _get_audit_hub;

        // Audit programs list (for Hub)
        var _get_audit_programs = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/programs').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_programs = _get_audit_programs;

        var _get_audit_program_detail = function (programId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/program/' + programId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_program_detail = _get_audit_program_detail;
        var _save_audit_program = function (entity) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/save/audit/program', entity).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.save_audit_program = _save_audit_program;

        var _get_audit_program_items = function (programId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/program/items/' + programId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_program_items = _get_audit_program_items;

        // ✅ FIX: Create audit from plan item (route مطابق بک‌اند: api/cms/audits/from-plan/{planItemId})
        //var _create_audit_from_program_item = function (dto) {
        //    var deferred = $q.defer();

        //    // کمترین حدس ممکن برای planItemId
        //    var planItemId =
        //        (dto && (dto.plan_item_id || dto.audit_plan_id || dto.planId || dto.id)) || 0;

        //    $http.post(api_cms + 'api/cms/audits/from-plan/' + planItemId, dto).then(function (response) {
        //        deferred.resolve(response.data);
        //    }, function (err) {
        //        deferred.reject(Exceptions.getMessage(err));
        //    });

        //    return deferred.promise;
        //};
        //serviceFactory.create_audit_from_program_item = _create_audit_from_program_item;


        var _create_audit_from_plan = function (planId, dto) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/audits/from-plan/' + planId, dto).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.create_audit_from_plan = _create_audit_from_plan;

        

        // ✅ NEW: get audits by plan (for multi-audit per plan)
        // route (backend option A): api/cms/get/audits/by-plan/{planId}
        var _get_audits_by_plan = function (planId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audits/by-plan/' + planId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audits_by_plan = _get_audits_by_plan;

        // ✅ Helper: create draft audit from plan, then reload audits list for that plan
        var _create_audit_from_plan_and_reload = function (planId, dto) {
            var deferred = $q.defer();

            _create_audit_from_plan(planId, dto).then(function (res) {
                if (!res || !res.IsSuccess) {
                    deferred.resolve(res);
                    return;
                }

                _get_audits_by_plan(planId).then(function (listRes) {
                    deferred.resolve({
                        IsSuccess: true,
                        Data: res.Data,          // {id, code}
                        DataExtra: {
                            audits: (listRes && listRes.Data) ? listRes.Data : []
                        }
                    });
                }, function (err2) {
                    // create succeeded, but reload failed
                    deferred.resolve({
                        IsSuccess: true,
                        Data: res.Data,
                        DataExtra: { audits: [], reload_error: err2 }
                    });
                });

            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };
        serviceFactory.create_audit_from_plan_and_reload = _create_audit_from_plan_and_reload;
// ---- بقیه متدها دست نخورده ----

        var _cancel_audit_program_item = function (itemId) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/cancel/audit/program/item/' + itemId, {}).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.cancel_audit_program_item = _cancel_audit_program_item;

        var _lock_audit_program = function (programId) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/lock/audit/program/' + programId, {}).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.lock_audit_program = _lock_audit_program;

        var _export_audit_program = function (programId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/export/audit/program/' + programId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.export_audit_program = _export_audit_program;

        var _get_reports = function (df, dt, type, register, flight_id) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/reports/' + token + '?df=' + df + '&dt=' + dt + '&type=' + type + '&register=' + register + '&flight_id=' + flight_id).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_reports = _get_reports;

        var _get_auditors = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/auditors').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_auditors = _get_auditors;

        var _get_locations = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/locations').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_locations = _get_locations;

        var _get_auditees = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/auditees').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_auditees = _get_auditees;

        var _get_audit_plan_form = function (planId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/plan/form/' + planId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_plan_form = _get_audit_plan_form;

        var _save_audit_plan = function (dto) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/save/audit/plan', dto).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.save_audit_plan = _save_audit_plan;

        var _get_audits = function (params) {
            var deferred = $q.defer();

            params = params || {};
            var qs = [];

            if (params.program_id) qs.push('program_id=' + encodeURIComponent(params.program_id));
            if (params.status) qs.push('status=' + encodeURIComponent(params.status));
            if (params.q) qs.push('q=' + encodeURIComponent(params.q));
            if (params.df) qs.push('df=' + encodeURIComponent(params.df));
            if (params.dt) qs.push('dt=' + encodeURIComponent(params.dt));

            var url = api_cms + 'api/cms/get/audits' + (qs.length ? ('?' + qs.join('&')) : '');

            $http.get(url).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });

            return deferred.promise;
        };
        serviceFactory.get_audits = _get_audits;

        var _get_audit = function (id) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/' + id).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit = _get_audit;


        var _get_audit_lookups = function (id) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/lookups' ).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_lookups = _get_audit_lookups;

        var _transition_audit = function (audit_id,dto) {
            var deferred = $q.defer();
           // console.log('----action---', action);
            $http.post(api_cms + 'api/cms/audit/' + audit_id + '/transition', dto).then(function (response) {
              
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.transition_audit = _transition_audit;
        var _save_audit = function (entity) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/save/audit', entity).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.save_audit = _save_audit;


        var _get_finding = function (id) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/finding/' + id).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_finding = _get_finding;

        var _get_ref_docs = function () {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/ref/docs').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_ref_docs = _get_ref_docs;

        var _get_ref_clauses = function (docId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/ref/clauses/' + docId).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_ref_clauses = _get_ref_clauses;
        var _add_audit_ref = function (auditId, dto) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/add/audit/' + auditId + '/ref', dto).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.add_audit_ref = _add_audit_ref;

        var _delete_audit_ref = function (refId) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/delete/audit/ref/' + refId, {}).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.delete_audit_ref = _delete_audit_ref;

        var _get_audit_refs = function (auditId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/' + auditId + '/refs').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_audit_refs = _get_audit_refs;

        var _get_plan_refs = function (planId) {
            var deferred = $q.defer();
            $http.get(api_cms + 'api/cms/get/audit/plan/' + planId + '/refs').then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.get_plan_refs = _get_plan_refs;

        var _add_plan_ref = function (planId, dto) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/add/audit/plan/' + planId + '/ref', dto).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.add_plan_ref = _add_plan_ref;

        var _delete_plan_ref = function (refId) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/delete/audit/plan/ref/' + refId, {}).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.delete_plan_ref = _delete_plan_ref;

        var _save_finding = function (entity) {
            var deferred = $q.defer();
            $http.post(api_cms + 'api/cms/save/finding', entity).then(function (response) {
                deferred.resolve(response.data);
            }, function (err) {
                deferred.reject(Exceptions.getMessage(err));
            });
            return deferred.promise;
        };
        serviceFactory.save_finding = _save_finding;

        return serviceFactory;

    }]);
