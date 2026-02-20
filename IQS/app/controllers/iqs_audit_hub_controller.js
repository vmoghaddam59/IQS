'use strict';
app.controller('iqs_audit_hub_controller', ['$location', '$scope', '$q', 'cmsService',
    function ($location, $scope, $q, cmsService) {

     

        $scope.loading = false;

        // ----------------------------
        // model (snake_case)
        // ----------------------------
        $scope.kpi = {
            overall_coverage_pct: 0,
            active_programs: 0,
            planned_items: 0,
            created_audits: 0,
            open_findings: 0,     // phase 2
            overdue_actions: 0    // phase 2
        };

        $scope.programs = [];

        // ----------------------------
        // actions (dx buttons)
        // ----------------------------
        $scope.btn_go_programs = {
            text: 'Programs',
            icon: 'menu',
            type: 'normal',
            onClick: function () { $location.path('iqs/audit/programs'); $scope.$applyAsync(); }
        };

        $scope.btn_go_audits = {
            text: 'Audits',
            icon: 'task',
            type: 'normal',
            onClick: function () { $location.path('/audits'); $scope.$applyAsync(); }
        };

        $scope.btn_refresh = {
            text: 'Refresh',
            icon: 'refresh',
            type: 'default',
            onClick: function () { $scope.refresh(); }
        };

        // ----------------------------
        // helpers
        // ----------------------------
        function safe_int(x) {
            var n = parseInt(x, 10);
            return isNaN(n) ? 0 : n;
        }

        function calc_program_stats(items) {
            items = items || [];
            var planned = items.length;

            var created = 0;
            var in_progress = 0;
            var completed = 0;
            var cancelled = 0;

            for (var i = 0; i < items.length; i++) {
                var st = (items[i].status || '').toString();
                if (st === 'Created' || st === 'InProgress' || st === 'Completed' || st === 'Cancelled') created++;
                if (st === 'InProgress') in_progress++;
                if (st === 'Completed') completed++;
                if (st === 'Cancelled') cancelled++;
            }

            var coverage_pct = 0;
            if (planned > 0) coverage_pct = Math.round((created / planned) * 100);

            return {
                planned_items: planned,
                created_audits: created,
                in_progress: in_progress,
                completed: completed,
                cancelled: cancelled,
                coverage_pct: coverage_pct
            };
        }

        // ----------------------------
        // grid (Programs overview)
        // ----------------------------
        $scope.open_program = function (row) {
            if (!row) return;
            $location.path('/audit-program/' + row.id);
            $scope.$applyAsync();
        };

        $scope.dx_programs_grid = {
            bindingOptions: { dataSource: '$scope.programs' },
            showBorders: true,
            columnAutoWidth: true,
            rowAlternationEnabled: true,
            hoverStateEnabled: true,
            paging: { enabled: false },
            noDataText: 'No programs.',
            onRowClick: function (e) {
                if (!e || !e.data) return;
                $scope.open_program(e.data);
            },
            columns: [
                { caption: 'Code', dataField: 'code', width: 120 },
                { caption: 'Title', dataField: 'title' },
                { caption: 'Status', dataField: 'status', width: 110 },
                {
                    caption: 'Period',
                    width: 170,
                    calculateCellValue: function (r) {
                        if (!r) return '—';
                        var pf = r.period_from ? DevExpress.localization.formatDate(new Date(r.period_from), 'yyyy-MM-dd') : '—';
                        var pt = r.period_to ? DevExpress.localization.formatDate(new Date(r.period_to), 'yyyy-MM-dd') : '—';
                        return pf + ' → ' + pt;
                    }
                },
                { caption: 'Planned', dataField: 'planned_items', width: 90 },
                { caption: 'Created', dataField: 'created_audits', width: 90 },
                {
                    caption: 'Coverage',
                    width: 110,
                    calculateCellValue: function (r) { return (r && r.coverage_pct != null) ? (r.coverage_pct + '%') : '—'; }
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
                                $scope.open_program(options.data);
                                $scope.$applyAsync();
                            }
                        }).appendTo(container);
                    }
                }
            ]
        };

        // ----------------------------
        // load
        // ----------------------------
        $scope.refresh = function () {
            $scope.loading = true;

            // reset
            $scope.kpi.overall_coverage_pct = 0;
            $scope.kpi.active_programs = 0;
            $scope.kpi.planned_items = 0;
            $scope.kpi.created_audits = 0;

            cmsService.get_audit_programs().then(function (res) {
                if (!res || !res.IsSuccess) {
                    $scope.programs = [];
                    return;
                }

                var list = res.Data || [];
                $scope.programs = list.map(function (p) {
                    return {
                        id: p.id,
                        code: p.code,
                        title: p.title,
                        status: p.status,
                        period_from: p.period_from,
                        period_to: p.period_to,

                        // computed later
                        planned_items: 0,
                        created_audits: 0,
                        coverage_pct: 0
                    };
                });

                // active programs count
                var active = 0;
                $scope.programs.forEach(function (p) {
                    if (p.status && p.status !== 'Locked') active++;
                });
                $scope.kpi.active_programs = active;

                // compute per-program stats using existing endpoint
                var calls = $scope.programs.map(function (p) {
                    return cmsService.get_audit_program_items(p.id).then(function (r2) {
                        var items = (r2 && r2.IsSuccess) ? (r2.Data || []) : [];
                        var st = calc_program_stats(items);

                        p.planned_items = st.planned_items;
                        p.created_audits = st.created_audits;
                        p.coverage_pct = st.coverage_pct;

                        $scope.kpi.planned_items += safe_int(st.planned_items);
                        $scope.kpi.created_audits += safe_int(st.created_audits);
                    });
                });

                return $q.all(calls).then(function () {
                    if ($scope.kpi.planned_items > 0) {
                        $scope.kpi.overall_coverage_pct = Math.round(($scope.kpi.created_audits / $scope.kpi.planned_items) * 100);
                    } else {
                        $scope.kpi.overall_coverage_pct = 0;
                    }
                });
            }).finally(function () {
                $scope.loading = false;
                $scope.$applyAsync();
            });
        };

        // ----------------------------
        // scroll (same as your pages)
        // ----------------------------
        $scope.scroll_content_height = $(window).height() - 130;
        $scope.scroll_content = {
            width: '100%',
            bounceEnabled: false,
            showScrollbar: 'onHover',
            useNative: true,
            onPullDown: function (options) {
                $scope.refresh();
                options.component.release();
            },
            bindingOptions: { height: 'scroll_content_height' }
        };

        // init
        $scope.refresh();
    }]);
