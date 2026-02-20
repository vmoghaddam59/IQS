using ApiCMS.Models;
using ApiCMS.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace ApiCMS.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class LogController : ApiController
    {
        //[Route("api/flight/log/save")]

        //[AcceptVerbs("POST")]
        //public async Task<IHttpActionResult> PostFlightLog(ViewModels.FlightSaveDto dto)
        //{
        //    try
        //    {
        //        if (dto.UpdateDelays == null)
        //            dto.UpdateDelays = 1;
        //        List<int> offCrewIds = new List<int>();
        //        //marmar
        //        // return new CustomActionResult(HttpStatusCode.OK, null);
        //        var context = new ppa_entities();
        //        var flight = await context.FlightInformations.FirstOrDefaultAsync(q => q.ID == dto.ID);
        //        var notifiedDelay = flight.NotifiedDelay;
        //        var leg = await context.ViewLegTimes.FirstOrDefaultAsync(q => q.ID == dto.ID);
        //        if (flight == null)
        //            return new CustomActionResult(HttpStatusCode.NotFound, "");

        //        var changeLog = new FlightChangeHistory()
        //        {
        //            Date = DateTime.Now,
        //            FlightId = flight.ID,
        //            User = dto.UserName,

        //        };
        //        changeLog.OldFlightNumer = leg.FlightNumber;
        //        changeLog.OldFromAirportId = leg.FromAirport;
        //        changeLog.OldToAirportId = leg.ToAirport;
        //        changeLog.OldSTD = flight.STD;
        //        changeLog.OldSTA = flight.STA;
        //        changeLog.OldStatusId = flight.FlightStatusID;
        //        changeLog.OldRegister = leg.RegisterID;
        //        changeLog.OldOffBlock = flight.ChocksOut;
        //        changeLog.OldOnBlock = flight.ChocksIn;
        //        changeLog.OldTakeOff = flight.Takeoff;
        //        changeLog.OldLanding = flight.Landing;

        //        //////////////////////////////////////////////////////////////
        //        flight.GUID = Guid.NewGuid();
        //        flight.DateCreate = DateTime.Now.ToUniversalTime();
        //        flight.FlightStatusUserId = dto.UserId;
        //        flight.ChocksIn = dto.ChocksIn;
        //        flight.Landing = dto.Landing;
        //        flight.ChocksOut = dto.ChocksOut;
        //        flight.Takeoff = dto.Takeoff;
        //        flight.GWTO = dto.GWTO;
        //        if (!string.IsNullOrEmpty(dto.LTR))
        //            flight.LTR = dto.LTR;
        //        if (!string.IsNullOrEmpty(dto.SerialNo))
        //            flight.SerialNo = dto.SerialNo;
        //        if (dto.FuelDensity != null)
        //            flight.FuelDensity = dto.FuelDensity;

        //        flight.FuelDeparture = dto.FuelDeparture;
        //        flight.FuelArrival = dto.FuelArrival;
        //        flight.FPFuel = dto.FPFuel;
        //        flight.Defuel = dto.Defuel;
        //        flight.UsedFuel = dto.UsedFuel;


        //        flight.PaxAdult = dto.PaxAdult;
        //        flight.PaxInfant = dto.PaxInfant;
        //        flight.PaxChild = dto.PaxChild;
        //        flight.NightTime = dto.NightTime;


        //        ////////NEW LOG
        //        /// 
        //        flight.CargoWeight = dto.CargoWeight;
        //        flight.CargoCost = dto.CargoCost;
        //        flight.CargoUnitID = dto.CargoUnitID;
        //        flight.BaggageCount = dto.BaggageCount;
        //        flight.CargoCount = dto.CargoCount;
        //        flight.FreeAWBWeight = dto.FreeAWBWeight;
        //        flight.FreeAWBCount = dto.FreeAWBCount;
        //        flight.BaggageWeight = dto.BaggageWeight;

        //        flight.NoShowCount = dto.NoShowCount;
        //        flight.NoShowPieces = dto.NoShowPieces;
        //        flight.NoGoCount = dto.NoGoCount;
        //        flight.NoGoPieces = dto.NoGoPieces;
        //        flight.DSBreakfast = dto.DSBreakfast;
        //        flight.DSWarmFood = dto.DSWarmFood;
        //        flight.DSColdFood = dto.DSColdFood;
        //        flight.DSRefreshment = dto.DSRefreshment;

        //        flight.Ready = String.IsNullOrEmpty(dto.Ready) ? (DateTime?)null : DateTime.ParseExact(dto.Ready, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.Start = String.IsNullOrEmpty(dto.Start) ? (DateTime?)null : DateTime.ParseExact(dto.Start, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.YClass = dto.YClass;
        //        flight.CClass = dto.CClass;
        //        flight.PaxAdult50 = dto.PaxAdult50;
        //        flight.PaxChild50 = dto.PaxChild50;
        //        flight.PaxInfant50 = dto.PaxInfant50;
        //        flight.PaxAdult100 = dto.PaxAdult100;
        //        flight.PaxChild100 = dto.PaxChild100;
        //        flight.PaxInfant100 = dto.PaxInfant100;
        //        flight.PaxVIP = dto.PaxVIP;
        //        flight.PaxCIP = dto.PaxCIP;
        //        flight.PaxHUM = dto.PaxHUM;
        //        flight.PaxUM = dto.PaxUM;
        //        flight.PaxAVI = dto.PaxAVI;
        //        flight.PaxWCHR = dto.PaxWCHR;
        //        flight.PaxSTRC = dto.PaxSTRC;
        //        flight.FreeAWBPieces = dto.FreeAWBPieces;
        //        flight.CargoPieces = dto.CargoPieces;
        //        flight.PaxPIRLost = dto.PaxPIRLost;
        //        flight.PaxPIRDamage = dto.PaxPIRDamage;
        //        flight.PaxPIRFound = dto.PaxPIRFound;
        //        flight.CargoPIRLost = dto.CargoPIRLost;
        //        flight.CargoPIRDamage = dto.CargoPIRDamage;
        //        flight.CargoPIRFound = dto.CargoPIRFound;
        //        flight.LimitTag = dto.LimitTag;
        //        flight.RushTag = dto.RushTag;
        //        flight.CLCheckIn = String.IsNullOrEmpty(dto.CLCheckIn) ? (DateTime?)null : DateTime.ParseExact(dto.CLCheckIn, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLPark = String.IsNullOrEmpty(dto.CLPark) ? (DateTime?)null : DateTime.ParseExact(dto.CLPark, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLAddTools = String.IsNullOrEmpty(dto.CLAddTools) ? (DateTime?)null : DateTime.ParseExact(dto.CLAddTools, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLBusReady = String.IsNullOrEmpty(dto.CLBusReady) ? (DateTime?)null : DateTime.ParseExact(dto.CLBusReady, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLPaxOut = String.IsNullOrEmpty(dto.CLPaxOut) ? (DateTime?)null : DateTime.ParseExact(dto.CLPaxOut, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLDepoOut = String.IsNullOrEmpty(dto.CLDepoOut) ? (DateTime?)null : DateTime.ParseExact(dto.CLDepoOut, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLServicePresence = String.IsNullOrEmpty(dto.CLServicePresence) ? (DateTime?)null : DateTime.ParseExact(dto.CLServicePresence, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLCleaningStart = String.IsNullOrEmpty(dto.CLCleaningStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLCleaningStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLTechReady = String.IsNullOrEmpty(dto.CLTechReady) ? (DateTime?)null : DateTime.ParseExact(dto.CLTechReady, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLBagSent = String.IsNullOrEmpty(dto.CLBagSent) ? (DateTime?)null : DateTime.ParseExact(dto.CLBagSent, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLCateringLoad = String.IsNullOrEmpty(dto.CLCateringLoad) ? (DateTime?)null : DateTime.ParseExact(dto.CLCateringLoad, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLFuelStart = String.IsNullOrEmpty(dto.CLFuelStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLFuelStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLFuelEnd = String.IsNullOrEmpty(dto.CLFuelEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLFuelEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLCleaningEnd = String.IsNullOrEmpty(dto.CLCleaningEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLCleaningEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLBoardingStart = String.IsNullOrEmpty(dto.CLBoardingStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLBoardingStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLBoardingEnd = String.IsNullOrEmpty(dto.CLBoardingEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLBoardingEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLLoadSheetStart = String.IsNullOrEmpty(dto.CLLoadSheetStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLLoadSheetStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLGateClosed = String.IsNullOrEmpty(dto.CLGateClosed) ? (DateTime?)null : DateTime.ParseExact(dto.CLGateClosed, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLTrafficCrew = String.IsNullOrEmpty(dto.CLTrafficCrew) ? (DateTime?)null : DateTime.ParseExact(dto.CLTrafficCrew, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLLoadCrew = String.IsNullOrEmpty(dto.CLLoadCrew) ? (DateTime?)null : DateTime.ParseExact(dto.CLLoadCrew, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLForbiddenObj = String.IsNullOrEmpty(dto.CLForbiddenObj) ? (DateTime?)null : DateTime.ParseExact(dto.CLForbiddenObj, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLLoadSheetSign = String.IsNullOrEmpty(dto.CLLoadSheetSign) ? (DateTime?)null : DateTime.ParseExact(dto.CLLoadSheetSign, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLLoadingEnd = String.IsNullOrEmpty(dto.CLLoadingEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLLoadingEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLDoorClosed = String.IsNullOrEmpty(dto.CLDoorClosed) ? (DateTime?)null : DateTime.ParseExact(dto.CLDoorClosed, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLEqDC = String.IsNullOrEmpty(dto.CLEqDC) ? (DateTime?)null : DateTime.ParseExact(dto.CLEqDC, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLMotorStart = String.IsNullOrEmpty(dto.CLMotorStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLMotorStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLMovingStart = String.IsNullOrEmpty(dto.CLMovingStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLMovingStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLACStart = String.IsNullOrEmpty(dto.CLACStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLACStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLACEnd = String.IsNullOrEmpty(dto.CLACEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLACEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLGPUStart = String.IsNullOrEmpty(dto.CLGPUStart) ? (DateTime?)null : DateTime.ParseExact(dto.CLGPUStart, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLGPUEnd = String.IsNullOrEmpty(dto.CLGPUEnd) ? (DateTime?)null : DateTime.ParseExact(dto.CLGPUEnd, "yyyyMMddHHmm", CultureInfo.InvariantCulture);
        //        flight.CLDepStairs = dto.CLDepStairs;
        //        flight.CLDepGPU = dto.CLDepGPU;
        //        flight.CLDepCrewCar = dto.CLDepCrewCar;
        //        flight.CLDepCrewCarCount = dto.CLDepCrewCarCount;
        //        flight.CLDepCabinService = dto.CLDepCabinService;
        //        flight.CLDepCateringCar = dto.CLDepCateringCar;
        //        flight.CLDepPatientCar = dto.CLDepPatientCar;
        //        flight.CLDepPaxCar = dto.CLDepPaxCar;
        //        flight.CLDepPaxCarCount = dto.CLDepPaxCarCount;
        //        flight.CLDepPushback = dto.CLDepPushback;
        //        flight.CLDepWaterService = dto.CLDepWaterService;
        //        flight.CLDepAC = dto.CLDepAC;
        //        flight.CLDepDeIce = dto.CLDepDeIce;
        //        flight.CLDepEqRemark = dto.CLDepEqRemark;
        //        flight.CLArrStairs = dto.CLArrStairs;
        //        flight.CLArrGPU = dto.CLArrGPU;
        //        flight.CLArrCrewCar = dto.CLArrCrewCar;
        //        flight.CLArrCrewCarCount = dto.CLArrCrewCarCount;
        //        flight.CLArrCabinService = dto.CLArrCabinService;
        //        flight.CLArrPatientCar = dto.CLArrPatientCar;
        //        flight.CLArrPaxCar = dto.CLArrPaxCar;
        //        flight.CLArrPaxCarCount = dto.CLArrPaxCarCount;
        //        flight.CLArrToiletService = dto.CLArrToiletService;
        //        flight.CLArrEqRemark = dto.CLArrEqRemark;
        //        ///END NEW LOG
        //        //////////////////////

        //        //flight.FuelUnitID = dto.FuelUnitID;
        //        flight.DepartureRemark = dto.DepartureRemark;
        //        flight.FPFlightHH = dto.FPFlightHH;
        //        flight.FPFlightMM = dto.FPFlightMM;
        //        //flight.FPFuel = dto.FPFuel;
        //        flight.Defuel = dto.Defuel;
        //        // flight.UsedFuel = dto.UsedFuel;
        //        flight.JLBLHH = dto.JLBLHH;
        //        flight.JLBLMM = dto.JLBLMM;
        //        flight.PFLR = dto.PFLR;
        //        flight.ChrAdult = dto.ChrAdult;
        //        flight.ChrCapacity = dto.ChrCapacity;
        //        flight.ChrChild = dto.ChrChild;
        //        flight.ChrInfant = dto.ChrInfant;
        //        flight.ChrCode = dto.ChrCode;
        //        flight.ChrTitle = dto.ChrTitle;
        //        flight.ArrivalRemark = dto.ArrivalRemark;
        //        if (dto.FlightStatusID != null)
        //            flight.FlightStatusID = dto.FlightStatusID;
        //        if (flight.FlightStatusID == null)
        //            flight.FlightStatusID = 1;
        //        if (flight.FlightStatusID == 4)
        //        {
        //            var cnlMsn = await context.Ac_MSN.Where(q => q.Register == "CNL").Select(q => q.ID).FirstOrDefaultAsync();
        //            flight.RegisterID = cnlMsn;
        //            flight.CancelDate = dto.CancelDate;
        //            flight.CancelReasonId = dto.CancelReasonId;
        //        }
        //        //if (flight.FlightStatusID == 17)
        //        if (dto.RedirectReasonId != null)
        //        {

        //            flight.RedirectDate = dto.RedirectDate;
        //            flight.RedirectReasonId = dto.RedirectReasonId;
        //            flight.RedirectRemark = dto.RedirectRemark;
        //            if (flight.OSTA == null)
        //            {
        //                var vflight = await context.ViewFlightInformations.FirstOrDefaultAsync(q => q.ID == flight.ID);
        //                flight.OSTA = flight.STA;
        //                flight.OToAirportId = vflight.ToAirport;
        //                flight.OToAirportIATA = vflight.ToAirportIATA;
        //            }

        //            // var airport = await context.Airports.FirstOrDefaultAsync(q => q.Id == flight.OToAirportId);
        //            flight.ToAirportId = dto.ToAirportId;
        //            // if (airport != null)
        //            //    flight.OToAirportIATA = airport.IATA;
        //        }
        //        else
        //        {
        //            flight.RedirectDate = null;
        //            flight.RedirectReasonId = null;
        //            // if (flight.FlightPlanId != null)
        //            //    flight.ToAirportId = null;
        //            flight.OSTA = null;
        //            flight.OToAirportId = null;
        //            flight.OToAirportIATA = null;

        //        }
        //        if (flight.FlightStatusID == 9)
        //        {
        //            flight.RampDate = dto.RampDate;
        //            flight.RampReasonId = dto.RampReasonId;
        //        }

        //        if (flight.ChocksIn != null && flight.FlightStatusID == 15)
        //        {
        //            //var vflight = await context.ViewFlightInformations.FirstOrDefaultAsync(q => q.ID == flight.ID);

        //            //var flightCrewEmployee = await (from x in context.Employees
        //            //                                join y in context.ViewFlightCrewNews on x.Id equals y.CrewId
        //            //                                where y.FlightId == flight.ID
        //            //                                select x).ToListAsync();

        //            //foreach (var x in flightCrewEmployee)
        //            //    x.CurrentLocationAirport = vflight.ToAirport;
        //            var flightCrews = await (from x in context.Employees
        //                                     join z in context.FDPs on x.Id equals z.CrewId
        //                                     join y in context.FDPItems on z.Id equals y.FDPId
        //                                     where y.FlightId == flight.ID
        //                                     select x).ToListAsync();

        //            foreach (var x in flightCrews)
        //                x.CurrentLocationAirport = flight.ToAirportId;
        //        }
        //        if (flight.FlightStatusID != null && /*dto.UserId != null*/ !string.IsNullOrEmpty(dto.UserName))
        //            context.FlightStatusLogs.Add(new FlightStatusLog()
        //            {
        //                FlightID = dto.ID,

        //                Date = DateTime.Now.ToUniversalTime(),
        //                FlightStatusID = (int)flight.FlightStatusID,

        //                UserId = dto.UserId != null ? (int)dto.UserId : 128000,
        //                Remark = dto.UserName,
        //            });
        //        var result = UpdateDelays(dto, context);

        //        if (result.Code != HttpStatusCode.OK)
        //            return result;

        //        //  var result2 = await UpdateEstimatedDelays(dto);

        //        //if (result2.Code != HttpStatusCode.OK)
        //        //    return result2;

        //        if (flight.FlightStatusID == 4)
        //        {
        //            UpdateFirstLastFlights(flight.ID, context);
        //        }


        //        ////////////////////////////////////////
        //        changeLog.NewFlightNumber = leg.FlightNumber;
        //        changeLog.NewFromAirportId = leg.FromAirport;
        //        changeLog.NewToAirportId = flight.ToAirportId;
        //        changeLog.NewSTD = flight.STD;
        //        changeLog.NewSTA = flight.STA;
        //        changeLog.NewStatusId = flight.FlightStatusID;
        //        changeLog.NewRegister = leg.RegisterID;
        //        changeLog.NewOffBlock = flight.ChocksOut;
        //        changeLog.NewOnBlock = flight.ChocksIn;
        //        changeLog.NewTakeOff = flight.Takeoff;
        //        changeLog.NewLanding = flight.Landing;

        //        context.FlightChangeHistories.Add(changeLog);
        //        ////////////////////////////////////////

        //        bool sendNira = false;
        //        try
        //        {
        //            var xdelay = (int)(((DateTime)dto.ChocksOut) - ((DateTime)leg.STD)).TotalMinutes;
        //            if (xdelay > 30 && (flight.FlightStatusID == 1) && notifiedDelay != xdelay && ((DateTime)flight.STD - DateTime.UtcNow).TotalHours > 1)
        //            {
        //                flight.NotifiedDelay = xdelay;
        //                sendNira = true;
        //            }
        //            if (dto.FlightStatusID == 4)
        //            {
        //                // offCrewIds = (from q in context.ViewFlightCrewNews
        //                //               where q.FlightId == dto.ID
        //                //               select q.CrewId).ToList();
        //                offCrewIds = await (from x in context.Employees
        //                                    join z in context.FDPs on x.Id equals z.CrewId
        //                                    join y in context.FDPItems on z.Id equals y.FDPId
        //                                    where y.FlightId == flight.ID
        //                                    select x.Id).ToListAsync();



        //            }





        //        }
        //        catch (Exception ex)
        //        {

        //        }



        //        //return new CustomActionResult(HttpStatusCode.OK, new updateLogResult()
        //        //{
        //        //    sendNira = sendNira,
        //        //    flight = flight.ID,
        //        //    offIds = offCrewIds

        //        //});

        //        var saveResult = await context.SaveAsync();
        //        if (saveResult.Code != HttpStatusCode.OK)
        //            return saveResult;

        //        if (offCrewIds != null && offCrewIds.Count > 0)
        //        {
        //            var disoffIds = offCrewIds.Distinct().ToList();
        //            foreach (var crewid in disoffIds)
        //            {
        //                await RemoveItemsFromFDP(flight.ID.ToString(), (int)crewid, 2, "Flight Cancellation - Removed by AirPocket.", 0, 0);
        //            }
        //        }



        //        //var fg = await unitOfWork.FlightRepository.GetViewFlightGantts().Where(q => q.ID == fresult.flight).ToListAsync();
        //        var fg = await context.ViewFlightsGantts.Where(q => q.ID == flight.ID).ToListAsync();
        //        ViewModels.ViewFlightsGanttDto odto = new ViewFlightsGanttDto();
        //        ViewModels.ViewFlightsGanttDto.FillDto(fg.First(), odto, 0, 1);


        //        var resgroups = from x in fg
        //                        group x by new { x.AircraftType, AircraftTypeId = x.TypeId }
        //                       into grp
        //                        select new { groupId = grp.Key.AircraftTypeId, Title = grp.Key.AircraftType };
        //        var ressq = (from x in fg
        //                     group x by new { x.RegisterID, x.Register, x.TypeId }
        //                 into grp

        //                     orderby getOrderIndex(grp.Key.Register, new List<string>())
        //                     select new { resourceId = grp.Key.RegisterID, resourceName = grp.Key.Register, groupId = grp.Key.TypeId }).ToList();

        //        odto.resourceId.Add((int)odto.RegisterID);


        //        var oresult = new
        //        {
        //            flight = odto,
        //            resgroups,
        //            ressq
        //        };
        //        //await unitOfWork.FlightRepository.CreateMVTMessage(dto.ID,dto.UserName);
        //        //6-28
        //        // unitOfWork.FlightRepository.CreateMVTMessage(dto.ID, dto.UserName);
        //        return Ok(oresult);



        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(ex.Message);
        //    }

        //}





        //[Route("api/plan/flights")]
        //public async Task<IHttpActionResult> GetFlightsForPlan(DateTime dfrom, DateTime dto)
        //{
        //    dfrom = dfrom.Date;
        //    dto = dto.Date.AddDays(1);

        //    // var result = await unitOfWork.FlightRepository.GetFlightGanttFleet(cid, dateFrom, dateTo, tzoffset, null, null, 1);
        //    //return Ok(result);
        //    var context = new ppa_entities();
        //    var query = from x in context.ViewLegTimes
        //                where x.FlightStatusID == 1 && (x.STDLocal >= dfrom && x.STDLocal < dto)
        //                orderby x.STDDay, x.Register, x.STD
        //                select new FlightPlanDto()
        //                {
        //                    ID = x.ID,
        //                    Register = x.Register,
        //                    RegisterID = x.RegisterID,
        //                    FromAirport = x.FromAirport,
        //                    FromAirportIATA = x.FromAirportIATA,
        //                    ToAirport = x.ToAirport,
        //                    ToAirportIATA = x.ToAirportIATA,
        //                    STD = x.STD,
        //                    STDLocal = x.STDLocal,
        //                    STA = x.STA,
        //                    STALocal = x.STALocal,
        //                    STDDay = x.STDDay,
        //                    FlightNumber = x.FlightNumber
        //                };
        //    var result = await query.ToListAsync();
        //    foreach (var x in result)
        //    {


        //    }
        //    return Ok(result);
        //}





    }
}
