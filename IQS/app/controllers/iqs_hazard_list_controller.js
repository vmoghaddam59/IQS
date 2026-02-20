app.controller('iqs_hazard_list_controller', ['$location', '$scope', 'DataService', 'activityService', function ($location, $scope, DataService, activityService) {

    $scope.bind = function () {
        activityService.get_hazard_list().then(function (response) {
            $scope.items = response.Data;
        });
    };

    $scope.refresh = function () {
        $scope.bind();
    };

    $scope.open = function (hazard) {
        $location.path('/iqs/hazard/detail/' + hazard.id);
    };

    $scope.new = function () {
        $location.path('/iqs/hazard/detail/new');
    };

    $scope.btn_refresh = {
        text: 'Refresh',
        icon: 'refresh',
        onClick: function () {
            $scope.refresh();
        }
    };

    $scope.btn_new = {
        text: 'New hazard',
        icon: 'plus',
        type: 'default',
        stylingMode: 'contained',
        onClick: function () {
            $scope.new();
        }
    };

    $scope.bind();
}]);
