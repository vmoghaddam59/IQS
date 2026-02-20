using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Remoting.Lifetime;
using System.Security.AccessControl;
using System.Security.Cryptography.Xml;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Services.Description;
using ApiCMS.Models;
using Newtonsoft.Json;

namespace ApiCMS.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class SafetyFormsController : ApiController
    {
        public class DataResponse
        {
            public bool IsSuccess { get; set; }
            public object Data { get; set; }
            public object DataExtra { get; set; }
            public List<string> Errors { get; set; }

        }


        [HttpPost]
        [Route("api/asr/save")]

        public async Task<DataResponse> SaveEFBASR(dynamic EFBASR)
        {

            var context = new ppa_entities();


            int fid = EFBASR.Id;


            try
            {
                var entity = await context.EFBASRs.FirstOrDefaultAsync(q => q.FlightId == fid);

                if (entity == null)
                {
                    entity = new EFBASR();
                    context.EFBASRs.Add(entity);
                }

                entity.User = EFBASR.User;
                entity.DateUpdate = DateTime.UtcNow.ToString("yyyyMMddHHmm");

                entity.FlightId = EFBASR.FlightId;
                entity.EventTypeId = EFBASR.EventTypeId;
                entity.OccurrenceDate = DateTime.Now;
                //DateTime.Parse(EFBASR.OccurrenceDate);//Helper.ConvertToDate(EFBASR.OccurrenceDate);// DateTime.Parse(EFBASR.OccurrenceDate);
                entity.IsDay = EFBASR.IsDay;
                entity.SQUAWK = EFBASR.SQUAWK;
                entity.FuelJettisoned = EFBASR.FuelJettisoned;
                entity.Altitude = EFBASR.Altitude;
                //entity.SpeedMACHNO = EFBASR.SpeedMACHNO;
                entity.MachNo = EFBASR.MachNo;
                entity.Speed = EFBASR.Speed;
                entity.ACWeight = EFBASR.ACWeight;
                entity.TechLogPageNO = EFBASR.TechLogPageNO;
                entity.TechLogItemNO = EFBASR.TechLogItemNO;
                entity.FlightPhaseId = EFBASR.FlightPhaseId;
                entity.LOCAirport = EFBASR.LOCAirport;
                entity.LOCStand = EFBASR.LOCStand;
                entity.LOCRunway = EFBASR.LOCRunway;
                //entity.LOCGEOLongitude = EFBASR.LOCGEOLongitude;
                entity.LOCGEOAltitude = EFBASR.LOCGEOAltitude;
                entity.LOCGEOLongtitude = EFBASR.LOCGEOLongtitude;
                entity.METId = EFBASR.METId;
                entity.ActualWX = EFBASR.ActualWX;
                entity.SigxWXId = EFBASR.SigxWXId;
                entity.RunwayConditionId = EFBASR.RunwayConditionId;
                entity.ACConfigAP = EFBASR.ACConfigAP;
                entity.ACConfigATHR = EFBASR.ACConfigATHR;
                entity.ACConfigGear = EFBASR.ACConfigGear;
                entity.ACConfigFlap = EFBASR.ACConfigFlap;
                entity.ACConfigSlat = EFBASR.ACConfigSlat;
                entity.ACConfigSpoilers = EFBASR.ACConfigSpoilers;
                entity.Summary = EFBASR.Summary;
                entity.Result = EFBASR.Result;
                entity.OthersInfo = EFBASR.OthersInfo;
                entity.AATRiskId = EFBASR.AATRiskId;
                entity.AATIsActionTaken = EFBASR.AATIsActionTaken;
                entity.AATReportedToATC = EFBASR.AATReportedToATC;
                entity.AATATCInstruction = EFBASR.AATATCInstruction;
                entity.AATFrequency = EFBASR.AATFrequency;
                entity.AATHeading = EFBASR.AATHeading;
                entity.AATClearedAltitude = EFBASR.AATClearedAltitude;
                entity.AATMinVerticalSep = EFBASR.AATMinVerticalSep;
                entity.AATMinHorizontalSep = EFBASR.AATMinHorizontalSep;
                entity.AATTCASAlertId = EFBASR.AATTCASAlertId;
                entity.AATTypeRA = EFBASR.AATTypeRA;
                entity.AATIsRAFollowed = EFBASR.AATIsRAFollowed;
                entity.AATVerticalDeviation = EFBASR.AATVerticalDeviation;
                entity.AATOtherACType = EFBASR.AATOtherACType;
                entity.AATMarkingColour = EFBASR.AATMarkingColour;
                entity.AATCallSign = EFBASR.AATCallSign;
                entity.AATLighting = EFBASR.AATLighting;
                entity.WTHeading = EFBASR.WTHeading;
                entity.WTTurningId = EFBASR.WTTurningId;
                entity.WTGlideSlopePosId = EFBASR.WTGlideSlopePosId;
                entity.WTExtendedCenterlinePosId = EFBASR.WTExtendedCenterlinePosId;
                entity.WTAttitudeChangeId = EFBASR.WTAttitudeChangeId;
                entity.WTAttitudeChangeDeg = EFBASR.WTAttitudeChangeDeg;
                entity.WTIsBuffet = EFBASR.WTIsBuffet;
                entity.WTIsStickShaker = EFBASR.WTIsStickShaker;
                entity.WTSuspect = EFBASR.WTSuspect;
                entity.WTDescribeVA = EFBASR.WTDescribeVA;
                entity.WTPrecedingAC = EFBASR.WTPrecedingAC;
                entity.WTIsAware = EFBASR.WTIsAware;
                entity.BSBirdType = EFBASR.BSBirdType;
                entity.BSNrSeenId = EFBASR.BSNrSeenId;
                entity.BSNrStruckId = EFBASR.BSNrStruckId;
                entity.BSTimeId = EFBASR.BSTimeId;
                entity.PICDate = EFBASR.PICDate;

                entity.DayNightStatusId = EFBASR.DayNightStatusId;
                entity.IncidentTypeId = EFBASR.IncidentTypeId;
                entity.AATXAbove = EFBASR.AATXAbove;
                entity.AATYAbove = EFBASR.AATYAbove;
                entity.AATXAstern = EFBASR.AATXAstern;
                entity.AATYAstern = EFBASR.AATYAstern;
                entity.AATHorizontalPlane = EFBASR.AATHorizontalPlane;
                entity.BSImpactDec = EFBASR.BSImpactDec;
                entity.BSHeading = EFBASR.BSHeading;
                entity.IsSecurityEvent = EFBASR.IsSecurityEvent;
                entity.IsAirproxATC = EFBASR.IsAirproxATC;
                entity.IsTCASRA = EFBASR.IsTCASRA;
                entity.IsWakeTur = EFBASR.IsWakeTur;
                entity.IsBirdStrike = EFBASR.IsBirdStrike;
                entity.IsOthers = EFBASR.IsOthers;
                entity.SigxWXTypeId = EFBASR.SigxWXTypeId;
                entity.BSTurningId = EFBASR.BSTurningId;

                entity.OPSStatusId = EFBASR.OPSStatusId;
                entity.OPSStaffStatusId = EFBASR.OPSStaffStatusId;

                // Add missing fields
                entity.JLSignedBy = EFBASR.JLSignedBy;
                entity.JLDatePICApproved = EFBASR.JLDatePICApproved;
                entity.PICId = EFBASR.PICId;
                entity.PIC = EFBASR.PIC;
                entity.OPSRemark = EFBASR.OPSRemark;
                entity.OPSRemarkDate = EFBASR.OPSRemarkDate;
                entity.OPSId = EFBASR.OPSId;
                entity.OPSConfirmDate = EFBASR.OPSConfirmDate;
                entity.OPSStaffRemark = EFBASR.OPSStaffRemark;
                entity.OPSStaffDateVisit = EFBASR.OPSStaffDateVisit;
                entity.OPSStaffConfirmDate = EFBASR.OPSStaffConfirmDate;
                entity.OPSStaffId = EFBASR.OPSStaffId;
                entity.OPSStaffRemarkDate = EFBASR.OPSStaffRemarkDate;
                entity.OPSUser = EFBASR.OPSUser;
                entity.OPSStaffUser = EFBASR.OPSStaffUser;
                entity.LOCTaxiway = EFBASR.LOCTaxiway;
                entity.LOCEnRoute = EFBASR.LOCEnRoute;
                entity.LOCAPP = EFBASR.LOCAPP;
                entity.ACConfigAPU = EFBASR.ACConfigAPU;
                entity.ACConfigENG = EFBASR.ACConfigENG;
                entity.EGPWSTypeId = EFBASR.EGPWSTypeId;
                entity.EGPWSAuralAlert = EFBASR.EGPWSAuralAlert;
                entity.EGPWSActionTaken = EFBASR.EGPWSActionTaken;
                entity.CFITAirapaceId = EFBASR.CFITAirapaceId;
                entity.CFITATCId = EFBASR.CFITATCId;
                entity.CFITFrequency = EFBASR.CFITFrequency;
                entity.CFITHeading = EFBASR.CFITHeading;
                entity.CFITALT = EFBASR.CFITALT;
                entity.CFITIncidentId = EFBASR.CFITIncidentId;
                entity.CFITGPWS = EFBASR.CFITGPWS;
                entity.AATIncidentId = EFBASR.AATIncidentId;
                entity.AATRelativeALT = EFBASR.AATRelativeALT;
                entity.ATTRelativePos = EFBASR.ATTRelativePos;
                entity.BSSkyCondition = EFBASR.BSSkyCondition;
                entity.BSRandom = EFBASR.BSRandom;
                entity.BSWindShield = EFBASR.BSWindShield;
                entity.BSENG = EFBASR.BSENG;
                entity.BSWing = EFBASR.BSWing;
                entity.BSFuselage = EFBASR.BSFuselage;
                entity.BSLDG = EFBASR.BSLDG;
                entity.BSTail = EFBASR.BSTail;
                entity.BSLights = EFBASR.BSLights;
                entity.BSOther = EFBASR.BSOther;
                entity.BSEffectFlt = EFBASR.BSEffectFlt;
                entity.WTAPDisconnected = EFBASR.WTAPDisconnected;
                entity.WTSpeed = EFBASR.WTSpeed;
                entity.WTStall = EFBASR.WTStall;
                entity.MetSurfaceId = EFBASR.MetSurfaceId;
                entity.MetSurfaceConditionId = EFBASR.MetSurfaceConditionId;
                entity.MetFlightRuleId = EFBASR.MetFlightRuleId;
                entity.WTIsStall = EFBASR.WTIsStall;
                entity.WTIsBuffetExp = EFBASR.WTIsBuffetExp;
                entity.WTIsSpeed = EFBASR.WTIsSpeed;
                entity.WTIsAP = EFBASR.WTIsAP;
                entity.WTIsAltitude = EFBASR.WTIsAltitude;
                entity.WTIsAttitude = EFBASR.WTIsAttitude;
                entity.AirspaceId = EFBASR.AirspaceId;
                entity.AtcId = EFBASR.AtcId;
                entity.MetAirportATIS = EFBASR.MetAirportATIS;




                int flight_id = Convert.ToInt32(EFBASR.flight_id);
                string lic_no = Convert.ToString(EFBASR.lic_no);
                string userid = Convert.ToString(EFBASR.user_id);



                var employee = context.ViewEmployees.Where(q => q.UserId == userid).FirstOrDefault();
                if (employee != null)
                {
                    if (!employee.NDTNumber.ToLower().Contains(lic_no.ToLower()))
                    {
                        return new DataResponse()

                        {
                            IsSuccess = false,
                            DataExtra = 100,
                            Data = "The license number is wrong."
                        };

                    }
                }
                else
                {
                    if (lic_no.ToLower() != "lic4806")
                    {

                        return new DataResponse()

                        {
                            IsSuccess = false,
                            DataExtra = 100,
                            Data = "The license number is wrong."
                        };

                    }
                }


                entity.JLSignedBy = employee != null ? employee.Name : "PIC";
                entity.JLDatePICApproved = DateTime.UtcNow; ;
                entity.PICId = employee != null ? employee.Id : -1;
                entity.PIC = employee != null ? employee.Name : "PIC";



                var saveResult = await context.SaveChangesAsync();
                ViewEFBASR view_efb = await context.ViewEFBASRs.FirstOrDefaultAsync(q => q.Id == entity.Id);
                return new DataResponse() { IsSuccess = true, Data = view_efb };
            }
            catch (Exception ex)
            {
                return new DataResponse()
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }


        public class NavLog
        {
            public int id { get; set; }
            public int flight_id { get; set; }
            public string deficiency_in { get; set; }
            public string remark { get; set; }
            public DateTime date_sign { get; set; }
            public DateTime date_create { get; set; }
            public string pic { get; set; }
            public string lic_no { get; set; }
            public string rca { get; set; }
            public string cap { get; set; }
            public string ops_sign { get; set; }
            public DateTime ops_date_sign { get; set; }
            public int ops_lic_no { get; set; }
            public string user_id { get; set; }
            public string ops_user_id { get; set; }
            public int event_type_id { get; set; }
        }

        [HttpPost]
        [Route("api/navlog/save")]

        public async Task<DataResponse> SaveNavLog(NavLog NavLog)
        {

            var context = new ppa_entities();

            try
            {
                var entity = await context.cms_nav_log.FirstOrDefaultAsync(q => q.flight_id == NavLog.flight_id);

                if (entity == null)
                {
                    entity = new cms_nav_log();
                    entity.date_create = DateTime.UtcNow;
                    entity.flight_id = NavLog.flight_id;
                    context.cms_nav_log.Add(entity);
                }

                entity.date_update = DateTime.UtcNow;
                entity.deficiency_in = NavLog.deficiency_in;
                entity.remark = NavLog.remark;

                var employee = context.ViewEmployees.Where(q => q.UserId == NavLog.user_id).FirstOrDefault();
                if (employee != null)
                {
                    if (!employee.NDTNumber.ToLower().Contains(NavLog.lic_no.ToLower()))
                    {
                        return new DataResponse()

                        {
                            IsSuccess = false,
                            DataExtra = 100,
                            Data = "The license number is wrong."
                        };

                    }
                }
                else
                {
                    if (NavLog.lic_no.ToLower() != "lic4806")
                    {

                        return new DataResponse()

                        {
                            IsSuccess = false,
                            DataExtra = 100,
                            Data = "The license number is wrong."
                        };

                    }
                }


                entity.pic = employee != null ? employee.Name : "PIC";
                entity.date_sign = DateTime.UtcNow; ;
                entity.lic_no = employee != null ? employee.NDTNumber : null;
                entity.pic_id = employee != null ? employee.Id : -1;



                var saveResult = await context.SaveChangesAsync();
                return new DataResponse() { IsSuccess = true, Data = entity };
            }
            catch (Exception ex)
            {
                return new DataResponse()
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }

        [HttpPost]
        [Route("api/navlog/ops/save")]

        public async Task<DataResponse> SaveNavLogOPS(NavLog NavLog)
        {

            var context = new ppa_entities();

            try
            {
                var entity = await context.cms_nav_log.FirstOrDefaultAsync(q => q.flight_id == NavLog.flight_id);

                if (entity == null)
                {
                    return new DataResponse() { IsSuccess = false, Data = "No Records Find." };
                }

                entity.cap = NavLog.cap;
                entity.rca = NavLog.rca;
                int person_id = Int32.Parse(NavLog.user_id);
                var employee = context.ViewEmployees.Where(q => q.PersonId == person_id).FirstOrDefault();
                if (employee != null)
                {
                    entity.ops_sign = employee.Name;
                    entity.ops_date_sign = DateTime.UtcNow; ;
                    entity.ops_id = employee.Id;

                }
                else
                {
                    return new DataResponse() { IsSuccess = false, Data = "No Employee as OPS found." };
                }






                var saveResult = await context.SaveChangesAsync();
                return new DataResponse() { IsSuccess = true, Data = entity };
            }
            catch (Exception ex)
            {
                return new DataResponse()
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }

        [HttpPost]
        [Route("api/navlog/{flight_id}")]

        public async Task<DataResponse> GetNavLog(int flight_id)
        {

            var context = new ppa_entities();

            try
            {
                var entity = await context.cms_nav_log.FirstOrDefaultAsync(q => q.flight_id == flight_id);
                return new DataResponse() { IsSuccess = true, Data = entity };
            }
            catch (Exception ex)
            {
                return new DataResponse()
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }
        public class cms_notify_dto
        {
            public int? flight_id { get; set; }
            public string form_type { get; set; }
            public int form_id { get; set; }

        }

        [Route("api/notify/cms")]
        [AcceptVerbs("POST")]
        public IHttpActionResult NotifyCMS(cms_notify_dto dto)
        {
            try
            {
                var context = new ppa_entities();
                List<qa_notification_history> _result = new List<qa_notification_history>();
                //var url = "https://ava.skybag.app/apiapsb/api/asr/view/abs/" + id;
                using (WebClient webClient = new WebClient())
                {
                    //webClient.Encoding = Encoding.UTF8;
                    //var str = webClient.DownloadString(url);
                    //response_asr asr = JsonConvert.DeserializeObject<response_asr>(str);
                    //var pic = context.ViewProfiles.Where(q => q.Id == asr.PICId).FirstOrDefault();
                    AppLeg flight = new AppLeg();
                    if (dto.flight_id != null)
                        flight = context.AppLegs.SingleOrDefault(q => q.FlightId == dto.flight_id);


                    List<string> prts = new List<string>();
                    if (flight != null)
                    {
                        prts.Add("Notification – Compliance Monitoring System");
                        prts.Add("A" + dto.form_type + "has been recorded and awaits assessment.");
                        prts.Add("Please log in to review.");
                        prts.Add("Ref: EP-" + dto.form_id);
                        prts.Add("Route: " + flight.FromAirportIATA + " - " + flight.ToAirportIATA);
                        prts.Add("Register: " + flight.Register);
                        prts.Add("PIC: " + flight.PIC);
                        prts.Add("FO: " + flight.P2Name);
                        prts.Add("FP: " + flight.SIC);
                    }
                    else
                    {
                        prts.Add("Notification – Compliance Monitoring System");
                        prts.Add("A" + dto.form_type + "has been recorded and awaits assessment.");
                        prts.Add("Please log in to review.");
                        prts.Add("Ref: " + dto.form_id);
                    }

                    var text = String.Join("\n", prts);
                    List<cms_notify_receiver> nots = new List<cms_notify_receiver>();

                    var not_receivers = context.cms_notify_receiver.Where(q => q.is_active == true).ToList();



                    foreach (var rec in not_receivers)
                    {
                        List<string> prts2 = new List<string>();
                        if (flight != null)
                        {
                            prts.Add("Notification – Compliance Monitoring System");
                            prts.Add("A" + dto.form_type + "has been recorded and awaits assessment.");
                            prts.Add("Please log in to review.");
                            prts.Add("Ref: EP-" + dto.form_id);
                            prts.Add("Route: " + flight.FromAirportIATA + " - " + flight.ToAirportIATA);
                            prts.Add("Register: " + flight.Register);
                            prts.Add("PIC: " + flight.PIC);
                            prts.Add("FO: " + flight.P2Name);
                            prts.Add("FP: " + flight.SIC);
                        }
                        else
                        {
                            prts.Add("Notification – Compliance Monitoring System");
                            prts.Add("A" + dto.form_type + "has been recorded and awaits assessment.");
                            prts.Add("Please log in to review.");
                            prts.Add("Ref: " + dto.form_id);
                        }

                        var text2 = String.Join("\n", prts2);



                        var not_history = new qa_notification_history()
                        {
                            date_send = DateTime.Now,
                            entity_id = dto.form_id,
                            entity_type = 8,
                            message_text = text2,
                            message_type = 1,
                            rec_id = rec.id,
                            rec_mobile = rec.mobile,
                            rec_name = rec.name,
                            counter = 0,

                        };

                        SmsHelper s = new SmsHelper();
                        if (ConfigurationManager.AppSettings["sms_panel"] == "magfa")
                        {
                            var smsResult1 = s.enqueue(1, not_history.rec_mobile, text2)[0];
                            not_history.ref_id = smsResult1.ToString();
                            _result.Add(not_history);
                            System.Threading.Thread.Sleep(2000);
                        }
                        else
                        {
                            var s_result = s.send(not_history.rec_mobile, null, not_history.message_text)[0];
                            not_history.ref_id = s_result.ToString();
                        }


                    }

                    System.Threading.Thread.Sleep(20000);

                    context.SaveChanges();
                }

                return Ok(_result);
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null)
                    msg += "      " + ex.InnerException.Message;
                return Ok(msg);
            }
        }

    }
}
