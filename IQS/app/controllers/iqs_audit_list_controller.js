app.controller('iqs_audit_list_controller', ['$location', 'DataService','$scope', function ($location, DataService, $scope) {
    $scope.items = DataService.getAudits();

    $scope.open = function (audit) {
        var planId = (audit && (audit.plan_id || audit.audit_plan_id || audit.id)) || -1;
        $location.path('/iqs/audit/plan/detail/' + planId);
    };

    $scope.new = function (audit) {
        $location.path('/iqs/audit/plan/detail/' + -1);
    };

}]);