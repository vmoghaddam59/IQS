app.controller('iqs_occurrence_list_controller', ['$location', 'DataService', '$scope', 'activityService', function ($location, DataService, $scope, activityService) {
    //$scope.items = DataService.getOccurrences();


    $scope.statuses = ['Submitted', 'Under Review', 'Returned', 'Closed'];
    $scope.statusFilter = 'Submitted';
    $scope.items = [];
    $scope.report_type = 'All';
    $scope.ds_type = [
        { id: -1, title: 'All' },
        { id: 0, title: 'Cabin Safety' },
        { id: 1, title: 'Ground' },
        { id: 2, title: 'Hazard' },
        { id: 3, title: 'Maintenance' },
        { id: 4, title: 'Catering' },
        { id: 5, title: 'Security' },
        { id: 6, title: 'Dispatch' },
        { id: 7, title: 'Cyber' },
        { id: 8, title: 'Air Safety' },
        { id: 9, title: 'Voyage' }
    ];



    $scope.sb_type = {
        showClearButton: true,
        searchEnabled: true,
        placeholder: ' ',
        valueExpr: "title",
        displayExpr: "title",
        onSelectionChanged: function (e) {

            //$scope.report_type = e.selectedItem.title;

            if ($scope.report_type != 'All') {
                $scope.dg_occurrences_ds = $scope.items.filter(function (item) {
                    return (item.type_title === $scope.report_type && item.status_title === $scope.statusFilter);
                });
                $scope.countBy();
            } else {
                $scope.dg_occurrences_ds = $scope.items.filter(function (item) {
                    return item.status_title === $scope.statusFilter;
                });
                $scope.countBy();
            }
        },
        bindingOptions: {
            dataSource: 'ds_type',
            value: 'report_type'
        }
    };

    $scope.setStatus = function (status) {
        $scope.statusFilter = status;

        if ($scope.report_type != 'All') {
            $scope.dg_occurrences_ds = $scope.items.filter(function (item) {
                return (item.type_title === $scope.report_type && item.status_title === $scope.statusFilter);
            });

        } else {
            $scope.dg_occurrences_ds = $scope.items.filter(function (item) {
                return item.status_title === $scope.statusFilter;
            });

        }
    };

    $scope.countBy = function (type, status) {
        var c = 0;
        angular.forEach($scope.items, function (o) {
            if (o.status_title === 'Draft') return;
            if (type && (o.type_title !== type && type !== 'All')) return;
            if (status && o.status_title !== status) return;
            c++;
        });
        return c;
    };

  
    $scope.go = function (path) {
        $location.path(path);
    };

    ///////DataGrid///////
    $scope.dg_occurrences_columns = [


        {
            cellTemplate: function (container, options) {
                $("<div style='text-align:center'/>")
                    .html(options.rowIndex + 1)
                    .appendTo(container);
            }, name: 'row', caption: '#', width: 60, fixed: true, fixedPosition: 'left', allowResizing: false, alignment: 'center', cssClass: 'rowHeader'
        },

        { dataField: 'event_date', caption: 'Date', allowResizing: true, alignment: 'center', dataType: 'datetime', allowEditing: false, width: 110, format: 'yy-MMM-dd HH:mm' },
        { dataField: 'entity_id', caption: 'Form No', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 70 },
        { dataField: 'type_title', caption: 'Type', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
        { dataField: '', caption: 'Linked Hazard', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, minWidth: 100 },
        {
            dataField: 'status_title',
            caption: 'Status',
            allowResizing: true,
            alignment: 'center',
            dataType: 'string',
            allowEditing: false,
            width: 120,
            cellTemplate: function (container, options) {
                $('<span>')
                    .addClass('status-pill')
                    .text(options.value)
                    .appendTo(container);
            }
        },

    ];

    $scope.dg_occurrences = {
        wordWrapEnabled: false,
        rowAlternationEnabled: false,
        headerFilter: {
            visible: false
        },
        filterRow: {
            visible: false,
            showOperationChooser: true,
        },
        showRowLines: true,
        showColumnLines: true,
        sorting: { mode: 'none' },

        noDataText: '',

        allowColumnReordering: true,
        allowColumnResizing: true,
        scrolling: { mode: 'infinite' },
        paging: { pageSize: 500 },
        showBorders: true,
        selection: { mode: 'single' },

        columnAutoWidth: false,
        height: $(window).height() - 370,
        width: '100%',
        columns: $scope.dg_occurrences_columns,

        onRowClick: function (e) {
            console.log(e)
            $location.path('/iqs/occurrence/detail/' + e.data.entity_id + '/' + e.data.type);
        },
        bindingOptions: {
            dataSource: 'dg_occurrences_ds'
        },
        columnChooser: {
            enabled: true
        },

    };

    ////////////////////////

    $scope.bind = function () {
        activityService.get_occurrences_list().then(function (response) {
            $scope.items = response.Data;
            $scope.dg_occurrences_ds = response.Data;
            $scope.countBy();
        });
    }

    $scope.bind();

}]);



