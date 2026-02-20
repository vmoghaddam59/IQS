app.controller('iqs_hazard_detail_controller', ['$routeParams', '$location', '$scope', 'DataService', 'activityService',
    function ($routeParams, $location, $scope, DataService, activityService) {

        $scope.tab = 'overview';

        var idParam = $routeParams.id;
        var hazard_id = $routeParams.id;
        $scope.isNew = !idParam || idParam === 'new';

        $scope.identificationMethods = DataService.getHazardIdentificationMethods();

        $scope.severityLevels = [
            { code: 'A', title: 'Catastrophic' },
            { code: 'B', title: 'Major' },
            { code: 'C', title: 'Significant' },
            { code: 'D', title: 'Minor' },
            { code: 'E', title: 'Negligible' }
        ];

        $scope.likelihoodLevels = [
            { code: 5, title: 'Frequent' },
            { code: 4, title: 'Occasional' },
            { code: 3, title: 'Remote' },
            { code: 2, title: 'Improbable' },
            { code: 1, title: 'Extremely improbable' }
        ];

        $scope.currentAssessment = {
            severity: 'C',
            likelihood: 3
        };

        function createEmptyHazard() {
            return {
                id: null,
                code: '',
                title: '',
                ownerDept: '',
                status: 'Open',
                initialRisk: 'Medium',
                residualRisk: 'Medium',
                summary: '',
                keyDriver: ''
            };
        }

        function createEmptySource() {
            return {
                id: null,
                hazardId: null,
                methodCode: '',
                methodTitle: '',
                refCode: '',
                refTitle: '',
                refModule: '',
                refRecordId: null,
                dateIdentified: null,
                isPrimary: false,
                note: ''
            };
        }

        if ($scope.isNew) {
            $scope.item = createEmptyHazard();
            $scope.sources = [createEmptySource()];
            $scope.relatedOccurrences = [];
            $scope.relatedMocs = [];
            $scope.occurrenceCount = 0;
            $scope.mocCount = 0;
            $scope.riskAssessments = [];
            $scope.actions = [];
            $scope.monitoring = [];
        } else {
            var id = parseInt(idParam, 10);
            $scope.item = DataService.getHazardById(id);

            $scope.sources = DataService.getHazardSources(id);
            if (!$scope.sources || !$scope.sources.length) {
                $scope.sources = [createEmptySource()];
            }

            $scope.relatedOccurrences = DataService.getOccurrencesByHazardId(id);
            $scope.relatedMocs = [];
            $scope.occurrenceCount = DataService.getOccurrenceCountByHazardId(id);
            $scope.mocCount = 0;

            $scope.riskAssessments = DataService.getRiskAssessmentsByHazardId(id);
            $scope.actions = DataService.getHazardActionsByHazardId(id);
            $scope.monitoring = DataService.getHazardMonitoringByHazardId(id);

            if ($scope.riskAssessments.length) {
                var ra = $scope.riskAssessments[0];
                if (ra.initial === 'High') {
                    $scope.currentAssessment.severity = 'B';
                    $scope.currentAssessment.likelihood = 4;
                } else if (ra.initial === 'Medium') {
                    $scope.currentAssessment.severity = 'C';
                    $scope.currentAssessment.likelihood = 3;
                } else {
                    $scope.currentAssessment.severity = 'D';
                    $scope.currentAssessment.likelihood = 2;
                }
            }
        }

        $scope.setTab = function (t) { $scope.tab = t; };
        $scope.isTab = function (t) { return $scope.tab === t; };

        $scope.addSource = function () {
            $scope.sources.push(createEmptySource());
        };

        $scope.removeSource = function (index) {
            if ($scope.sources.length > 1) {
                $scope.sources.splice(index, 1);
            }
        };

        $scope.setPrimary = function (index) {
            $scope.sources.forEach(function (s, i) {
                s.isPrimary = (i === index);
            });
        };

        //$scope.currentRiskCode = function () {
        //    return $scope.currentAssessment.likelihood + '' + $scope.currentAssessment.severity;
        //};

        //$scope.currentRiskBand = function () {
        //    var l = $scope.currentAssessment.likelihood;
        //    var s = $scope.currentAssessment.severity;

        //    var sevWeight = 0;
        //    switch (s) {
        //        case 'A': sevWeight = 5; break;
        //        case 'B': sevWeight = 4; break;
        //        case 'C': sevWeight = 3; break;
        //        case 'D': sevWeight = 2; break;
        //        case 'E': sevWeight = 1; break;
        //        default: sevWeight = 0; break;
        //    }

        //    var score = sevWeight * l;

        //    if (score >= 18) {
        //        return 'Unacceptable';
        //    }
        //    if (score >= 12) {
        //        return 'Undesirable';
        //    }
        //    if (score >= 6) {
        //        return 'Acceptable with controls';
        //    }
        //    return 'Acceptable';
        //};

        $scope.currentRiskCode = function () {
            if (!$scope.currentAssessment) return '';

            var l = $scope.currentAssessment.likelihood;
            var sId = $scope.currentAssessment.severity;

            if (!l || !sId) return '';

            var sevObj = $scope.severityLevels.find(x => x.id === sId);
            if (!sevObj) return '';

            return l + sevObj.code;
        };

        $scope.currentRiskBand = function () {

            if (!$scope.currentAssessment) return '';

            var l = $scope.currentAssessment.likelihood;
            var s = $scope.currentAssessment.severity;

            if (!l || !s) return '';

            var score = s * l;   // 👈 direct numeric calculation

            if (score >= 18) return 'Unacceptable';
            if (score >= 12) return 'Undesirable';
            if (score >= 6) return 'Acceptable with controls';

            return 'Acceptable';
        };


        $scope.riskCellClass = function (sevObj, lik) {

            var sevWeight = sevObj.id;
            var score = sevWeight * lik;

            var cls = 'risk-cell ';

            if (
                (lik === 3 && sevObj.code === 'A') ||
                (lik === 4 && sevObj.code === 'B') ||
                (lik === 5 && sevObj.code === 'B')
            ) {
                cls += 'risk-high';
            }
            else {
                if (score >= 18) {
                    cls += 'risk-high';
                } else if (score >= 12) {
                    cls += 'risk-med';
                } else if (score >= 6) {
                    cls += 'risk-med';
                } else {
                    cls += 'risk-low';
                }
            }

            if ($scope.currentAssessment &&
                $scope.currentAssessment.severity === sevObj.id &&
                $scope.currentAssessment.likelihood === lik) {

                cls += ' risk-selected';
            }

            return cls;
        };




        //Bind
        ///
        $scope.bind = function () {
            activityService.get_hazard(hazard_id).then(function (response) {

                $scope.entity = response.Data;
            });

            activityService.get_occurrences_list().then(function (response) {
                $scope.dg_occurrences_ds = response.Data;
            });

            activityService.get_list_linked(hazard_id).then(function (response) {
                $scope.linked_list = response.Data;
            });

            activityService.list_hazard_risk(hazard_id).then(function (response) {
                $scope.dg_risk_ds = response.Data;
            });


        }

        //Main
        ///

    
        $scope.btn_back = {
            text: 'Back',
            icon: 'back',
            width: 90,
            onClick: function (e) {
                $location.path('/iqs/hazard/list');
            }
        };

        $scope.btn_save = {
            text: 'Save',
            width: 80,
            onClick: function (e) {
                activityService.save_hazard($scope.entity).then(function (response) {
                    $location.path('/iqs/hazard/list');
                });
            }
        };


        $scope.entity = {
            id: -1,
            hazard_type_id: 1
        }


        $scope.ds_status = [
            { id: 1, title: 'Identified' },
            { id: 2, title: 'Assessed' },
            { id: 3, title: 'Mitigated' },
            { id: 4, title: 'Closed' },
            { id: 5, title: 'Archived' }
        ];
        $scope.sb_status = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "title",
            bindingOptions: {
                dataSource: 'ds_status',
                value: 'entity.hazard_status_id'
            }
        };

        $scope.ds_initial_risk = [
            { id: 1, title: 'Low' },
            { id: 2, title: 'Medium' },
            { id: 3, title: 'High' },
            { id: 4, title: 'Extreme' },
        ];
        $scope.sb_initial_risk = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "title",
            bindingOptions: {
                dataSource: 'ds_initial_risk',
                value: 'entity.initial_risk_level_id'
            }
        };


        $scope.ds_residual_risk = [
            { id: 1, title: 'Low' },
            { id: 2, title: 'Medium' },
            { id: 3, title: 'High' },
            { id: 4, title: 'Extreme' },
        ];
        $scope.sb_residual_risk = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "title",
            bindingOptions: {
                dataSource: 'ds_residual_risk',
                value: 'entity.residual_risk_level_id'
            }
        };


        $scope.txt_code = {
            width: '100%',
            bindingOptions: {
                value: 'entity.code'
            }
        };

        $scope.txt_owner = {
            width: '100%',
            bindingOptions: {
                value: 'entity.risk_owner'
            }
        };

        $scope.txt_title = {
            width: '100%',
            bindingOptions: {
                value: 'entity.title'
            }
        };

        $scope.txt_description = {
            width: '100%',
            bindingOptions: {
                value: 'entity.description'
            }
        };

        //Identification
        ///

        $scope.chb_id_primary = {
            width: '100%',
            bindingOptions: {
                value: ''
            }
        };

        $scope.chb_id_method = {
            width: '100%',
            bindingOptions: {
                value: ''
            }
        };

        $scope.txt_id_ref = {
            width: '100%',
            bindingOptions: {
                value: ''
            }
        };


        $scope.txt_id_title = {
            width: '100%',
            bindingOptions: {
                value: ''
            }
        };


        $scope.txt_id_module = {
            width: '100%',
            bindingOptions: {
                value: ''
            }
        };

        $scope.dt_id_date = {
            type: "date",
            width: '100%',
            displayFormat: "yyyy-MM-dd",
            interval: 15,
            onValueChanged: function (arg) {

            },
            bindingOptions: {
                value: '',

            }
        };

        //CAUSES & CONSEQUENCES
        ///

        $scope.txt_cuz_root = {
            width: '100%',
            placeholder: 'E.g. wildlife attraction around airport, insufficient bird control coverage, seasonal migratory patterns...',
            bindingOptions: {
                value: ''
            }
        };


        $scope.txt_cuz_potential = {
            width: '100%',
            placeholder: 'E.g. engine damage, rejected take-off, emergency return, runway closure, schedule disruption, injuries...',
            bindingOptions: {
                value: ''
            }
        };

        //Risk
        ///

        $scope.btn_add_risk = {
            text: 'Add',
            icon: 'plus',
            width: 120,
            onClick: function (e) {

                $scope.currentAssessment.hazard_id = Number(hazard_id);
                activityService.save_hazard_risk($scope.currentAssessment).then(function (response) {
                    console.log(response);

                });
            }
        };

        $scope.severityLevels = [
            { code: 'A', title: 'Catastrophic', id: 5 },
            { code: 'B', title: 'Major', id: 3 },
            { code: 'C', title: 'Significant', id: 4 },
            { code: 'D', title: 'Minor', id: 2 },
            { code: 'E', title: 'Negligible', id: 1 }
        ];

        $scope.likelihoodLevels = [
            { id: 1, text: '1 - Extremely improbable' },
            { id: 2, text: '2 - Improbable' },
            { id: 3, text: '3 - Remote' },
            { id: 4, text: '4 - Occasional' },
            { id: 5, text: '5 - Frequent' }
        ];

        $scope.selectedSeverity = $scope.severityLevels[4];
        $scope.selectedLikelihood = 3;
        $scope.currentAssessment.severity = 3;

        $scope.severitySelectOptions = {
            dataSource: $scope.severityLevels,

            displayExpr: function (item) {
                return item ? item.code + ' - ' + item.title : "";
            },

            valueExpr: 'id',

            placeholder: 'Select Severity',

            onValueChanged: function (e) {
                $scope.selectedSeverity =
                    $scope.severityLevels.find(x => x.id === e.value);
            },
            bindingOptions: {
                value: 'currentAssessment.severity'
            }
        };



        $scope.likelihoodSelectOptions = {
            dataSource: $scope.likelihoodLevels,
            displayExpr: 'text',
            valueExpr: 'id',
            value: $scope.selectedLikelihood,
            placeholder: 'Select Likelihood',
            onValueChanged: function (e) {
                $scope.selectedLikelihood = e.value;
                $scope.$apply();
            },

            bindingOptions: {
                value: 'currentAssessment.likelihood',
            }
        };

        $scope.dg_risk_columns = [

            { dataField: 'event_date', caption: 'Date', allowResizing: true, alignment: 'center', dataType: 'datetime', allowEditing: false, width: 110, format: 'yy-MMM-dd' },
            { dataField: 'id', caption: 'No', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 70 },
            { dataField: 'initial_severity_title', caption: 'Initial Index', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 200 },
            { dataField: 'initial_likelihood_title', caption: 'Initial Risk', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            { dataField: 'residual_severity_title', caption: 'Residual Index', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            { dataField: 'residual_likelihood_title', caption: 'Residual Risk', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            { dataField: '', caption: 'Acceptability', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            

        ];

        $scope.selected_occurrences = [];
        $scope.dg_risk = {
            wordWrapEnabled: false,
            rowAlternationEnabled: false,
            headerFilter: {
                visible: false
            },
            filterRow: {
                visible: true,
                showOperationChooser: true,
            },
            showRowLines: true,
            showColumnLines: true,
            sorting: { mode: 'none' },

            noDataText: '',
            export: {
                enabled: false
            },
            allowColumnReordering: true,
            allowColumnResizing: true,
            scrolling: { mode: 'infinite' },
            paging: { pageSize: 500 },
            showBorders: true,
            selection: { mode: 'multiple' },

            columnAutoWidth: false,
            height: 300,
            width: '100%',
            columns: $scope.dg_risk_columns,
            onSelectionChanged: function (e) {


                e.selectedRowsData.forEach(function (s, i) {
                    $scope.selected_occurrences.push({
                        id: -1,
                        occurrence_id: s.id,
                        hazard_id: hazard_id,
                        is_primary: null,
                        comment: null,
                        created_by: null
                    });
                });


            },
            onRowClick: function (e) {
                $location.path('/iqs/occurrence/detail/' + e.data.entity_id + '/' + e.data.type);
            },
            bindingOptions: {
                dataSource: 'dg_risk_ds'
            },
            columnChooser: {
                enabled: false
            },

        };

        //////////////////////

        $scope.pop_width = 800;
        $scope.pop_height = 500;
        $scope.popup_add_occurrence_visible = false;
        $scope.popup_add_occurrence_title = 'Add Occurrences';
        $scope.popup_add_occurrence = {

            fullScreen: false,
            showTitle: true,

            toolbarItems: [
                {
                    widget: 'dxButton', location: 'after', toolbar: 'bottom', options: {
                        type: 'success', text: 'Save', width: 100, icon: 'plus', elementAttr: { class: 'popup-btn primary' }, onClick: function (e) {
                            activityService.link_hazard($scope.selected_occurrences).then(function (response) {

                            });
                        }
                    }
                },

                {
                    widget: 'dxButton', location: 'after', options: {
                        type: 'danger', text: 'Close', width: 100, icon: 'remove', elementAttr: { class: 'popup-btn danger' }, onClick: function (e) {
                            $scope.popup_add_occurrence_visible = false;
                        }
                    }, toolbar: 'bottom'
                },
            ],

            visible: false,
            dragEnabled: false,
            closeOnOutsideClick: false,
            onShowing: function (e) {

            },
            onShown: function (e) {

            },
            onHiding: function () {
                $scope.popup_add_occurrence_visible = false;
            },
            bindingOptions: {
                visible: 'popup_add_occurrence_visible',
                width: 'pop_width',
                height: 'pop_height',
                title: 'popup_add_occurrence_title',

            }
        };


        $scope.dg_occurrences_columns = [

            { dataField: 'event_date', caption: 'Date', allowResizing: true, alignment: 'center', dataType: 'datetime', allowEditing: false, width: 110, format: 'yy-MMM-dd' },
            { dataField: 'entity_id', caption: 'Form No', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 70 },
            { dataField: 'type_title', caption: 'Type', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 200 },
            { dataField: 'status_title', caption: 'Severity', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            {
                dataField: 'status_title',
                caption: 'Status',
                allowResizing: true,
                alignment: 'center',
                dataType: 'string',
                allowEditing: false,
                minwidth: 120,
                cellTemplate: function (container, options) {
                    $('<span>')
                        .addClass('status-pill')
                        .text(options.value)
                        .appendTo(container);
                }
            },

        ];

        $scope.selected_occurrences = [];
        $scope.dg_occurrences = {
            wordWrapEnabled: false,
            rowAlternationEnabled: false,
            headerFilter: {
                visible: false
            },
            filterRow: {
                visible: true,
                showOperationChooser: true,
            },
            showRowLines: true,
            showColumnLines: true,
            sorting: { mode: 'none' },

            noDataText: '',
            export: {
                enabled: false
            },
            allowColumnReordering: true,
            allowColumnResizing: true,
            scrolling: { mode: 'infinite' },
            paging: { pageSize: 500 },
            showBorders: true,
            selection: { mode: 'multiple' },

            columnAutoWidth: false,
            height: 360,
            width: '100%',
            columns: $scope.dg_occurrences_columns,
            onSelectionChanged: function (e) {


                e.selectedRowsData.forEach(function (s, i) {
                    $scope.selected_occurrences.push({
                        id: -1,
                        occurrence_id: s.id,
                        hazard_id: hazard_id,
                        is_primary: null,
                        comment: null,
                        created_by: null
                    });
                });


            },
            onRowClick: function (e) {
                $location.path('/iqs/occurrence/detail/' + e.data.entity_id + '/' + e.data.type);
            },
            bindingOptions: {
                dataSource: 'dg_occurrences_ds'
            },
            columnChooser: {
                enabled: false
            },

        };

        $scope.btn_add_occurrence = {
            text: 'Add',
            icon: 'plus',
            width: 120,
            onClick: function (e) {
                $scope.popup_add_occurrence_visible = true;
            }
        };

        $scope.btn_remove_occurrence = {
            text: 'Remove',
            icon: 'remove',
            width: 120,
            onClick: function (e) {

            }
        };

        $scope.bind();
    }
]);
