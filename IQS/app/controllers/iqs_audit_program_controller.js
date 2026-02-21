app.controller('iqs_audit_program_controller', ['$routeParams', '$location', '$scope', 'cmsService',
    function ($routeParams, $location, $scope, cmsService) {

        var vm = this;
        vm.locations = [];
        vm.items = [];
        vm.show_more_filters = false;
        vm.program_type_items = ['Annual', 'Rolling', 'RiskBased', 'Regulatory', 'Campaign'];
        vm.program_status_items = ['Draft', 'Approved', 'Locked', 'Cancelled'];

        // ----------- route param -----------
        var program_id = parseInt($routeParams.program_id, 10);

        if (isNaN(program_id)) {
            var qs = $location.search();
            if (qs && qs.program_id) program_id = parseInt(qs.program_id, 10);
        }
        if (isNaN(program_id)) program_id = -1;
        vm.isNew = (program_id <= 0);
        // ----------- model -----------
        vm.program = { id: program_id, status: 'Draft' };
        vm.kpi = { planned: 0, created: 0, inProgress: 0, overdue: 0, completed: 0, coveragePct: 0 };
        vm.coverage = { flightOps: { planned: 0, created: 0 }, ramp: { planned: 0, created: 0 } };

        vm.filters = { q: '', department_id: null, window: '', priority: '', mode: '' };
        vm.windows = [
            { value: 'W1', label: 'W1' },
            { value: 'W2', label: 'W2' },
            { value: 'W3', label: 'W3' },
            { value: 'W4', label: 'W4' }
        ];

        

        // ----------- filtering helpers -----------
        function norm(s) { return (s === null || s === undefined) ? '' : ('' + s).toLowerCase(); }
        function contains(h, n) { h = norm(h); n = norm(n); return !n || h.indexOf(n) >= 0; }

        vm.itemFilter = function (it) {
            if (!it) return false;

            if (vm.filters.q) {
                var blob =
                    (it.scopeTitle || it.scope_title || '') + ' ' +
                    (it.area || '') + ' ' +
                    (it.station || '') + ' ' +
                    (it.ownerDept || '') + ' ' +
                    (it.auditMethod || it.auditType || it.audit_method || '') + ' ' +
                    (it.executionMode || it.execution_mode || '') + ' ' +
                    (it.programMethod || '');
                if (!contains(blob, vm.filters.q)) return false;
            }
            if (vm.filters.window) {
                var w = it.plannedWindowLabel || it.plannedWindow || it.period_label || '';
                if (w !== vm.filters.window) return false;
            }

            if (vm.filters.priority && (it.priority || '') !== vm.filters.priority) return false;

            var mode = it.executionMode || it.execution_mode || '';
            if (vm.filters.mode && mode !== vm.filters.mode) return false;
            if (vm.filters.department_id) {
                // چون تو API برمی‌گردونی department_id و department_title
                var depId = it.department_id || it.departmentId || null;
                if (depId !== vm.filters.department_id) return false;
            }


            return true;
        };

  
        vm.clearFilters = function () {
            vm.filters = { q: '', department_id: null, window: '', priority: '', mode: '' };
        };

        // ----------- load -----------
        vm.load_locations = function () {
            return cmsService.get_locations().then(function (res) {
                vm.locations = (res && res.IsSuccess) ? (res.Data || []) : [];
            });
        };

        vm.refresh = function () {

            // ✅ NEW PROGRAM MODE
            if (vm.isNew) {

                vm.program = {
                    id: -1,
                    status: 'Draft',
                    program_type: 'Annual',
                    title: '',
                    period_from: new Date(),
                    period_to: new Date(),
                    notes: null,
                    code: null
                };

                // ✅ برای اینکه قبل از edit هم پر باشه
                vm.program_edit.model = angular.copy(vm.program);
                vm.program_edit.is_edit = true;     // تو create از اول ادیت روشن

                vm.items = [];
                vm.kpi = { planned: 0, created: 0, inProgress: 0, overdue: 0, completed: 0, coveragePct: 0 };
                vm.coverage = { planned: 0, created: 0 };
                return;
            }

            // ✅ EXISTING PROGRAM MODE
            cmsService.get_audit_program_detail(program_id).then(function (res) {
                if (!res || !res.IsSuccess) return;

                var data = res.Data || {};
                vm.program = data.program || vm.program;

                // ⭐ فقط وقتی edit نیست مدل رو sync کن
                if (!vm.program_edit.is_edit) {
                    vm.program_edit.model = angular.copy(vm.program || {});
                }

                vm.kpi = data.kpi || vm.kpi;
                vm.coverage = data.coverage || vm.coverage;

                vm.program.id = vm.program.id || program_id;
                vm.program.status = vm.program.status || 'Draft';
            });

            cmsService.get_audit_program_items(program_id).then(function (res) {
                if (!res || !res.IsSuccess) { vm.items = []; return; }

                vm.items = res.Data || [];

                // ✅ attach audits under each plan (multi-audit)
                vm.loadAuditsForProgram();
                $scope.$applyAsync();
            });
        };


        // ----------- audits (for MULTI-AUDIT per plan) -----------
        vm.audits_all = [];
        vm.audits_by_plan = {};

        vm.loadAuditsForProgram = function () {
            if (!program_id || program_id <= 0) return;

            return cmsService.get_audits({ program_id: program_id }).then(function (res) {
                vm.audits_all = (res && res.Data) ? res.Data : [];
                vm.audits_by_plan = {};

                (vm.audits_all || []).forEach(function (a) {
                    if (!a) return;

                    // tolerate different API shapes
                    var planId = a.audit_plan_id || a.auditPlanId || a.plan_id || a.planId || a.audit_plan || null;
                    if (!planId) return;

                    if (!vm.audits_by_plan[planId]) vm.audits_by_plan[planId] = [];
                    vm.audits_by_plan[planId].push(a);
                });

                // attach to items
                (vm.items || []).forEach(function (p) {
                    var list = vm.audits_by_plan[p.id] || [];
                    // order desc by id
                    list = list.slice().sort(function (x, y) { return (y.id || 0) - (x.id || 0); });
                    p.audits = list;
                    p.audit_count = list.length;
                });

                // refresh grids if initialized
                if (vm.planGridInstance) {
                    vm.planGridInstance.option('dataSource', vm.items || []);
                    vm.planGridInstance.refresh();
                }
            });
        };


        // ----------- actions -----------
        vm.addItem = function () {

            vm.edit_plan.id = null;   // ← مهم! یعنی create mode

            vm.edit_plan.plan_code = '';
            vm.edit_plan.scope_title = '';
            vm.edit_plan.department_id = null;

            vm.edit_plan.planned_period_type = 'Month';
            vm.edit_plan.planned_period_value = null;
            vm.edit_plan.planned_year = new Date().getFullYear();

            vm.edit_plan.audit_method = null;
            vm.edit_plan.execution_mode = null;
            vm.edit_plan.priority = 'Medium';
            vm.edit_plan.planned_count = null;
            vm.edit_plan.notes = '';

            vm.edit_plan.visible = true;
        };


        vm.editItem = function (it) {
            if (!it || !it.id) return;
            console.log('editItem', it.id);
        };

        vm.cancelItem = function (it) {
            if (!it || !it.id) return;
            if (vm.program.status === 'Locked') return;

            cmsService.cancel_audit_program_item(it.id).then(function (res) {
                if (res && res.IsSuccess) vm.refresh();
            });
        };

        vm.createAuditFromItem = function (it) {
            if (!it || !it.id) return;
            if (vm.program.status === 'Locked') return;

            var plan_id = it.id;

            var dto = {
                title: it.scope_title || it.scopeTitle || it.title || null,
                audit_method: it.audit_method || it.auditMethod || null,
                execution_mode: it.execution_mode || it.executionMode || null,
                scheduled_start: it.scheduled_start || null,
                scheduled_end: it.scheduled_end || null,
                audit_location: it.audit_location || null,
                created_by:4011
            };


        // ----------- grid action aliases (keep grid code simple) -----------
        // these wrappers point to the existing functions (so we don't break the UI)
        vm.create_audit_from_plan = function (plan) { vm.createAuditFromItem(plan); };
        vm.open_plan_item = function (plan) { vm.open_refs(plan); };
        vm.edit_plan_item = function (plan) { vm.editItem(plan); };
        vm.cancel_plan_item = function (plan) { vm.cancelItem(plan); };
        vm.open_audit = function (a) {
            if (!a || !a.id) return;
            $location.path('/audits/' + a.id);
            $scope.$applyAsync();
        };


            cmsService.create_audit_from_plan(plan_id, dto).then(function (res) {
                if (!res || !res.IsSuccess) return;

                // اگر خواستی بعد از ساخت مستقیم برو داخل صفحه audit:
                // var new_id = res.Data && res.Data.id ? res.Data.id : null;
                // if (new_id) $location.path('/audits/' + new_id);

                vm.refresh();
            });
        };

        vm.lockProgram = function () {
            if (vm.program.status !== 'Approved') return;

            cmsService.lock_audit_program(program_id).then(function (res) {
                if (res && res.IsSuccess) vm.refresh();
            });
        };

        vm.exportProgram = function () {
            cmsService.export_audit_program(program_id).then(function (res) {
                console.log('exportProgram response', res);
            });
        };

        // ----------------------------
        // ✅ dx buttons/options (مثل فایل Finding)
        // ----------------------------
        vm.btn_programs = {
            text: 'Programs',
            icon: 'chevronleft',
            stylingMode: 'text',
            onClick: function () { $location.path('/iqs/audit/programs'); }
        };

        vm.btn_export = {
            text: 'Export',
            icon: 'download',
            type: 'normal',
            onClick: function () { vm.exportProgram(); }
        };

        vm.btn_add_item = {
            text: 'Add plan item',
            icon: 'plus',
            type: 'normal',
            stylingMode: "outlined",
            disabled: vm.isNew,   
            onClick: function () { vm.addItem(); }
        };

        vm.btn_lock_program = {
            text: 'Lock program',
            icon: 'lock',
            type: 'danger',
            onClick: function () { vm.lockProgram(); }
        };
        vm.btn_toggle_more_filters = {
            text: (vm.show_more_filters ? '▼ Advanced filters' : '▶ Advanced filters'),
            stylingMode: 'text',
            onClick: function () {
                vm.show_more_filters = !vm.show_more_filters;
                $scope.$applyAsync();
            }
        };

        // ----------------------------
        // Program inline edit
        // ----------------------------
        vm.program_edit = {
            is_edit: false,
            model: {}
        };

        vm.start_edit_program = function () {
            if (vm.program.status === 'Locked') return;

            vm.program_edit.model = angular.copy(vm.program || {});  // ⭐ این خط ضروریه
            vm.program_edit.is_edit = true;
        };

        vm.cancel_edit_program = function () {
            vm.program_edit.model = angular.copy(vm.program || {});
            vm.program_edit.is_edit = false;
        };


        vm.save_program = function () {
            if (vm.program.status === 'Locked') return;

            var p = vm.program_edit.model || {};
            var current = vm.program || {};
            var dto = {
                id: program_id,
                code: p.code || current.code || null,          // code nullable هست، ولی بهتره مقدار فعلی بره
                status: p.status || current.status || 'Draft', // status NOT NULL هست

                title: p.title,
                program_type: p.program_type,
                period_from: p.period_from,
                period_to: p.period_to,
                notes: (p.notes === undefined ? current.notes : p.notes), // ✅ فرق undefined با null
                updated_by: 4011
            };


            cmsService.save_audit_program(dto).then(function (res) {
                if (!res || !res.IsSuccess) return;

                // ✅ اگر create بود، برو به id واقعی
                if (vm.isNew) {
                    var newId = res.Data && res.Data.id ? res.Data.id : null;
                    if (newId) {
                        $location.path('/iqs/audit/program/' + newId);
                        $scope.$applyAsync();
                        return;
                    }
                }

                vm.program_edit.is_edit = false;
                vm.refresh();
                $scope.$applyAsync();
            });

        };

        // buttons
        vm.btn_edit_program = {
            text: 'Edit',
            icon: 'edit',
            type: 'normal',
            stylingMode: 'outlined',
            onClick: function () { vm.start_edit_program(); $scope.$applyAsync(); }
        };

        vm.btn_cancel_program = {
            text: 'Cancel',
            icon: 'close',
            type: 'normal',
            stylingMode: 'text',
            onClick: function () { vm.cancel_edit_program(); $scope.$applyAsync(); }
        };
      

        vm.btn_save_program = {
            text: 'Save',
            icon: 'save',
            type: 'default',
            onClick: function () { vm.save_program(); $scope.$applyAsync(); }
        };
        vm.is_program_readonly = function () {
            return !vm.program_edit.is_edit;
        };

        // bindings: وقتی edit روشن شد، از program_edit.model بخون؛ در غیر اینصورت از program
        vm.pd_bind = function (field) {
            return 'vm.program_edit.is_edit ? vm.program_edit.model.' + field + ' : vm.program.' + field;
        };

        // Code (readonly همیشه، چون trigger)
        vm.dx_pd_code = {
            stylingMode: 'filled',
            readOnly: true,
            bindingOptions: { value: 'vm.program_edit.model.code' }
        };

        vm.dx_pd_title = {
            stylingMode: 'filled',
            bindingOptions: {
                value: 'vm.program_edit.model.title', 
                readOnly: 'vm.is_program_readonly()'
            }
        };

        vm.dx_pd_type = {
            stylingMode: 'filled',
            items: vm.program_type_items,
            bindingOptions: {
                value: 'vm.program_edit.model.program_type', 
                readOnly: 'vm.is_program_readonly()'
            }
        };

        vm.dx_pd_from = {
            stylingMode: 'filled',
            type: 'date',
            displayFormat: 'yyyy-MM-dd',
            bindingOptions: {
                value: 'vm.program_edit.model.period_from',
                readOnly: 'vm.is_program_readonly()'
            }
        };

        vm.dx_pd_to = {
            stylingMode: 'filled',
            type: 'date',
            displayFormat: 'yyyy-MM-dd',
            bindingOptions: {
                value: 'vm.program_edit.model.period_to',
                readOnly: 'vm.is_program_readonly()'
            }
        };

        // Status فعلاً readonly (workflow)
        vm.dx_pd_status = {
            stylingMode: 'filled',
            items: vm.program_status_items,
            readOnly: true,
            bindingOptions: { value: 'vm.program_edit.model.status' }
        };

        vm.dx_pd_notes = {
            stylingMode: 'filled',
            height: 90,
            bindingOptions: {
                value: 'vm.program_edit.model.notes',
                readOnly: 'vm.is_program_readonly()'
            }
        };







        // Filters editors
        vm.sb_filter_department = {
            searchEnabled: true,
            dataSource: vm.departments,   // یا bindingOptions پایین
            valueExpr: 'id',
            displayExpr: 'title',
            placeholder: 'All',
            showClearButton: true,
            bindingOptions: {
                dataSource: 'vm.locations',
                value: 'vm.filters.department_id'
            }
        };


        vm.sb_search_q = {
            placeholder: 'scope, dept, method...',
            showClearButton: true,
            valueChangeEvent: 'keyup', // یا 'input keyup' اگر خواستی
            onValueChanged: function (e) {
                vm.filters.q = (e && e.value) ? e.value : '';
                $scope.$applyAsync();   // 👈 کلید حل ماجرا
            }
        };

        vm.sb_filter_window = {
            valueExpr: 'value',
            displayExpr: 'label',
            bindingOptions: { items: 'vm.windows', value: 'vm.filters.window' },
            placeholder: 'All'
        };

        vm.sb_filter_priority = {
            items: [
                { id: '', text: 'All' },
                { id: 'High', text: 'High' },
                { id: 'Medium', text: 'Medium' },
                { id: 'Low', text: 'Low' }
            ],
            valueExpr: 'id',
            displayExpr: 'text',
            bindingOptions: { value: 'vm.filters.priority' }
        };

        vm.sb_filter_mode = {
            items: [
                { id: '', text: 'All' },
                { id: 'Onsite', text: 'Onsite' },
                { id: 'Remote', text: 'Remote' }
            ],
            valueExpr: 'id',
            displayExpr: 'text',
            bindingOptions: { value: 'vm.filters.mode' }
        };

        vm.btn_reset_filters = {
            text: 'Reset',
            icon: 'refresh',
            stylingMode: 'text',
            onClick: function () { vm.clearFilters(); }
        };

        
        // ----------------------------
        // DevExtreme Plan Grid (master-detail)
        // ----------------------------
        vm.planGridInstance = null;
        vm.dx_plan_grid = {
            bindingOptions: { dataSource: 'vm.items' },
            keyExpr: "id",
            showBorders: false,
            hoverStateEnabled: true,
            rowAlternationEnabled: false,
            columnAutoWidth: true,
            allowColumnResizing: true,
            columnResizingMode: "widget",
            paging: { enabled: false },
            scrolling: { mode: "standard" },
            selection: { mode: "single" },
            onInitialized: function (e) { vm.planGridInstance = e.component; },

            columns: [
                { dataField: "plan_code", caption: "Code", width: 140 },
                {
                    dataField: "scope_title", caption: "Scope / plan",
                    cellTemplate: function (container, options) {
                        var p = options.data || {};
                        var title = (p.scope_title || "");
                        var dept = (p.department_title || "—");
                        var period = (p.period_label || "—");
                        var priority = (p.priority || "");
                        var chips = [];
                        if (dept) chips.push('<span class="mini-chip">'+dept+'</span>');
                        if (period && period !== '—') chips.push('<span class="mini-chip">'+period+'</span>');
                        if (priority) chips.push('<span class="mini-chip">'+priority+'</span>');
                        var html = '<div style="font-weight:700">'+title+'</div>'
                                 + '<div style="opacity:.85;margin-top:4px">'+chips.join(' ')+'</div>';
                        container.append(html);
                    }
                },
                { dataField: "audit_method", caption: "Method", width: 120 },
                { dataField: "execution_mode", caption: "Mode", width: 110 },

                {
                    caption: "Actions", width: 210, alignment: "right",
                    cellTemplate: function (container, options) {
                        var p = options.data || {};
                        var wrap = $("<div>").addClass("action-icons").css({ justifyContent: "flex-end" });

                        // Refs
                        $("<div>")
                            .addClass("icon-btn")
                            .attr("title", "Refs")
                            .text("Refs")
                            .on("click", function () { vm.open_refs(p); })
                            .appendTo(wrap);

                        // Open
                        $("<div>")
                            .addClass("icon-btn")
                            .attr("title", "Open")
                            .text("↗")
                            .on("click", function () { vm.open_plan_item(p); })
                            .appendTo(wrap);

                        // Edit
                        $("<div>")
                            .addClass("icon-btn")
                            .attr("title", "Edit")
                            .text("✎")
                            .on("click", function () { vm.edit_plan_item(p); })
                            .appendTo(wrap);

                        // Cancel (soft delete)
                        $("<div>")
                            .addClass("icon-btn danger")
                            .attr("title", "Cancel")
                            .text("×")
                            .on("click", function () { vm.cancel_plan_item(p); })
                            .appendTo(wrap);

                        wrap.appendTo(container);
                    }
                }
            ],

            masterDetail: {
                enabled: true,
                autoExpandAll: true, // ✅ show audits under each plan by default (no extra click)
                template: function (container, options) {
                    var p = options.data || {};
                    var audits = (p.audits || []);

                    // Use theme classes (minimal inline CSS)
                    var wrap = $("<div>").addClass("plan-audits-wrap");

                    var head = $("<div>").addClass("plan-audits-head");

                    var left = $("<div>").addClass("plan-audits-left");
                    $("<div>").addClass("plan-audits-title").text("AUDITS").appendTo(left);
                    // hint is optional; keep it subtle
                    $("<div>").addClass("plan-audits-hint").text(audits.length ? (audits.length + " item(s)") : "No audits yet").appendTo(left);
                    left.appendTo(head);

                    var right = $("<div>").addClass("plan-audits-right");
                    var newBtnWrap = $("<div>").addClass("plan-audits-new");
                    $("<div>").dxButton({
                        text: "New Audit",
                        type: "default",
                        stylingMode: "outlined",
                        onClick: function () { vm.create_audit_from_plan(p); }
                    }).appendTo(newBtnWrap);
                    newBtnWrap.appendTo(right);
                    right.appendTo(head);

                    head.appendTo(wrap);

                    $("<div>").addClass("audits-grid").dxDataGrid({
                        dataSource: audits,
                        keyExpr: "id",
                        showBorders: false,
                        hoverStateEnabled: true,
                        columnAutoWidth: true,
                        paging: { enabled: false },
                        columns: [
                            { dataField: "code", caption: "Code", width: 150 },
                            { dataField: "department_title", caption: "Dept", width: 180 },
                            { dataField: "audit_date", caption: "Audit date", dataType: "date", format: "yyyy-MM-dd", width: 140 },
                            { dataField: "scheduled_start", caption: "Start", dataType: "date", format: "yyyy-MM-dd", width: 140 },
                            { dataField: "scheduled_end", caption: "End", dataType: "date", format: "yyyy-MM-dd", width: 140 },
                            {
                                caption: "", width: 90, alignment: "right",
                                cellTemplate: function (c, o) {
                                    $("<div>").dxButton({
                                        text: "Open",
                                        stylingMode: "outlined",
                                        onClick: function () { vm.open_audit(o.data); }
                                    }).appendTo(c);
                                }
                            }
                        ],
                        noDataText: "No audits yet."
                    }).appendTo(wrap);

                    wrap.appendTo(container);
                }
            }
        };


        vm.btn_refresh = {
            text: 'Refresh',
            icon: 'repeat',
            type: 'normal',
            onClick: function () { vm.refresh(); }
        };

        // row buttons: factory (مهم!)
        vm.btn_create_audit = function (it) {
            return {
                text: 'Create audit',
                icon: 'plus',
                type: 'default',
                onClick: function (e) {
                    if (e && e.event) e.event.stopPropagation();
                    vm.createAuditFromItem(it);
                    $scope.$applyAsync();
                }
            };
        };

        vm.btn_view_audit = function (it) {
            return {
                text: 'View audit',
                icon: 'find',
                type: 'normal',
                onClick: function (e) {
                    if (e && e.event) e.event.stopPropagation();
                    var id = it.audit_id || it.auditId;
                    $location.path('/audits/' + id);
                    $scope.$applyAsync();
                }
            };
        };

        vm.btn_edit_item = function (it) {
            return {
                text: 'Edit',
                icon: 'edit',
                stylingMode: 'text',
                onClick: function (e) {
                    if (e && e.event) e.event.stopPropagation();
                    vm.editItem(it);
                    $scope.$applyAsync();
                }
            };
        };

        vm.btn_cancel_item = function (it) {
            return {
                text: 'Cancel',
                icon: 'close',
                type: 'danger',
                stylingMode: 'text',
                onClick: function (e) {
                    if (e && e.event) e.event.stopPropagation();
                    vm.cancelItem(it);
                    $scope.$applyAsync();
                }
            };
        };
        //-----------------EDIT plan------------------
        vm.edit_plan = {
            visible: false,
            id: null,

            // snake_case
            plan_code: '',
            scope_title: '',
            department_id: null,

            planned_period_type: 'Month',
            planned_period_value: null,
            planned_year: new Date().getFullYear(),

            audit_method: null,
            execution_mode: null,
            priority: 'Medium',
            planned_count: null,
            notes: ''
        };

        // باز کردن ادیت از روی row (همون data که داری)
        vm.editItem = function (it) {
            if (!it || !it.id) return;

            vm.edit_plan.id = it.id;
            vm.edit_plan.plan_code = it.plan_code || '';
            vm.edit_plan.scope_title = it.scope_title || '';
            vm.edit_plan.department_id = it.department_id || null;

            vm.edit_plan.planned_period_type = it.planned_period_type || 'Month';
            vm.edit_plan.planned_period_value = it.planned_period_value || null;
            vm.edit_plan.planned_year = it.planned_year || new Date().getFullYear();

            vm.edit_plan.audit_method = it.audit_method || null;
            vm.edit_plan.execution_mode = it.execution_mode || null;
            vm.edit_plan.priority = it.priority || 'Medium';
            vm.edit_plan.planned_count = it.planned_count || null;
            vm.edit_plan.notes = it.notes || '';

            vm.edit_plan.visible = true;
        };

        vm.save_edit_plan = function () {
            // if (!vm.edit_plan.id) return;
            if (!vm.edit_plan.scope_title || !vm.edit_plan.scope_title.trim()) return;

            var dto = {
                id: vm.edit_plan.id || -1,

                // چون SaveAuditPlan برای Create هم هست، اینجا فقط برای امنیت می‌فرستیم
                program_id: program_id,

                code: vm.edit_plan.plan_code,
                title: vm.edit_plan.scope_title,

                department_id: vm.edit_plan.department_id,
                planned_period_type: vm.edit_plan.planned_period_type,
                planned_period_value: vm.edit_plan.planned_period_value,
                planned_year: vm.edit_plan.planned_year,

                priority: vm.edit_plan.priority,
                audit_method: vm.edit_plan.audit_method,
                execution_mode: vm.edit_plan.execution_mode,
                planned_count: vm.edit_plan.planned_count,
                notes: vm.edit_plan.notes,

                created_by: 4011
            };

            cmsService.save_audit_plan(dto).then(function (res) {
                if (!res || !res.IsSuccess) return;

                vm.edit_plan.visible = false;
                vm.refresh();
            });
        };
        vm.dx_edit_plan_popup = {
            width: 900,
            height: 'auto',
            showTitle: true,
            //title: 'Edit plan item',
            shading: true,
            dragEnabled: true,
            closeOnOutsideClick: true,
            bindingOptions: {
                visible: 'vm.edit_plan.visible',
                title: 'vm.edit_plan.id ? "Edit plan item" : "Add plan item"'
            }
        };

        vm.dx_ep_code = { bindingOptions: { value: 'vm.edit_plan.plan_code' } };
        vm.dx_ep_title = { bindingOptions: { value: 'vm.edit_plan.scope_title' } };

        // department: فعلاً از locations استفاده کن چون API locations داری و FK هم به Location زده
        vm.locations = vm.locations || [];
        //cmsService.get_locations().then(function (res) {
        //    vm.locations = (res && res.IsSuccess) ? (res.Data || []) : [];
        //});

        //vm.dx_ep_department = {
        //    dataSource: vm.locations, // اگر bindingOptions خواستی: bindingOptions: { dataSource: 'vm.locations' }
        //    valueExpr: 'id',
        //    displayExpr: 'title',
        //    searchEnabled: true,
        //    bindingOptions: { value: 'vm.edit_plan.department_id' }
        //};
        vm.dx_ep_department = {
            searchEnabled: true,
            valueExpr: 'id',
            displayExpr: 'title',
            placeholder: 'Select department...',
            bindingOptions: {
                dataSource: 'vm.locations',
                value: 'vm.edit_plan.department_id'
            }
        };


        vm.dx_ep_period_type = {
            items: ['Month', 'Quarter'],
            bindingOptions: { value: 'vm.edit_plan.planned_period_type' }
        };

        vm.dx_ep_period_value = { min: 1, bindingOptions: { value: 'vm.edit_plan.planned_period_value' } };
        vm.dx_ep_year = { min: 2020, bindingOptions: { value: 'vm.edit_plan.planned_year' } };

        vm.dx_ep_audit_method = {
            items: ['GapAnalysis', 'LOSA', 'Inspection', 'Compliance', 'System', 'Product', 'Process'],
            bindingOptions: { value: 'vm.edit_plan.audit_method' }
        };

        vm.dx_ep_execution_mode = {
            items: ['Onsite', 'Remote'],
            bindingOptions: { value: 'vm.edit_plan.execution_mode' }
        };

        vm.dx_ep_priority = {
            items: ['High', 'Medium', 'Low'],
            bindingOptions: { value: 'vm.edit_plan.priority' }
        };

        vm.dx_ep_planned_count = { min: 1, bindingOptions: { value: 'vm.edit_plan.planned_count' } };
        vm.dx_ep_notes = { height: 70, bindingOptions: { value: 'vm.edit_plan.notes' } };

        vm.dx_ep_cancel_btn = {
            text: 'Cancel',
            onClick: function () { vm.edit_plan.visible = false; $scope.$applyAsync(); }
        };

        vm.dx_ep_save_btn = {
            text: 'Save',
            type: 'default',
            icon: 'save',
            onClick: function () { vm.save_edit_plan(); $scope.$applyAsync(); }
        };


        // ----------------------------
        // ✅ Refs Popup (همه config اینجاست)
        // ----------------------------
        vm.refs_modal = {
            visible: false,
            plan_item: {},
            docs: [],
            clauses: [],
            refs: [],
            selected_doc_id: null,
            selected_clause_id: null,
            weight: 3,
            note: '',
            loading_docs: false,
            loading_clauses: false
        };

        vm.open_refs = function (it) {
            vm.refs_modal.plan_item = it || {};
            vm.refs_modal.visible = true;

            vm.refs_modal.selected_doc_id = null;
            vm.refs_modal.selected_clause_id = null;
            vm.refs_modal.clauses = [];
            vm.refs_modal.weight = 3;
            vm.refs_modal.note = '';

            it.refs = it.refs || [];
            vm.refs_modal.refs = it.refs;
            it.ref_count = it.refs.length;

            if (!vm.refs_modal.docs || vm.refs_modal.docs.length === 0) {
                vm.refs_modal.loading_docs = true;
                cmsService.get_ref_docs().then(function (res) {
                    vm.refs_modal.docs = (res && res.IsSuccess) ? (res.Data || []) : [];
                }).finally(function () {
                    vm.refs_modal.loading_docs = false;
                });
            }

            cmsService.get_plan_refs(it.id).then(function (res) {
                it.refs = (res && res.IsSuccess) ? (res.Data || []) : [];
                it.ref_count = it.refs.length;
                if (vm.refs_modal.plan_item && vm.refs_modal.plan_item.id === it.id) {
                    vm.refs_modal.refs = it.refs;
                }
            });
        };

        vm.btn_refs = function (it) {
            return {
                text: 'Refs',
                icon: 'bookmark',
                stylingMode: 'text',
                onClick: function (e) {
                    if (e && e.event) e.event.stopPropagation();
                    vm.open_refs(it);
                    $scope.$applyAsync();
                }
            };
        };

        vm.close_refs = function () {
            vm.refs_modal.visible = false;
        };

        vm.on_doc_changed = function (e) {
            var docId = e && e.value ? e.value : null;
            vm.refs_modal.selected_doc_id = docId;
            vm.refs_modal.selected_clause_id = null;
            vm.refs_modal.clauses = [];

            if (!docId) return;

            vm.refs_modal.loading_clauses = true;
            cmsService.get_ref_clauses(docId).then(function (res) {
                vm.refs_modal.clauses = (res && res.IsSuccess) ? (res.Data || []) : [];
            }).finally(function () {
                vm.refs_modal.loading_clauses = false;
            });
        };

        vm.add_plan_ref = function () {
            var it = vm.refs_modal.plan_item;
            if (!it || !it.id) return;
            if (!vm.refs_modal.selected_doc_id) return;

            var dto = {
                doc_id: vm.refs_modal.selected_doc_id,
                clause_id: vm.refs_modal.selected_clause_id || null,
                weight: vm.refs_modal.weight || null,
                note: vm.refs_modal.note || null
            };

            cmsService.add_plan_ref(it.id, dto).then(function (res) {
                if (!res || !res.IsSuccess) return;

                return cmsService.get_plan_refs(it.id).then(function (r2) {
                    it.refs = (r2 && r2.IsSuccess) ? (r2.Data || []) : [];
                    it.ref_count = it.refs.length;
                    vm.refs_modal.refs = it.refs;
                });
            });
        };

        vm.delete_plan_ref = function (refId) {
            if (!refId) return;

            cmsService.delete_plan_ref(refId).then(function (res) {
                if (!res || !res.IsSuccess) return;

                var it = vm.refs_modal.plan_item;
                if (!it) return;

                return cmsService.get_plan_refs(it.id).then(function (r2) {
                    it.refs = (r2 && r2.IsSuccess) ? (r2.Data || []) : [];
                    it.ref_count = it.refs.length;
                    vm.refs_modal.refs = it.refs;
                });
            });
        };

        vm.dx_refs_popup = {
            width: 820,
            height: 'auto',
            dragEnabled: true,
            showTitle: true,
            title: 'Plan Item References',
            shading: true,
            closeOnOutsideClick: true,
            bindingOptions: { visible: 'vm.refs_modal.visible' },
            onHiding: function () { vm.close_refs(); }
        };

        vm.dx_doc_select = {
            searchEnabled: true,
            valueExpr: 'id',
            displayExpr: function (d) { return d ? (d.doc_type + ' — ' + d.title) : ''; },
            placeholder: 'Select document...',
            bindingOptions: {
                dataSource: 'vm.refs_modal.docs',
                value: 'vm.refs_modal.selected_doc_id',
                disabled: 'vm.refs_modal.loading_docs'
            },
            onValueChanged: vm.on_doc_changed
        };

        vm.dx_clause_select = {
            searchEnabled: true,
            valueExpr: 'id',
            displayExpr: function (c) { return c ? (c.clause_code + ' — ' + (c.title || c.clause_title || '')) : ''; },
            placeholder: 'Optional clause...',
            bindingOptions: {
                dataSource: 'vm.refs_modal.clauses',
                value: 'vm.refs_modal.selected_clause_id',
                disabled: 'vm.refs_modal.loading_clauses'
            }
        };

        vm.dx_weight = {
            min: 1, max: 5, showSpinButtons: true,
            bindingOptions: { value: 'vm.refs_modal.weight' }
        };

        vm.dx_note = {
            placeholder: 'e.g., baseline compliance criteria',
            bindingOptions: { value: 'vm.refs_modal.note' }
        };

        vm.dx_add_ref_btn = {
            text: 'Add reference',
            type: 'default',
            icon: 'plus',
            bindingOptions: { disabled: '!vm.refs_modal.selected_doc_id' },
            onClick: function () {
                vm.add_plan_ref();
                $scope.$applyAsync();
            }
        };

        vm.dx_close_refs_btn = {
            text: 'Close',
            type: 'normal',
            onClick: function () {
                vm.close_refs();
                $scope.$applyAsync();
            }
        };

        vm.dx_refs_grid = {
            bindingOptions: { dataSource: 'vm.refs_modal.refs' },
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
                                vm.delete_plan_ref(options.data.id);
                                $scope.$applyAsync();
                            }
                        }).appendTo(container);
                    }
                }
            ]
        };

        // ----------- scroll -----------
        $scope.scroll_content_height = $(window).height() - 130;
        $scope.scroll_content = {
            width: '100%',
            bounceEnabled: false,
            showScrollbar: 'onHover',
            useNative: true,
            onPullDown: function (options) {
                vm.refresh();
                options.component.release();
            },
            bindingOptions: { height: 'scroll_content_height' }
        };

        // init
        vm.load_locations();
        vm.refresh();
    }]);
