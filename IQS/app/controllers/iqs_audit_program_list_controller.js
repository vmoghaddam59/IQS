'use strict';
app.controller('iqs_audit_program_list_controller',
    ['$scope', '$location', 'cmsService',
        function ($scope, $location, cmsService) {

            var vm = this;

            // ----------------------------
            // model
            // ----------------------------
            vm.programs = [];
            vm.filters = {
                q: '',
                status: '',
                program_type: ''
            };

            vm.type_list = [{ id: '', text: 'All' }];

            // instance refs
            vm.program_grid_instance = null;
            vm.programs_ds = null;

            // ----------------------------
            // helpers
            // ----------------------------
            function norm(s) { return (s === null || s === undefined) ? '' : ('' + s).toLowerCase(); }
            function contains(h, n) { h = norm(h); n = norm(n); return !n || h.indexOf(n) >= 0; }

            function program_type_of(p) {
                return (p && (p.program_type || p.typeTitle || p.type_title)) || '';
            }

            function build_type_list() {
                var map = {};
                vm.type_list = [{ id: '', text: 'All' }];

                (vm.programs || []).forEach(function (p) {
                    var t = program_type_of(p);
                    if (t && !map[t]) {
                        map[t] = true;
                        vm.type_list.push({ id: t, text: t });
                    }
                });
            }

            vm.apply_filters = function () {
                if (vm.programs_ds) vm.programs_ds.reload();
            };

            vm.clear_filters = function () {
                vm.filters.q = '';
                vm.filters.status = '';
                vm.filters.program_type = '';
                vm.apply_filters();
            };

            vm.open_program = function (program_id) {
                if (!program_id) return;
                // ✅ مسیر صحیح با /
                $location.path('/iqs/audit/program/' + program_id);
                $scope.$applyAsync();
            };

            // ----------------------------
            // datasource (single source of truth)
            // ----------------------------
            function ensure_data_source() {
                if (vm.programs_ds) return;

                vm.programs_ds = new DevExpress.data.DataSource({
                    load: function () {
                        var list = vm.programs || [];

                        var q = (vm.filters.q || '').trim();
                        var st = vm.filters.status || '';
                        var tp = vm.filters.program_type || '';

                        var out = list.filter(function (p) {
                            if (!p) return false;

                            if (q) {
                                var blob =
                                    (p.title || '') + ' ' +
                                    (p.code || '') + ' ' +
                                    (program_type_of(p) || '') + ' ' +
                                    (p.owner_name || p.ownerName || '');
                                if (!contains(blob, q)) return false;
                            }

                            if (st && (p.status || '') !== st) return false;

                            var pt = program_type_of(p);
                            if (tp && (pt || '') !== tp) return false;

                            return true;
                        });

                        return out;
                    }
                });
            }

            // ----------------------------
            // load
            // ----------------------------
            vm.refresh = function () {
                cmsService.get_audit_programs().then(function (res) {
                    if (!res || !res.IsSuccess) { vm.programs = []; build_type_list(); vm.apply_filters(); return; }

                    vm.programs = res.Data || [];
                    build_type_list();

                    ensure_data_source();
                    vm.apply_filters();

                    $scope.$applyAsync();
                });
            };

            // ----------------------------
            // devexpress: buttons
            // ----------------------------
            vm.btn_hub = {
                text: 'Hub',
                icon: 'home',
                stylingMode: 'text',
                onClick: function () {
                    $location.path('/iqs/audit/hub');
                    $scope.$applyAsync();
                }
            };

            vm.btn_refresh = {
                text: 'Refresh',
                icon: 'repeat',
                type: 'normal',
                onClick: function () { vm.refresh(); }
            };
            vm.btn_new_program = {
                text: 'New program',
                icon: 'plus',
                type: 'default',
                onClick: function () {
                    // create mode
                    $location.path('/iqs/audit/program/-1');
                    $scope.$applyAsync();
                }
            };


            vm.btn_clear_filters = {
                text: 'Clear',
                icon: 'clear',
                stylingMode: 'text',
                onClick: function () { vm.clear_filters(); $scope.$applyAsync(); }
            };

            // ----------------------------
            // devexpress: filter editors
            // ----------------------------
            vm.dx_search = {
                placeholder: 'title, code...',
                showClearButton: true,
                valueChangeEvent: 'keyup',
                bindingOptions: { value: 'vm.filters.q' },
                onValueChanged: function () { vm.apply_filters(); $scope.$applyAsync(); }
            };

            vm.dx_status = {
                items: [
                    { id: '', text: 'All' },
                    { id: 'Draft', text: 'Draft' },
                    { id: 'Approved', text: 'Approved' },
                    { id: 'Locked', text: 'Locked' }
                ],
                valueExpr: 'id',
                displayExpr: 'text',
                bindingOptions: { value: 'vm.filters.status' },
                onValueChanged: function () { vm.apply_filters(); $scope.$applyAsync(); }
            };

            vm.dx_type = {
                items: [
                    { id: '', text: 'All' },
                    { id: 'Annual', text: 'Annual' },
                    { id: 'Rolling', text: 'Rolling' },
                    { id: 'Campaign', text: 'Campaign' },
                    { id: 'Regulatory', text: 'Regulatory' },
                    { id: 'RiskBased', text: 'RiskBased' }
                ],
                valueExpr: 'id',
                displayExpr: 'text',
                placeholder: 'All',
                searchEnabled: true,
                showClearButton: true,
                bindingOptions: { value: 'vm.filters.program_type' },
                onValueChanged: function () { vm.apply_filters(); $scope.$applyAsync(); }
            };

            // ----------------------------
            // devexpress: grid
            // ----------------------------
            ensure_data_source();

            vm.dx_program_grid = {
                showBorders: true,
                columnAutoWidth: true,
                rowAlternationEnabled: true,
                hoverStateEnabled: true,
                selection: { mode: 'single' },
                paging: { pageSize: 25 },
                pager: { showPageSizeSelector: true, allowedPageSizes: [10, 25, 50, 100], showInfo: true },
                noDataText: 'No programs found.',

                // ✅ فقط همین datasource
                dataSource: vm.programs_ds,

                onInitialized: function (e) { vm.program_grid_instance = e.component; },

                filterRow: { visible: false },
                headerFilter: { visible: false },
                searchPanel: { visible: false },

                onRowDblClick: function (e) {
                    if (e && e.data) vm.open_program(e.data.id);
                },

                columns: [
                    {
                        caption: 'Program',
                        minWidth: 250,
                        cellTemplate: function (container, options) {
                            var p = options.data || {};
                            var title = p.title || '—';
                            //var code = p.code || ('#' + (p.id || '—'));
                            //var typeTitle = program_type_of(p) || '—';
                            var owner = p.owner_name || p.ownerName || '—';

                            var $wrap = $('<div>');

                            $('<div>')
                                .css({ fontWeight: 600, color: 'var(--text-main)' })
                                .text(title)
                                .appendTo($wrap);

                            var $hint = $('<div>').addClass('hint').css({ marginTop: '2px' });
                          //  $('<span>').addClass('tag').text(code).appendTo($hint);
                          //  $('<span>').css({ marginLeft: '6px' }).text('Type: ' + typeTitle).appendTo($hint);

                            if (owner && owner !== '—') {
                                $('<span>').css({ marginLeft: '6px', color: 'var(--text-soft)' }).text('•').appendTo($hint);
                                $('<span>').css({ marginLeft: '6px' }).text('Owner: ' + owner).appendTo($hint);
                            }

                            $hint.appendTo($wrap);
                            $wrap.appendTo(container);
                        }
                    },
                    {
                        caption: 'Code',
                        width: 150,
                        cellTemplate: function (container, options) {
                            var p = options.data || {};
                            var code = p.code || ('#' + (p.id || '—'));
                            container.text(code);  }
                    },
                    {
                        caption: 'type',
                        width: 100,
                        cellTemplate: function (container, options) {
                            var p = options.data || {};
                            var typeTitle = p.program_type;                           
                            container.text(typeTitle);
                        }
                    },

                    {
                        caption: 'Period',
                        width: 200,
                        calculateCellValue: function (r) {
                            if (!r) return '—';
                            var from = r.period_from ? DevExpress.localization.formatDate(new Date(r.period_from), "yyyy-MM-dd") : '—';
                            var to = r.period_to ? DevExpress.localization.formatDate(new Date(r.period_to), "yyyy-MM-dd") : '—';
                            return from + ' → ' + to;
                        }
                    },
                    {
                        caption: 'Status',
                        width: 120,
                        cellTemplate: function (container, options) {
                            var s = (options.data && options.data.status) ? options.data.status : '—';

                            var cls = '';
                            if (s === 'Draft') cls = 'badge-status-open';
                            else if (s === 'Approved') cls = 'badge-status-in-progress';
                            else if (s === 'Locked') cls = 'badge-status-closed';

                            $('<span>')
                                .addClass('tag')
                                .addClass(cls)
                                .text(s)
                                .appendTo(container);
                        }
                    },
                    {
                        caption: 'Updated',
                        width: 170,
                        cellTemplate: function (container, options) {
                            var r = options.data || {};
                            var txt = '—';
                            if (r.updated_date) {
                                txt = DevExpress.localization.formatDate(new Date(r.updated_date), "yyyy-MM-dd HH:mm");
                            }

                            $('<span>')
                                .addClass('hint')          // 👈 کم‌رنگ مثل بقیه UI
                                .text(txt)
                                .appendTo(container);
                        }
                    },                  

                    {
                        caption: 'Action',
                        width: 90,
                        alignment: 'center',
                        cellTemplate: function (container, options) {

                            var p = options.data || {};

                            var $wrap = $('<div>')
                                .addClass('action-icons');

                            $('<div>')
                                .addClass('icon-btn ghost')   // همون استایل دیتیل
                                .attr('title', 'Open')
                                .text('✎')                    // آیکون Edit
                                .on('click', function (e) {
                                    e.stopPropagation();
                                    vm.open_program(p.id);
                                    $scope.$applyAsync();
                                })
                                .appendTo($wrap);

                            $wrap.appendTo(container);
                        }
                    }

                ]
            };

            // ----------------------------
            // scroll
            // ----------------------------
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
            vm.refresh();
        }]);
