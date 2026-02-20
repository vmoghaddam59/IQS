'use strict';
app.controller('iqs_audit_detail_controller', [
    '$routeParams', '$location', '$scope', '$q', 'cmsService',
    function ($routeParams, $location, $scope, $q, cmsService) {

        // -------------------------
        // route params
        // -------------------------
        var audit_id = parseInt($routeParams.id, 10);
        var plan_id = parseInt($routeParams.plan_id, 10);

        if (isNaN(audit_id)) audit_id = -1;
        if (isNaN(plan_id)) plan_id = -1;

        // /iqs/audit/create/:plan_id
        if ($location.path().indexOf('/iqs/audit/create/') === 0) {
            audit_id = -1;
        }

        var plan_id_fallback = plan_id;

        // -------------------------
        // model
        // -------------------------
        $scope.entity = {
            id: audit_id,
            audit_plan_id: plan_id,
            created_by: 4011,
            updated_by: 4011,

            status: 'Draft',
            scheduling_type: 'Scheduled',
            audit_method: 'Process',
            execution_mode: 'Onsite'
        };

        $scope.findings = [];
        $scope.actions = [];
        $scope.hazards = [];

        $scope.auditors = [];
        $scope.auditees = [];
        $scope.locations = []; // Location table (title)
        $scope.lookups = {
            scheduling_types: [],
            audit_methods: [],
            execution_modes: [],
            statuses: []
        };

        // refs (audit)
        $scope.ref_docs = [];
        $scope.audit_refs = [];

        // -------------------------
        // helpers
        // -------------------------
        $scope.getStatusClass = function (s) {
            s = s || ($scope.entity ? $scope.entity.status : 'Draft');

            if (s === 'Scheduled') return 'pill-status pill-blue';
            if (s === 'InProgress') return 'pill-status pill-orange';
            if (s === 'Closed') return 'pill-status pill-green';
            if (s === 'Cancelled') return 'pill-status pill-red';

            return 'pill-status pill-gray'; // Draft
        };

        function notify(msg, type) {
            if (window.General && window.General.ShowNotify) {
                General.ShowNotify(msg, type || 'info');
            } else {
                console.log(type || 'info', msg);
            }
        }

        $scope.is_new = function () {
            return !$scope.entity || !$scope.entity.id || $scope.entity.id < 0;
        };

        // -------------------------
        // Tabs (DevExtreme TabPanel)
        // -------------------------
        $scope.dx_audit_tabs = {
            items: [
                { title: 'Overview', template: 'overview' },
                { title: 'Findings', template: 'findings' },
                { title: 'Actions', template: 'actions' },
                { title: 'Hazards', template: 'hazards' }
            ],
            selectedIndex: 0,
            animationEnabled: true,
            swipeEnabled: false,
            deferRendering: true,
            showNavButtons: true
        };

        // -------------------------
        // load lookups
        // -------------------------
        function load_lookups() {
            var promises = [];

            promises.push(
                cmsService.get_auditors().then(function (res) {
                    $scope.auditors = (res && res.IsSuccess) ? (res.Data || []) : [];
                })
            );

            promises.push(
                cmsService.get_auditees().then(function (res) {
                    $scope.auditees = (res && res.IsSuccess) ? (res.Data || []) : [];
                })
            );

            promises.push(
                cmsService.get_locations().then(function (res) {
                    $scope.locations = (res && res.IsSuccess) ? (res.Data || []) : [];
                })
            );

            if (cmsService.get_audit_lookups) {
                promises.push(
                    cmsService.get_audit_lookups().then(function (res) {
                        if (res && res.IsSuccess && res.Data) $scope.lookups = res.Data;
                        else $scope.lookups = { scheduling_types: [], audit_methods: [], execution_modes: [], statuses: [] };
                    })
                );
            } else {
                // fallback
                $scope.lookups = {
                    scheduling_types: [
                        { value: 'Scheduled', label: 'Scheduled' },
                        { value: 'NonScheduled', label: 'Non scheduled' },
                        { value: 'AdHoc', label: 'Ad hoc' },
                        { value: 'FollowUp', label: 'Follow up' }
                    ],
                    audit_methods: [
                        { value: 'Process', label: 'Process' },
                        { value: 'Product', label: 'Product' },
                        { value: 'GapAnalysis', label: 'Gap analysis' },
                        { value: 'PreAudit', label: 'Pre audit' },
                        { value: 'NightAudit', label: 'Night audit' },
                        { value: 'RampInspection', label: 'Ramp inspection' },
                        { value: 'LOSA', label: 'LOSA' }
                    ],
                    execution_modes: [
                        { value: 'Onsite', label: 'Onsite' },
                        { value: 'Remote', label: 'Remote' }
                    ],
                    statuses: [
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Scheduled', label: 'Scheduled' },
                        { value: 'InProgress', label: 'In progress' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'Closed', label: 'Closed' },
                        { value: 'Cancelled', label: 'Cancelled' }
                    ]
                };
            }

            return $q.all(promises);
        }

        // -------------------------
        // workflow buttons (Approve/Start/Close/Cancel)
        // -------------------------

        $scope.wf = {
            canApprove: false,
            canStart: false,
            canClose: false,
            canCancel: false,
            busy: false
        };

        function isSaved() {
            return $scope.entity && $scope.entity.id > 0;
        }

        function st() {
            return ($scope.entity && $scope.entity.status) ? $scope.entity.status : 'Draft';
        }

        function canApprove() { return isSaved() && st() === 'Draft'; }
        function canStart() { return isSaved() && st() === 'Scheduled'; }
        function canClose() { return isSaved() && st() === 'InProgress'; }

        function canCancel() {
            if (!isSaved()) return false;
            var s = st();
            return (s === 'Draft' || s === 'Scheduled' || s === 'InProgress');
        }

        function actionToast(action) {
            if (action === 'Approve') return 'Audit approved and scheduled.';
            if (action === 'Start') return 'Audit started.';
            if (action === 'Close') return 'Audit closed.';
            if (action === 'Cancel') return 'Audit cancelled.';
            return 'Audit updated.';
        }

        function refreshWorkflowButtonStyles() {
            // highlight next step (contained) / others outlined
            if ($scope.btn_approve) $scope.btn_approve.stylingMode = $scope.wf.canApprove ? 'contained' : 'outlined';
            if ($scope.btn_start) $scope.btn_start.stylingMode = $scope.wf.canStart ? 'contained' : 'outlined';
            if ($scope.btn_close) $scope.btn_close.stylingMode = $scope.wf.canClose ? 'contained' : 'outlined';
            // cancel همیشه outlined بمونه (حس destructive)
            if ($scope.btn_cancel) $scope.btn_cancel.stylingMode = 'outlined';
        }

        function refreshWorkflowButtons() {
            $scope.wf.canApprove = canApprove();
            $scope.wf.canStart = canStart();
            $scope.wf.canClose = canClose();
            $scope.wf.canCancel = canCancel();

            refreshWorkflowButtonStyles();

            // برای اطمینان از digest
            $scope.$applyAsync();
        }

        function doTransition(action) {
            if (!isSaved()) { notify("First save the audit.", "warning"); return; }
            if ($scope.wf.busy) return;

            $scope.wf.busy = true;
            $scope.$applyAsync();

            cmsService.transition_audit($scope.entity.id, { action: action }).then(function (res) {
                if (!res || !res.IsSuccess) {
                    notify(((res && res.Errors) ? res.Errors.join('\n') : 'Error'), 'error');
                    return;
                }

                notify(actionToast(action), 'success');

                // بهترین: bind مجدد از DB
                $scope.bind();
                $scope.$applyAsync();
            }).finally(function () {
                $scope.wf.busy = false;
                $scope.$applyAsync();
            });
        }

        // Approve => Draft -> Scheduled
        $scope.btn_approve = {
            text: 'Approve',
            icon: 'check',
            type: 'default',
            stylingMode: 'outlined',
            bindingOptions: {
                disabled: '!wf.canApprove || wf.busy'
            },
            onClick: function () {
                doTransition('Approve');
                $scope.$applyAsync();
            }
        };

        $scope.btn_start = {
            text: 'Start',
            icon: 'runner',
            type: 'default',
            stylingMode: 'outlined',
            bindingOptions: {
                disabled: '!wf.canStart || wf.busy'
            },
            onClick: function () {
                doTransition('Start');
                $scope.$applyAsync();
            }
        };

        $scope.btn_close = {
            text: 'Close',
            icon: 'lock',
            type: 'success',
            stylingMode: 'outlined',
            bindingOptions: {
                disabled: '!wf.canClose || wf.busy'
            },
            onClick: function () {
                doTransition('Close');
                $scope.$applyAsync();
            }
        };

        $scope.btn_cancel = {
            text: 'Cancel',
            icon: 'close',
            type: 'danger',
            stylingMode: 'outlined',
            bindingOptions: {
                disabled: '!wf.canCancel || wf.busy'
            },
            onClick: function () {
                doTransition('Cancel');
                $scope.$applyAsync();
            }
        };

        // هر بار status/id عوض شد، disabledها sync شوند
        $scope.$watch('entity.status', function () { refreshWorkflowButtons(); });
        $scope.$watch('entity.id', function () { refreshWorkflowButtons(); });

        // -------------------------
        // bind form
        // -------------------------
        $scope.bind = function () {

            if (audit_id < 0) {
                $scope.entity = {
                    id: -1,
                    audit_plan_id: plan_id,
                    created_by: 4011,
                    updated_by: 4011,

                    status: 'Draft',
                    scheduling_type: 'Scheduled',
                    audit_method: 'Process',
                    execution_mode: 'Onsite'
                };

                $scope.findings = [];
                $scope.actions = [];
                $scope.hazards = [];

                $scope.ref_docs = [];
                $scope.audit_refs = [];
                refreshWorkflowButtons();

                return;
            }

            cmsService.get_audit(audit_id).then(function (response) {
                if (!response || !response.IsSuccess) return;

                var data = response.Data || {};
                var entity = data.audit || data;

                $scope.entity = entity || $scope.entity;

                // sync plan_id
                if ($scope.entity && $scope.entity.audit_plan_id && $scope.entity.audit_plan_id > 0) {
                    plan_id = $scope.entity.audit_plan_id;
                }

                $scope.entity.audit_plan_id = ($scope.entity.audit_plan_id && $scope.entity.audit_plan_id > 0)
                    ? $scope.entity.audit_plan_id
                    : (plan_id > 0 ? plan_id : plan_id_fallback);

                // date fixes
                if ($scope.entity.audit_date) $scope.entity.audit_date = new Date($scope.entity.audit_date);
                if ($scope.entity.scheduled_start) $scope.entity.scheduled_start = new Date($scope.entity.scheduled_start);
                if ($scope.entity.scheduled_end) $scope.entity.scheduled_end = new Date($scope.entity.scheduled_end);

                $scope.entity.updated_by = 4011;
                $scope.entity.created_by = 4011;

                $scope.findings = data.findings || [];
                $scope.actions = data.actions || [];
                $scope.hazards = data.hazards || [];

                // refs from API
                $scope.ref_docs = data.ref_docs || [];
                $scope.audit_refs = data.audit_refs || [];

                if ($scope.refs_modal && $scope.refs_modal.visible) {
                    $scope.refs_modal.docs = $scope.ref_docs || [];
                    $scope.refs_modal.refs = $scope.audit_refs || [];
                }

                refreshWorkflowButtons();
                $scope.$applyAsync();
            });
        };

        // -------------------------
        // navigation
        // -------------------------
        $scope.btn_back = {
            text: 'Back',
            icon: 'chevronleft',
            onClick: function () {
                var pid = ($scope.entity && $scope.entity.audit_plan_id) ? $scope.entity.audit_plan_id : plan_id_fallback;
                var qs = $location.search() || {};
                var progId = qs.program_id ? (parseInt(qs.program_id, 10) || qs.program_id) : null;

                if (progId) {
                    $location.search({});
                    $location.path('/iqs/audit/program/' + progId);
                    return;
                }

                if (pid && pid > 0) {
                    $location.path('/iqs/audit/list');
                    $location.search({ plan_id: pid });
                    return;
                }

                $location.path('/iqs/audit/list');
            }
        };

        // -------------------------
        // save
        // -------------------------
        $scope.btn_save = {
            text: 'Save',
            type: 'success',
            validationGroup: 'auditsave',
            onClick: function (e) {
                var result = e.validationGroup ? e.validationGroup.validate() : { isValid: true };
                if (!result.isValid) {
                    notify((window.Config && Config.Text_FillRequired) ? Config.Text_FillRequired : 'Please fill required fields.', 'error');
                    return;
                }
                $scope.save();
            }
        };

        $scope.save = function () {

            var dto = {
                id: $scope.entity.id,
                audit_plan_id: ($scope.entity.audit_plan_id || plan_id || plan_id_fallback),

                code: $scope.entity.code,
                title: $scope.entity.title,
                remark: $scope.entity.remark,

                type_id: $scope.entity.type_id,
                scope: $scope.entity.scope,
                area: $scope.entity.area,

                audit_date: $scope.entity.audit_date,

                auditee_id: $scope.entity.auditee_id,
                auditor_id: $scope.entity.auditor_id,

                audit_location: $scope.entity.audit_location,
                department_id: $scope.entity.department_id,

                scheduling_type: $scope.entity.scheduling_type,
                audit_method: $scope.entity.audit_method,
                execution_mode: $scope.entity.execution_mode,
                scheduled_start: $scope.entity.scheduled_start,
                scheduled_end: $scope.entity.scheduled_end,

                status: $scope.entity.status,

                created_by: $scope.entity.created_by,
                updated_by: $scope.entity.updated_by
            };

            cmsService.save_audit(dto).then(function (response) {
                if (!response || !response.IsSuccess) return;

                // اگر new بود، id برگشتی رو ست کن تا bind بعدی واقعی شود
                if ($scope.entity.id < 0 && response.Data && response.Data.id) {
                    $scope.entity.id = response.Data.id;
                    audit_id = response.Data.id;
                }

                notify('Audit saved.', 'success');
                $scope.bind();
            });
        };

        // -------------------------
        // findings
        // -------------------------
        $scope.btn_finding_add = {
            text: "Add finding",
            icon: "plus",
            type: "default",
            stylingMode: "contained",
            onClick: function () {
                if ($scope.is_new()) {
                    notify("First save the audit.", "warning");
                    return;
                }
                $location.path('/iqs/audit/finding/detail/-1/' + $scope.entity.id + '/' + ($scope.entity.audit_plan_id || plan_id_fallback));
            }
        };

        $scope.openFinding = function (f) {
            if (!f || !f.id) return;
            $location.path('/iqs/audit/finding/detail/' + f.id + '/' + $scope.entity.id + '/' + ($scope.entity.audit_plan_id || plan_id_fallback));
        };

        // -------------------------
        // refs modal (AUDIT)
        // -------------------------
        $scope.refs_modal = {
            visible: false,
            docs: [],
            clauses: [],
            refs: [],
            selected_doc_id: null,
            selected_clause_id: null,
            weight: 3,
            note: '',
            loading_clauses: false
        };

        $scope.open_refs = function () {
            if ($scope.is_new()) {
                notify("First save the audit.", "warning");
                return;
            }

            $scope.refs_modal.docs = $scope.ref_docs || [];
            $scope.refs_modal.refs = $scope.audit_refs || [];

            $scope.refs_modal.selected_doc_id = null;
            $scope.refs_modal.selected_clause_id = null;
            $scope.refs_modal.clauses = [];
            $scope.refs_modal.weight = 3;
            $scope.refs_modal.note = '';

            $scope.refs_modal.visible = true;
        };

        $scope.close_refs = function () {
            $scope.refs_modal.visible = false;
        };

        $scope.on_ref_doc_changed = function (e) {
            var docId = e && e.value ? e.value : null;

            $scope.refs_modal.selected_doc_id = docId;
            $scope.refs_modal.selected_clause_id = null;
            $scope.refs_modal.clauses = [];

            if (!docId) return;

            $scope.refs_modal.loading_clauses = true;
            cmsService.get_ref_clauses(docId).then(function (res) {
                $scope.refs_modal.clauses = (res && res.IsSuccess) ? (res.Data || []) : [];
            }).finally(function () {
                $scope.refs_modal.loading_clauses = false;
            });
        };

        function refresh_audit_refs_only() {
            if ($scope.is_new()) return;

            return cmsService.get_audit_refs($scope.entity.id).then(function (res) {
                if (!res || !res.IsSuccess) return;
                $scope.audit_refs = res.Data || [];
                $scope.refs_modal.refs = $scope.audit_refs || [];
            });
        }

        $scope.add_audit_ref = function () {

            if ($scope.is_new()) {
                notify("First save the audit.", "warning");
                return;
            }
            if (!$scope.refs_modal.selected_doc_id) return;

            var dto = {
                doc_id: $scope.refs_modal.selected_doc_id,
                clause_id: $scope.refs_modal.selected_clause_id || null,
                weight: $scope.refs_modal.weight || null,
                note: $scope.refs_modal.note || null
            };

            cmsService.add_audit_ref($scope.entity.id, dto).then(function (res) {
                if (!res || !res.IsSuccess) return;
                refresh_audit_refs_only();
            });
        };

        $scope.delete_audit_ref = function (refId) {
            if (!refId) return;

            cmsService.delete_audit_ref(refId).then(function (res) {
                if (!res || !res.IsSuccess) return;
                refresh_audit_refs_only();
            });
        };

        $scope.btn_manage_refs = {
            text: 'Manage references',
            icon: 'bookmark',
            type: 'normal',
            stylingMode: 'outlined',
            bindingOptions: { disabled: 'entity.id < 0' },
            onClick: function () {
                $scope.open_refs();
                $scope.$applyAsync();
            }
        };

        // dx popup + editors + grid
        $scope.dx_refs_popup = {
            width: 860,
            height: 'auto',
            dragEnabled: true,
            showTitle: true,
            title: 'Audit References',
            shading: true,
            closeOnOutsideClick: true,
            bindingOptions: { visible: 'refs_modal.visible' },
            onHiding: function () { $scope.close_refs(); }
        };

        $scope.dx_ref_doc_select = {
            searchEnabled: true,
            valueExpr: 'id',
            displayExpr: function (d) { return d ? (d.doc_type + ' — ' + d.title) : ''; },
            placeholder: 'Select document...',
            bindingOptions: {
                dataSource: 'refs_modal.docs',
                value: 'refs_modal.selected_doc_id'
            },
            onValueChanged: $scope.on_ref_doc_changed
        };

        $scope.dx_ref_clause_select = {
            searchEnabled: true,
            valueExpr: 'id',
            displayExpr: function (c) { return c ? (c.clause_code + ' — ' + (c.title || '')) : ''; },
            placeholder: 'Optional clause...',
            bindingOptions: {
                dataSource: 'refs_modal.clauses',
                value: 'refs_modal.selected_clause_id',
                disabled: 'refs_modal.loading_clauses'
            }
        };

        $scope.dx_ref_weight = {
            min: 1, max: 5, showSpinButtons: true,
            bindingOptions: { value: 'refs_modal.weight' }
        };

        $scope.dx_ref_note = {
            placeholder: 'e.g., baseline compliance criteria',
            bindingOptions: { value: 'refs_modal.note' }
        };

        $scope.dx_add_ref_btn = {
            text: 'Add reference',
            type: 'default',
            icon: 'plus',
            bindingOptions: { disabled: '!refs_modal.selected_doc_id' },
            onClick: function () { $scope.add_audit_ref(); $scope.$applyAsync(); }
        };

        $scope.dx_close_refs_btn = {
            text: 'Close',
            type: 'normal',
            onClick: function () { $scope.close_refs(); $scope.$applyAsync(); }
        };

        $scope.dx_refs_grid = {
            bindingOptions: { dataSource: 'refs_modal.refs' },
            showBorders: true,
            columnAutoWidth: true,
            paging: { enabled: false },
            noDataText: 'No references.',
            columns: [
                { caption: 'Type', dataField: 'doc_type', width: 140 },
                { caption: 'Document', dataField: 'doc_title' },
                {
                    caption: 'Clause',
                    calculateCellValue: function (r) {
                        if (!r) return '—';
                        return r.clause_code ? (r.clause_code + ' — ' + (r.clause_title || '')) : '—';
                    }
                },
                { caption: 'W', dataField: 'weight', width: 60 },
                { caption: 'Note', dataField: 'note' },
                {
                    caption: '',
                    width: 70,
                    cellTemplate: function (container, options) {
                        $('<div>').dxButton({
                            icon: 'trash',
                            type: 'danger',
                            stylingMode: 'text',
                            onClick: function () {
                                $scope.delete_audit_ref(options.data.id);
                                $scope.$applyAsync();
                            }
                        }).appendTo(container);
                    }
                }
            ]
        };

        // -------------------------
        // editors (basic)
        // -------------------------
        $scope.txt_title = { width: '100%', bindingOptions: { value: 'entity.title' } };
        $scope.txt_code = { width: '100%', readOnly: true, bindingOptions: { value: 'entity.code' } };
        $scope.txt_scope = { width: '100%', bindingOptions: { value: 'entity.scope' } };
        $scope.txt_area = { width: '100%', bindingOptions: { value: 'entity.area' } };

        $scope.txt_remark = {
            width: '100%',
            minHeight: 70,
            autoResizeEnabled: true,
            bindingOptions: { value: 'entity.remark' }
        };

        $scope.txt_audit_location = { width: '100%', bindingOptions: { value: 'entity.audit_location' } };

        $scope.dt_audit_date = {
            type: "date",
            openOnFieldClick: true,
            showDropDownButton: true,
            bindingOptions: { value: "entity.audit_date" }
        };

        $scope.dt_scheduled_start = {
            type: "datetime",
            openOnFieldClick: true,
            showDropDownButton: true,
            bindingOptions: { value: "entity.scheduled_start" }
        };

        $scope.dt_scheduled_end = {
            type: "datetime",
            openOnFieldClick: true,
            showDropDownButton: true,
            bindingOptions: { value: "entity.scheduled_end" }
        };

        $scope.types = [{ id: 1, name: 'T1' }, { id: 2, name: 'T2' }, { id: 3, name: 'T3' }];
        $scope.sb_types = {
            dataSource: $scope.types,
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "name",
            bindingOptions: { value: 'entity.type_id' }
        };

        $scope.sb_auditors = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "name",
            bindingOptions: { dataSource: 'auditors', value: 'entity.auditor_id' }
        };

        $scope.sb_auditees = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "name",
            bindingOptions: { dataSource: 'auditees', value: 'entity.auditee_id' }
        };

        // department from Location table
        $scope.sb_departments = {
            showClearButton: true,
            searchEnabled: true,
            placeholder: ' ',
            valueExpr: "id",
            displayExpr: "title",
            bindingOptions: { dataSource: 'locations', value: 'entity.department_id' }
        };

        $scope.sb_scheduling_type = {
            showClearButton: true,
            searchEnabled: false,
            valueExpr: "value",
            displayExpr: "label",
            bindingOptions: { dataSource: 'lookups.scheduling_types', value: 'entity.scheduling_type' }
        };

        $scope.sb_audit_method = {
            showClearButton: true,
            searchEnabled: true,
            valueExpr: "value",
            displayExpr: "label",
            bindingOptions: { dataSource: 'lookups.audit_methods', value: 'entity.audit_method' }
        };

        $scope.sb_execution_mode = {
            showClearButton: true,
            searchEnabled: false,
            valueExpr: "value",
            displayExpr: "label",
            bindingOptions: { dataSource: 'lookups.execution_modes', value: 'entity.execution_mode' }
        };

        $scope.sb_status = {
            showClearButton: false,
            searchEnabled: false,
            valueExpr: "value",
            displayExpr: "label",
            bindingOptions: {
                dataSource: 'lookups.statuses',
                value: 'entity.status'
            },
            disabled: true
        };

        // -------------------------
        // grids (findings/actions)
        // -------------------------
        $scope.dg_findings = {
            keyExpr: "id",
            showBorders: true,
            rowAlternationEnabled: true,
            hoverStateEnabled: true,
            paging: { pageSize: 10 },
            pager: { showInfo: true, showPageSizeSelector: true, allowedPageSizes: [10, 20, 50] },
            searchPanel: { visible: true, width: 240, placeholder: "Search findings..." },
            noDataText: "No findings.",
            columns: [
                { dataField: "code", caption: "Code", width: 110 },
                { dataField: "title", caption: "Title", minWidth: 220 },
                { dataField: "level", caption: "Level", width: 90 },
                { dataField: "closure_deadline", caption: "Closure deadline", dataType: "date", format: "yyyy-MM-dd", width: 140 },
                { dataField: "closure_auditor_date", caption: "Closure date", dataType: "date", format: "yyyy-MM-dd", width: 140 }
            ],
            onRowClick: function (e) {
                $scope.openFinding(e.data);
                $scope.$applyAsync();
            },
            bindingOptions: { dataSource: "findings" }
        };

        $scope.dg_actions = {
            keyExpr: "id",
            showBorders: true,
            rowAlternationEnabled: true,
            hoverStateEnabled: true,
            paging: { pageSize: 10 },
            pager: { showInfo: true, showPageSizeSelector: true, allowedPageSizes: [10, 20, 50] },
            searchPanel: { visible: true, width: 260, placeholder: "Search actions..." },
            noDataText: "No corrective actions.",
            columns: [
                { dataField: "code", caption: "Code", width: 110 },
                { dataField: "finding_id", caption: "Finding", width: 90 },
                { dataField: "action_title", caption: "Corrective action", minWidth: 260 },
                { dataField: "responsible_manager_name", caption: "Owner", width: 160 },
                { dataField: "request_implementation_date", caption: "Target date", dataType: "date", format: "yyyy-MM-dd", width: 130 },
                { dataField: "is_approved", caption: "Approved", width: 90 }
            ],
            bindingOptions: { dataSource: "actions" }
        };

        // -------------------------
        // scroll
        // -------------------------
        $scope.scroll_content_height = $(window).height() - 130;
        $scope.scroll_content = {
            width: '100%',
            bounceEnabled: false,
            showScrollbar: 'onHover',
            useNative: true,
            onPullDown: function (options) {
                $scope.bind();
                options.component.release();
            },
            bindingOptions: { height: 'scroll_content_height' }
        };

        // -------------------------
        // init
        // -------------------------
        function init() {
            load_lookups().then(function () {
                $scope.bind();
            });
        }
        init();
    }
]);
