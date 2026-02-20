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
    public class CMSController : ApiController
    {
        [Route("api/cms/efb/{username}")]

        ////nookp
        public IHttpActionResult GetAppLegs(DateTime? df, DateTime? dt, int? ip, int? cpt, int? status, int? asrvr, string username)
        {
            //nooz
            //ppa_entities context = new ppa_entities();
            //this.context.Database.CommandTimeout = 160;
            df = df != null ? ((DateTime)df).Date : DateTime.MinValue.Date;
            dt = dt != null ? ((DateTime)dt).Date : DateTime.MaxValue.Date;
            var context = new ppa_entities();
            var query = from x in context.view_efb_report
                            // where x.FlightStatusID != 1 && x.FlightStatusID != 4
                        select x;
            query = query.Where(q => q.STDDay >= df && q.STDDay <= dt);
           
            if (ip != null)
                query = query.Where(q => q.IPId == ip);
            if (cpt != null)
                query = query.Where(q => q.P1Id == cpt);
            if (asrvr != null)
            {
                if (asrvr == 1)
                    query = query.Where(q => q.MSN == 1);


            }
            if (status != null)
            {

                List<int?> sts = new List<int?>();
                switch ((int)status)
                {
                    case 1:
                        sts.Add(15);
                        sts.Add(3);
                        query = query.Where(q => sts.Contains(q.FlightStatusID));
                        break;
                    case 2:
                        sts.Add(1);
                        query = query.Where(q => sts.Contains(q.FlightStatusID));
                        break;
                    case 3:
                        sts.Add(4);
                        query = query.Where(q => sts.Contains(q.FlightStatusID));
                        break;
                    case 4:
                        sts.Add(20);
                        sts.Add(21);
                        sts.Add(22);
                        sts.Add(4);
                        sts.Add(2);
                        sts.Add(23);
                        sts.Add(24);
                        sts.Add(25);
                        query = query.Where(q => sts.Contains(q.FlightStatusID));

                        break;
                    case 5:
                        break;
                    default:
                        break;
                }
            }
            var result = query.OrderBy(q => q.STD).ToList();
            var flightd_ids=result.Select(q=>(Nullable<int>)q.FlightId).ToList();
            var user_status = context.cms_user_flight.Where(q => q.username == username && flightd_ids.Contains(q.flight_id)).ToList();
            foreach (var x in result)
            {
                var us = user_status.Where(q => q.flight_id == x.FlightId).FirstOrDefault();
                if (us!= null)
                {
                    x.is_pinned = us.is_pinned;
                  //  x.is_read = us.is_read;
                  //  x.is_visited= us.is_visited;
                    x.comments= us.comments;
                    x.tags= us.tags;
                  //  x.date_pinned= us.date_pinned;
                  //  x.date_read= us.date_read;
                  //  x.date_visited= us.date_visited;

                }
            }

            // return result.OrderBy(q => q.STD);
            return Ok(result);

        }




        //[Route("api/cms/reports/{token}")]

        //////nookp
        //public IHttpActionResult GetReports(DateTime? df, DateTime? dt,int type,int flight_id,string register, string token)
        //{
        //    //nooz
        //    //ppa_entities context = new ppa_entities();
        //    //this.context.Database.CommandTimeout = 160;
        //    df = df != null ? ((DateTime)df).Date : DateTime.MinValue.Date;
        //    dt = dt != null ? ((DateTime)dt).Date : DateTime.MaxValue.Date;
        //    var context = new ppa_entities();
        //    var query = from x in context.view_cms_report
        //                    // where x.FlightStatusID != 1 && x.FlightStatusID != 4
                            
        //                select x;
        //    query = query.Where(q => q.DateOccurrence >= df && q.DateOccurrence <= dt).OrderByDescending(q=>q.DateOccurrence).ThenBy(q=>q.TypeTitle).ThenBy(q=>q.FlightNumber);

        //    if (flight_id != -1)
        //    {
        //        query=query.Where(q=>q.FlightId==flight_id);
        //    }
        //    if (type != -1)
        //    {
        //        query = query.Where(q => q.type == type);
        //    }
        //    if (register!="-1")
        //    {
        //        query=query.Where(q=>q.Register== register);
        //    }

        //    var result = query.ToList();
             

        //    // return result.OrderBy(q => q.STD);
        //    return Ok(result);

        //}



    }
}
