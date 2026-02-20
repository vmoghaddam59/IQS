using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using ApiCMS.Models;


namespace ApiCMS.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class OccurrenceController : ApiController
    {
        public class DataResponse
        {
            public bool IsSuccess { get; set; }
            public object Data { get; set; }
            public object DataExtra { get; set; }
            public List<string> Errors { get; set; }

        }

        public class asr_dto
        {
            public EFBASR entity { get; set; }
            public List<followup_dto> follow_ups { get; set; }
        }


        [HttpGet]
        [Route("api/cms/get/occurrences/list")]
        public async Task<DataResponse> GetOccurrencesList()
        {
            try
            {
                var context = new ppa_entities();
                var entity = context.view_qa_all_entity.ToList().OrderByDescending(q => q.event_date);



                return new DataResponse
                {
                    IsSuccess = true,
                    Data = entity
                };

            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }

        [HttpGet]
        [Route("api/cms/get/asr/{id}")]
        public async Task<DataResponse> GetASRByID(int id)
        {
            try
            {
                var context = new ppa_entities();
                var entity = context.EFBASRs.FirstOrDefault(q => q.Id == id);

                var follow_ups = GetFollowingUp(entity.Id, 8);


                return new DataResponse
                {
                    IsSuccess = true,
                    Data = new asr_dto
                    {
                        entity = entity,
                        follow_ups = follow_ups
                    }
                };

            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Data = ex
                };
            }
        }

        public class followup_dto
        {
            public int Id { get; set; } 
            public int? ReferredId { get; set; } 
            public int? ReferrerId { get; set; } 
            public string ReferredName { get; set; } 
            public string ReferrerName { get; set; } 
            public DateTime? DateStatus { get; set; } 
            public int? Type { get; set; } 
            public string ReviewResultTitle { get; set; } 
            public int? ReviewResult { get; set; } 
            public string Comment { get; set; } 
            public int? EntityId { get; set; } 
            public int? ParentId { get; set; } 

        }

        public List<followup_dto> GetFollowingUp(int entity_id, int type_id)
        {
            //var context = new ppa_entities();
            //List<QAFollowingUp> follow_ups = context.QAFollowingUps.Where(q => q.EntityId == entity_id && q.Type == type_id).ToList();
            var context = new ppa_entities();
            var data = from x in context.ViewQAFollowingUps
                       join y in context.ViewQABYEmployees on new { EmployeeId = x.ReferredId, Id = x.EntityId, Type = x.Type } equals new { EmployeeId = y.EmployeeId, Id = y.EntityId, Type = y.Type } into grp
                       from matching in grp
                       where x.Type == type_id && x.EntityId == entity_id
                       select new followup_dto
                       {
                           Id = x.Id,
                           ReferredId = x.ReferredId,
                           ReferrerId = x.ReferrerId,
                           ReferredName = x.ReferredName,
                           ReferrerName = x.ReferrerName,
                           DateStatus = x.DateStatus,
                           Type = x.Type,
                           ReviewResultTitle = matching.ReviewResultTitle,
                           ReviewResult = matching.ReviewResult,
                           Comment = x.Comment,
                           EntityId = x.EntityId,
                           ParentId = x.ParentId,
                       };



            var result = data.ToList();

            return result;
        }


    }
}