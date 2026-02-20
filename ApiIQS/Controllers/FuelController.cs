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
    public class FuelController : ApiController
    {
        [Route("api/fuel/report")]
        public async Task<IHttpActionResult> GetFuelReport(DateTime dfrom, DateTime dto)
        {
            try
            {
                dfrom = dfrom.Date;
                dto = dto.Date.AddDays(1);
                ppa_entities context = new ppa_entities();
                var query = from x in context.AppFuels
                            where x.STDDay >= dfrom && x.STDDay <= dto
                            select x;

                var result = await query.OrderBy(q => q.STD).ToListAsync();


                return Ok(result);
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null)
                    msg += "   " + ex.InnerException.Message;
                return Ok(msg);
            }

        }

    }
}
