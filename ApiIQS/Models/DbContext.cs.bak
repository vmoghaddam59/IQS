using ApiCMS.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace ApiCMS.Models
{
    public partial class ppa_entities
    {
        public async Task<CustomActionResult> SaveAsync()
        {
            try
            {

                await this.SaveChangesAsync();
                return new CustomActionResult(HttpStatusCode.OK, "");
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {

                    foreach (var ve in eve.ValidationErrors)
                    {
                        var xxx =
                             ve.PropertyName + " " + ve.ErrorMessage;
                    }
                }
                return new CustomActionResult(HttpStatusCode.InternalServerError, "DbEntityValidationException");
            }
            catch (DbUpdateException dbu)
            {
                var exception = Exceptions.HandleDbUpdateException(dbu);
                return new CustomActionResult(HttpStatusCode.InternalServerError, exception.Message);
            }
            catch (Exception ex)
            {
                return new CustomActionResult(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        public CustomActionResult SaveActionResult()
        {
            try
            {

                this.SaveChangesAsync();
                return new CustomActionResult(HttpStatusCode.OK, "");
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {

                    foreach (var ve in eve.ValidationErrors)
                    {
                        var xxx =
                             ve.PropertyName + " " + ve.ErrorMessage;
                    }
                }
                return new CustomActionResult(HttpStatusCode.InternalServerError, "DbEntityValidationException");
            }
            catch (DbUpdateException dbu)
            {
                var exception = Exceptions.HandleDbUpdateException(dbu);
                return new CustomActionResult(HttpStatusCode.InternalServerError, exception.Message);
            }
            catch (Exception ex)
            {
                return new CustomActionResult(HttpStatusCode.InternalServerError, ex.Message);
            }
        }



    }

    public class Exceptions
    {
        internal static Exception HandleDbUpdateException(DbUpdateException dbu)
        {
            var builder = new StringBuilder("A DbUpdateException was caught while saving changes. ");

            try
            {
                foreach (var result in dbu.Entries)
                {
                    builder.AppendFormat("Type: {0} was part of the problem. ", result.Entity.GetType().Name);
                }
            }
            catch (Exception e)
            {
                builder.Append("Error parsing DbUpdateException: " + e.ToString());
            }

            string message = builder.ToString();
            return new Exception(message, dbu);
        }



    }
}