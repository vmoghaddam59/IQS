app.controller('iqs_occurrence_detail_controller', ['$routeParams', '$location', 'DataService', '$scope', 'activityService', '$timeout',
    function ($routeParams, $location, DataService, $scope, activityService, $timeout) {
        $scope.form_id = parseInt($routeParams.id, 10);
        $scope.form_type = parseInt($routeParams.type, 10);

        switch ($scope.form_type) {
            case 0:
                $scope.form_type_title = 'Cabin Safety'
                break;
            case 8:
                $scope.form_type_title = 'Air Safety'
                break;
            case 3:
                $scope.form_type_title = 'Maintenance'
                break;
            default:
        }

        $scope.sideTab = 'referral';

        $scope.setSideTab = function (tab) {
            $scope.sideTab = tab;
        };

        $scope.scroll_form_height = $(window).height() - 187;
        $scope.scroll_form = {
            width: '100%',
            bounceEnabled: false,
            showScrollbar: 'always',
            pulledDownText: '',
            pullingDownText: '',
            useNative: false,
            refreshingText: 'Updating...',
            onPullDown: function (options) {

                options.component.release();

            },
            onInitialized: function (e) {


            },
            bindingOptions: {
                height: 'scroll_form_height'
            }

        };

        ///////ASR

        $scope.entity = {
            Id: -1,
            IsSecurityEvent: false,
            IsAirproxATC: false,
            IsTCASRA: false,
            IsWakeTur: false,
            IsBirdStrike: false,
            IsOthers: false,

        };
        $scope.txt_OccurrenceDate = {
            type: "datetime",
            width: '100%',
            displayFormat: "yyyy-MM-dd HHmm",
            readOnly: true,
            interval: 15,

            bindingOptions: {
                value: 'entity.OccurrenceDate',

            }
        };
        $scope.chb_IsSecurityEvent = {

            text: 'SECURITY EVENT',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsSecurityEvent',

            }
        };
        $scope.chb_IsAirproxATC = {

            text: 'AIRPROX/ATC',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsAirproxATC',

            }
        };
        $scope.chb_IsTCASRA = {

            text: 'TCAS RA',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsTCASRA',

            }
        };
        $scope.chb_IsWakeTur = {

            text: 'WAKE TURB.',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsWakeTur',

            }
        };
        $scope.chb_IsBirdStrike = {

            text: 'BIRD STRIKE',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsBirdStrike',

            }
        };
        $scope.chb_IsOthers = {

            text: 'OTHERS',
            readOnly: true,
            bindingOptions: {
                value: 'entity.IsOthers',

            }
        };


        $scope.dsEventType = [
            { id: 100042, title: 'ASR' },
            { id: 100043, title: 'AIRPROX/ATC' },
            { id: 100044, title: 'TCAS RA' },
            { id: 100045, title: 'WAKE TURBULENCE' },
            { id: 100046, title: 'BIRD STRIKE' },

        ];
        $scope.sb_EventType = {
            readOnly: true,
            dataSource: $scope.dsEventType,
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.EventTypeId'

            }
        };
        ///////////////////////////




        $scope.dsDayNightStatus = [
            { id: 100180, title: 'Day' },
            { id: 100181, title: 'Night' },

        ];
        $scope.sb_DayNightStatus = {
            readOnly: true,
            dataSource: $scope.dsDayNightStatus,
            displayExpr: 'title',
            placeholder: ' ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.DayNightStatusId'

            }
        };

        $scope.txt_squawk = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.SQUAWK',
            }
        }

        $scope.txt_fuel = {
            hoverStateEnabled: false,
            readOnly: true,
            min: 0,
            bindingOptions: {
                value: 'entity.FuelJettisoned',
            }
        }

        $scope.num_alt = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.Altitude',
            }
        }

        $scope.num_speed = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.Speed',
            }
        }

        $scope.num_mach = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.MachNo',
            }
        }

        $scope.num_acWeight = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACWeight',
            }
        }
        ////////////////////////////
        $scope.num_techLogPage = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.TechLogPageNO',
            }
        }

        $scope.num_item = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.TechLogItemNO',
            }
        }

        /////////////////////////////////
        $scope.dsFlightPhase = [
            { id: 100029, title: 'TOWING' },
            { id: 100030, title: 'PARKING' },
            { id: 100031, title: 'PUSHBACK' },
            { id: 100032, title: 'TAXI OUT' },
            { id: 100033, title: 'TAKEOFF' },
            { id: 100034, title: 'INITIAL CLIMB(BELOW 1500FT)' },
            { id: 100035, title: 'CLIMB' },
            { id: 100036, title: 'CRUISE' },
            { id: 100037, title: 'DESCENT' },
            { id: 100038, title: 'HOLDING' },
            { id: 100039, title: 'APPROACH(BELOW 1500FT)' },
            { id: 100040, title: 'LANDING' },

        ];
        $scope.sb_flightPhase = {
            readOnly: true,
            dataSource: $scope.dsFlightPhase,
            displayExpr: 'title',
            placeholder: '  ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.FlightPhaseId'

            }
        };

        $scope.txt_airport = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.LOCAirport',

            }
        };

        $scope.txt_stand = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.LOCStand',

            }
        };

        $scope.txt_runway = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.LOCRunway',

            }
        };

        $scope.txt_geoPosAlt = {
            hoverStateEnabled: false,
            readOnly: true,
            placeholder: ' ',
            bindingOptions: {
                value: 'entity.LOCGEOAltitude',

            }
        };

        $scope.txt_geoPosLong = {
            hoverStateEnabled: false,
            readOnly: true,
            placeholder: ' ',
            bindingOptions: {
                value: 'entity.LOCGEOLongtitude',

            }
        };

        $scope.dsMET = [
            { id: 100051, title: 'IMC' },
            { id: 100052, title: 'VMC' },
        ];
        $scope.sb_MET = {
            readOnly: true,
            dataSource: $scope.dsMET,
            displayExpr: 'title',
            placeholder: ' ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.METId'

            }
        };


        $scope.dsSignificantWxType = [
            { id: 100054, title: 'MODERATE' },
            { id: 100055, title: 'SEVERE' },
        ]
        $scope.sb_SignificantWxType = {
            readOnly: true,
            dataSource: $scope.dsSignificantWxType,
            displayExpr: 'title',
            placeholder: ' ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.SigxWXTypeId'

            }
        };

        $scope.dsSignificantWx = [
            { id: 100056, title: 'RAIN' },
            { id: 100057, title: 'SNOW' },
            { id: 100058, title: 'ICING' },
            { id: 100059, title: 'TURBULENCE' },
            { id: 100060, title: 'HAIL' },
            { id: 100061, title: 'STANDING - WATER' },
            { id: 100062, title: 'WINDSHEAR' },

        ];
        $scope.sb_SignificantWx = {
            readOnly: true,
            dataSource: $scope.dsSignificantWx,
            displayExpr: 'title',
            placeholder: ' ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.SigxWXId'

            }
        };

        $scope.ActualWX = {
            readOnly: true,
            bindingOptions: {
                value: 'entity.ActualWX',
                height: '80',

            }
        };

        $scope.dsRunwayCondition = [
            { id: 100064, title: 'DRY' },
            { id: 100065, title: 'WET' },
            { id: 100066, title: 'ICE' },
            { id: 100067, title: 'SNOW' },
            { id: 100068, title: 'SLUSH' },

        ];
        $scope.sb_RunwayCondition = {
            readOnly: true,
            dataSource: $scope.dsRunwayCondition,
            displayExpr: 'title',
            placeholder: ' ',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.RunwayConditionId'

            }
        };

        $scope.txt_AP = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigAP',

            }
        };

        $scope.txt_ATHR = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigATHR',

            }
        };

        $scope.txt_GEAR = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigGear',

            }
        };

        $scope.txt_FLAP = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigFlap',

            }
        };

        $scope.txt_SLAT = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigSlat',

            }
        };

        $scope.txt_SPOILERS = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.ACConfigSpoilers',

            }
        };

        $scope.Summary = {
            bindingOptions: {
                value: 'entity.Summary',
                height: '80',

            }
        };

        $scope.Result = {
            bindingOptions: {
                value: 'entity.Result',
                height: '80',

            }
        };

        $scope.OthersInfo = {
            bindingOptions: {
                value: 'entity.OthersInfo',
                height: '80',

            }
        };

        $scope.dsIncidentType = [
            { id: 100183, title: 'AIRMISS' },
            { id: 100184, title: 'ATC INCIDENT' },
            { id: 100185, title: 'TCAS RA' },

        ];
        $scope.sb_IncidentType = {
            readOnly: true,
            dataSource: $scope.dsIncidentType,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.IncidentTypeId'

            }
        };

        $scope.dsRisk = [
            { id: 100070, title: 'Low' },
            { id: 100071, title: 'Med' },
            { id: 100072, title: 'High' },
        ];
        $scope.sb_Risk = {
            readOnly: true,
            dataSource: $scope.dsRisk,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.AATRiskId'

            }
        };

        $scope.dsAvoidingAction = [
            { value: true, title: 'YES' },
            { value: false, title: 'NO' },
        ];
        $scope.sb_AvoidingAction = {
            readOnly: true,
            dataSource: $scope.dsAvoidingAction,
            placeholder: ' ',

            displayExpr: 'title',
            valueExpr: 'value',
            bindingOptions: {
                value: 'entity.AATIsActionTaken'

            }
        };

        $scope.txt_Reported = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATReportedToATC',

            }
        };
        $scope.txt_ATCInstruction = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATATCInstruction',

            }
        };

        $scope.txt_Frequency = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATFrequency',

            }
        };
        $scope.txt_Heading = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATHeading',

            }
        };
        $scope.txt_MinVertSep = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATMinVerticalSep',

            }
        };
        $scope.txt_MinHorizSep = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATMinHorizontalSep',

            }
        };

        $scope.dsTCASAlert = [
            { id: 100074, title: 'RA' },
            { id: 100075, title: 'TA' },
            { id: 100076, title: 'None' },
        ];
        $scope.sb_TCASAlert = {
            readOnly: true,
            dataSource: $scope.dsTCASAlert,
            placeholder: ' ',

            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.AATTCASAlertId'

            }
        };

        $scope.txt_RAType = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATTypeRA',

            }
        };

        $scope.dsRAFollowed = [
            { value: true, title: 'YES' },
            { value: false, title: 'NO' },
        ];
        $scope.sb_RAFollowed = {
            readOnly: true,
            dataSource: $scope.dsRAFollowed,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'value',
            bindingOptions: {
                value: 'entity.AATIsRAFollowed'

            }
        };

        $scope.txt_VerticalDeviation = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATVerticalDeviation',

            }
        };
        $scope.txt_OtherAircraft = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATOtherACType',

            }
        };
        $scope.txt_MarkingColour = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATMarkingColour',

            }
        };
        $scope.txt_CallSign = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATCallSign',

            }
        };
        $scope.txt_ClearedAltitude = {
            min: 0,
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.AATClearedAltitude',

            }
        };
        $scope.txt_Lighting = {
            readOnly: true,
            hoverStateEnabled: false,
            bindingOptions: {
                value: 'entity.AATLighting',

            }
        };

        $scope.txt_WTHeading = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.WTHeading',

            }
        };
        $scope.txt_BSHeading = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.BSHeading',

            }
        };
        $scope.dsTurning = [
            { id: 100078, title: 'Left' },
            { id: 100079, title: 'Right' },
            { id: 100080, title: 'No' },
        ];
        $scope.sb_Turning = {
            readOnly: true,
            dataSource: $scope.dsTurning,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.WTTurningId'

            }
        };

        $scope.sb_BSTurning = {
            readOnly: true,
            dataSource: $scope.dsTurning,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.BSTurningId'

            }
        };

        $scope.dsGlideSlopePos = [
            { id: 100082, title: 'High' },
            { id: 100083, title: 'Low' },
            { id: 100084, title: 'On' },

        ];
        $scope.sb_GlideSlopePos = {
            readOnly: true,
            dataSource: $scope.dsGlideSlopePos,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.WTGlideSlopePosId'

            }
        };

        $scope.dsExtendedCenterlinePos = [
            { id: 100087, title: 'Left' },
            { id: 100088, title: 'Right' },
            { id: 100089, title: 'On' },

        ];
        $scope.sb_ExtendedCenterlinePos = {
            readOnly: true,
            dataSource: $scope.dsExtendedCenterlinePos,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.WTExtendedCenterlinePosId'

            }
        };

        $scope.dsAttitudeChange = [
            { id: 100091, title: 'Pitch' },
            { id: 100092, title: 'Roll' },
            { id: 100093, title: 'Yaw' },

        ];
        $scope.sb_AttitudeChange = {
            readOnly: true,
            dataSource: $scope.dsAttitudeChange,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.WTAttitudeChangeId'

            }
        };
        $scope.txt_Deg = {
            hoverStateEnabled: false,
            bindingOptions: {
                value: 'entity.WTAttitudeChangeDeg',

            }
        };
        $scope.dsBuffet = [
            { value: true, title: 'YES' },
            { value: false, title: 'NO' },
        ];
        $scope.sb_IsBuffet = {
            readOnly: true,
            dataSource: $scope.dsBuffet,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'value',
            bindingOptions: {
                value: 'entity.WTIsBuffet'

            }
        };
        $scope.dsStickShaker = [
            { value: true, title: 'YES' },
            { value: false, title: 'NO' },
        ];
        $scope.sb_StickShaker = {
            readOnly: true,
            dataSource: $scope.dsStickShaker,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'value',
            bindingOptions: {
                value: 'entity.WTIsStickShaker'

            }
        };
        $scope.Suspect = {
            readOnly: true,
            bindingOptions: {
                value: 'entity.WTSuspect',
                height: '80',

            }
        };
        $scope.Acceleration = {
            readOnly: true,
            bindingOptions: {
                value: 'entity.WTDescribeVA',
                height: '80',

            }
        };
        $scope.Details = {
            readOnly: true,
            bindingOptions: {
                value: 'entity.WTPrecedingAC',
                height: '80',

            }
        };
        $scope.dsAware = [
            { value: true, title: 'YES' },
            { value: false, title: 'NO' },
        ];
        $scope.sb_Aware = {
            readOnly: true,
            dataSource: $scope.dsAware,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'value',
            bindingOptions: {
                value: 'entity.WTIsAware'

            }
        };


        $scope.txt_BirdType = {
            hoverStateEnabled: false,
            readOnly: true,
            bindingOptions: {
                value: 'entity.BSBirdType',

            }
        };

        $scope.dsTime = [
            { id: 100104, title: 'Dawn' },
            { id: 100105, title: 'Day' },
            { id: 100106, title: 'Dusk' },
            { id: 100107, title: 'Night' },


        ];
        $scope.sb_Time = {
            readOnly: true,
            dataSource: $scope.dsTime,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.BSTimeId'

            }
        };

        $scope.dsNrSeen = [
            { id: 100098, title: '1' },
            { id: 100099, title: '2-10' },
            { id: 100100, title: '11-100' },
            { id: 100101, title: 'More' },

        ];
        $scope.sb_NrSeen = {
            readOnly: true,
            dataSource: $scope.dsNrSeen,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.BSNrSeenId'

            }
        };

        $scope.dsNrStruck = [
            { id: 100098, title: '1' },
            { id: 100099, title: '2-10' },
            { id: 100100, title: '11-100' },
            { id: 100101, title: 'More' },

        ];
        $scope.sb_NrStruck = {
            readOnly: true,
            dataSource: $scope.dsNrStruck,
            placeholder: ' ',
            displayExpr: 'title',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.BSNrStruckId'

            }
        };
        $scope.Impact = {
            readOnly: true,
            bindingOptions: {
                value: 'entity.BSImpactDec',
                height: '80',

            }
        };

        ///////////////////////////////

        $scope.tdWidth = 1.0;
        $scope.rows = [-100, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]
        $scope.columns = [-100, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        $scope.getTdClass = function (c, r) {
            var cls = "";
            if (r == 0 && c == 0) { return "ctd-center ctd"; }
            if (r != -100) {
                if (c == -100) {
                    cls = "ctd-empty";
                }
                else {
                    cls = "ctd";
                }
            }
            else {
                //if (c != -100) return "ctd-empty";
                //else
                //    return "ctd";
                cls = "ctd-empty";
            }
            if (c == $scope.entity.AATXAbove && r == $scope.entity.AATYAbove) {
                cls += " ctd-selected";
            }

            return cls;

        }
        $scope.tableAboveClicked = function (r, c) {
            $scope.entity.AATXAbove = c;
            $scope.entity.AATYAbove = r;
        }



        $scope.getAsClass = function (c, r) {
            var cls = "";
            if (r == 0 && c == 0) { return "ctd-center ctd"; }
            if (r != -100) {
                if (c == -100) {
                    cls = "ctd-empty";
                }
                else {
                    cls = "ctd";
                }
            }
            else {
                //if (c != -100) return "ctd-empty";
                //else
                //    return "ctd";
                cls = "ctd-empty";
            }


            if (c == $scope.entity.AATXAstern && r == $scope.entity.AATYAstern) {
                cls += " ctd-selected";
            }
            return cls;

        }
        $scope.tableAsternClicked = function (r, c) {
            $scope.entity.AATXAstern = c;
            $scope.entity.AATYAstern = r;
        }

        $scope.referred_list_columns = [
            { dataField: 'ReferredName', caption: 'Name', allowResizing: true, alignment: 'left', dataType: 'string', allowEditing: false, minWidth: 300 },
            { dataField: 'Comment', caption: 'Remark', allowResizing: true, alignment: 'left', dataType: 'string', allowEditing: false, width: 300 },
            { dataField: 'Priority', caption: 'Priority', allowResizing: true, alignment: 'left', dataType: 'string', allowEditing: false, width: 150 },
            { dataField: 'DeadLine', caption: 'Deadline', allowResizing: true, alignment: 'center', dataType: 'date', format: 'yyyy-MM-dd', allowEditing: false, width: 150 },

            { dataField: 'ReviewResultTitle', caption: 'Status', allowResizing: true, alignment: 'center', dataType: 'string', allowEditing: false, width: 150 },
            { dataField: 'DateStatus', caption: 'Date', allowResizing: true, alignment: 'center', dataType: 'date', format: 'yyyy-MM-dd', allowEditing: false, width: 150 },
            //{ dataField: 'Comment', caption: 'Note', allowResizing: true, alignment: 'left', dataType: 'date', allowEditing: false, width: 300 },
        ];

        $scope.tree_height = $(window).height() - 388;
        $scope.referred_list = {
            keyExpr: 'Id',
            parentIdExpr: 'ParentId',
            columns: $scope.referred_list_columns,
            noDataText: '',
            selection: { mode: 'single' },
            showColumnLines: true,
            wordWrapEnabled: true,
            //columnAutoWidth: false,
            autoExpandAll: true,
            rootValue: null,
            columnAutoWidth: true,
            columnFixing: { enabled: false },
            scrolling: {
                mode: 'standard'
            },
            height: 400,
            onContentReady: function (e) {
                if (!$scope.referred_list_instance)
                    $scope.referred_list_instance = e.component;
            },

            onRowClick: function (e) {
                //$scope.commentEntity.referComment = e.data.Comment;
                $scope.ref_priority = e.data.Priority;
                $scope.ref_deadline = e.data.DeadLine ? moment(new Date(e.data.DeadLine)).format("YYYY-MM-DD") : '';
                //console.log();
            },

            bindingOptions: {
                dataSource: 'referred_list_ds',
                //height: 'tree_height',
                expandedRowKeys: 'expandedRow',

            }
        }

        //MOR
        ///

        $scope.OPTCompn = []

        $scope.chkCompnSpec = function (index) {
            $scope.componentSpecification[index].checked = !$scope.componentSpecification[index].checked;
            $scope.entity.componentSpecificationId = $scope.componentSpecification[index].Id;
            console.log($scope.componentSpecification);
        }

        $scope.sb_station = {
            readOnly: true,
            focusStateEnabled: false,
            placeholder: '',
            displayExpr: 'IATA',
            valueExpr: 'Id',
            bindingOptions: {
                value: "entity.StationId",
                dataSource: 'ds_station',
            }
        }


        $scope.txt_OccurrenceDate = {
            readOnly: true,
            focusStateEnabled: false,
            displayFormat: 'yyyy-MM-dd',
            type: 'datetime',
            pickerType: "rollers",
            bindingOptions: {
                value: 'entity.DateOccurrence',
            }
        }

        $scope.txt_OccurrenceTime = {
            readOnly: true,
            focusStateEnabled: false,
            type: 'time',
            pickerType: "rollers",
            displayFormat: "HH:mm",
            bindingOptions: {
                value: 'entity.DateOccurrence',
            }
        }
        $scope.txt_acType = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.AircraftType',
            }
        }

        $scope.txt_acReg = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.Register',
            }
        }

        $scope.txt_atlNum = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.ATLNo',
            }
        }

        $scope.txt_taskNum = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.TaskNo',
            }
        }

        $scope.txt_reference = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.Reference',
            }
        }

        $scope.txt_time = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.UTCTime',
            }
        }

        $scope.txt_route = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.Route',
            }
        }

        $scope.txt_fltNum = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.FlightNumber',
            }
        }



        $scope.txt_event = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.EventDescription',
            }
        }
        $scope.txt_actionTaken = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.ActionTakenDescription',
            }
        }

        $scope.txt_name = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.EmployeeName',
            }
        }

        $scope.txt_CAALicense = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.CAALicenceNo',
            }
        }

        $scope.txt_authNum = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.AuthorizationNo',
            }
        }

        $scope.nb_serialNumber = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.SerialNumber'
            }
        }

        $scope.nb_partNumber = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.PartNumber'
            }
        }

        $scope.sb_compn = {
            showClearButton: false,
            searchEnabled: false,
            readOnly: true,
            focusStateEnabled: false,
            displayExpr: 'title',
            placeholder: 'Component',
            valueExpr: 'id',
            bindingOptions: {
                value: 'entity.ComponentSpecificationId',
                dataSource: 'dsComponentSpect'
            }
        };

        $scope.txt_comment = {
            readOnly: true,
            focusStateEnabled: false,
            bindingOptions: {
                value: 'entity.comment'
            }
        }



        ////////////////
        $scope.bind = function () {
            switch ($scope.form_type) {
                case 0:
                    $scope.form_type_title = 'Cabin Safety'
                    break;
                case 8:
                    activityService.get_asr($scope.form_id).then(function (response) {
                        $scope.entity = response.Data.entity;
                        $scope.referred_list_ds = response.Data.follow_ups;
                        $scope.expandedRow = Enumerable.From(response.Data.follow_ups).Select('$.Id').ToArray();
                        $timeout(function () {
                            if ($scope.referred_list_instance) {
                                $scope.referred_list_instance.updateDimensions();
                            }
                        }, 100);

                    });

                    break;
                case 3:
                    activityService.getMORCompnSpec().then(function (res) {
                        $scope.dsComponentSpect = [];
                        $.each(res.Data, function (_i, _d) {
                            $scope.dsComponentSpect.push({ "id": _d.Id, "title": _d.Title });
                        });

                        activityService.getMORById($scope.form_id).then(function (res) {
                            $scope.entity = res.Data;
                        });

                    });
                    break;
                default:
            }
           
          
        }

        $scope.bind();
        $scope.back = function () {
            $location.path('/iqs/occurrence/list');
        };

        $scope.btn_back_to_occurrences = {
            text: 'Back to occurrences',
            icon: 'back',
            onClick: function () {
                $scope.back();
            }
        };
    }]);