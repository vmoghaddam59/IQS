'use strict';
app.controller('iqs_audit_list_controller', ['$location', '$scope', 'cmsService',
    function ($location, $scope, cmsService) {

        var vm = this;

        vm.loading = false;
        vm.audits = [];

        // (اختیاری) اگر خواستی toolbar فیلتر خیلی کم داشته باشی:
        vm.filters = { program_id: null, plan_id: null, status: null, q: null };

        // read querystring context (program_id/plan_id)
        var qs = $location.search() || {};
        if (qs.program_id) vm.filters.program_id = parseInt(qs.program_id, 10) || qs.program_id;
        if (qs.plan_id) vm.filters.plan_id = parseInt(qs.plan_id, 10) || qs.plan_id;

        vm.btn_refresh = {
            text: 'Refresh',
            icon: 'repeat',
            type: 'default',
            onClick: function () { vm.refresh(); }
        };

        vm.btn_new_audit = {
            text: 'New',
            icon: 'plus',
            type: 'default',
            onClick: function () {
                // اگر ساخت Audit دستی داری، مسیرش
                $location.path('/audit/-1');
                $scope.$applyAsync();
            }
        };

        vm.open_audit = function (row) {
            if (!row || !row.id) return;
            $location.path('/audit/' + row.id);
            $scope.$applyAsync();
        };

        vm.dx_audits_grid = {
            bindingOptions: { dataSource: 'vm.audits' },
            showBorders: true,
            rowAlternationEnabled: true,
            hoverStateEnabled: true,
            columnAutoWidth: true,

            // ✅ فیلترها داخل خود grid
            searchPanel: { visible: true, placeholder: 'Search code, title, scope, area...', width: 320 },
            filterRow: { visible: true, applyFilter: 'auto' },
            headerFilter: { visible: true },
            paging: { pageSize: 20 },
            pager: { showPageSizeSelector: true, allowedPageSizes: [10, 20, 50] },

            onRowDblClick: function (e) { if (e && e.data) vm.open_audit(e.data); },

            columns: [
                { caption: 'Code', dataField: 'code', width: 140 },
                { caption: 'Title', dataField: 'title' },
                { caption: 'Status', dataField: 'status', width: 120 },
                { caption: 'Method', dataField: 'audit_method', width: 120 },
                { caption: 'Mode', dataField: 'execution_mode', width: 110 },
                {
                    caption: 'Scheduled',
                    width: 200,
                    calculateCellValue: function (r) {
                        if (!r) return '—';
                        var s = r.scheduled_start ? DevExpress.localization.formatDate(new Date(r.scheduled_start), 'yyyy-MM-dd') : '—';
                        var e = r.scheduled_end ? DevExpress.localization.formatDate(new Date(r.scheduled_end), 'yyyy-MM-dd') : '—';
                        return s + ' → ' + e;
                    }
                },
                {
                    caption: '',
                    width: 90,
                    cellTemplate: function (container, options) {
                        $('<div>').dxButton({
                            text: 'Open',
                            icon: 'arrowright',
                            type: 'default',
                            stylingMode: 'text',
                            onClick: function (e) {
                                if (e && e.event) e.event.stopPropagation();
                                vm.open_audit(options.data);
                                $scope.$applyAsync();
                            }
                        }).appendTo(container);
                    }
                }
            ]
        };

        vm.refresh = function () {
            vm.loading = true;

            cmsService.get_audits({
                program_id: vm.filters.program_id,
                status: vm.filters.status,
                q: vm.filters.q
            }).then(function (res) {
                vm.audits = (res && res.IsSuccess) ? (res.Data || []) : [];
            }).finally(function () {
                vm.loading = false;
                $scope.$applyAsync();
            });
        };

        // scroll
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

        vm.refresh();
    }]);
