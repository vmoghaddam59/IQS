using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using ApiCMS.Models;

namespace ApiCMS.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class HazardController : ApiController
    {

        public class DataResponse
        {
            public bool IsSuccess { get; set; }
            public object Data { get; set; }
            public object DataExtra { get; set; }
            public List<string> Errors { get; set; }

        }


        public class hazard_dto
        {
            public int id { get; set; }
            public int hazard_type_id { get; set; }
            public string code { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public DateTime identified_date { get; set; }
            public DateTime? last_review_date { get; set; }
            public DateTime? next_review_due_date { get; set; }
            public bool is_active { get; set; }
            public string risk_owner { get; set; }
            public string responsible_department { get; set; }
            public string initial_severity_code { get; set; }
            public string initial_likelihood_code { get; set; }
            public string initial_risk_level_code { get; set; }
            public string residual_severity_code { get; set; }
            public string residual_likelihood_code { get; set; }
            public string residual_risk_level_code { get; set; }
            public string risk_acceptance_status { get; set; }
            public DateTime? risk_acceptance_date { get; set; }
            public string risk_accepted_by { get; set; }
            public string risk_matrix_version { get; set; }
            public string created_by { get; set; }
            public DateTime created_at { get; set; }
            public string updated_by { get; set; }
            public DateTime? updated_at { get; set; }
            public byte[] row_version { get; set; }
            public int hazard_status_id { get; set; }
            public int? initial_severity_id { get; set; }
            public int? initial_likelihood_id { get; set; }
            public int? initial_risk_level_id { get; set; }
            public int? residual_severity_id { get; set; }
            public int? residual_likelihood_id { get; set; }
            public int? residual_risk_level_id { get; set; }
            public int? risk_matrix_id { get; set; }
        }

        public class risk_hazard_dto
        {

            public int id { get; set; }
            public int hazard_id { get; set; }
            public int? risk_matrix_id { get; set; }
            public string assessment_type { get; set; }
            public DateTime assessment_date { get; set; }
            public string assessed_by { get; set; }
            public string assessed_role { get; set; }
            public int? severity { get; set; }
            public int? likelihood { get; set; }
            public int? risk_level_id { get; set; }
            public string risk_acceptance_status { get; set; }
            public string risk_accepted_by { get; set; }
            public DateTime? risk_acceptance_date { get; set; }
            public string comment { get; set; }
            public DateTime created_at { get; set; }
            public string created_by { get; set; }
            public byte[] row_version { get; set; }
        }


        [HttpPost]
        [Route("api/cms/save/hazard")]
        public async Task<DataResponse> SaveHazard(hazard_dto dto)
        {
            try
            {
                var context = new ppa_entities();
                var entity = context.cms2_hazard.FirstOrDefault(q => q.id == dto.id);
                if (entity == null)
                {
                    entity = new cms2_hazard();
                    context.cms2_hazard.Add(entity);
                }

                entity.id = dto.id;
                entity.hazard_type_id = dto.hazard_type_id;
                entity.code = dto.code;
                entity.title = dto.title;
                entity.description = dto.description;
                entity.identified_date = dto.identified_date;
                entity.last_review_date = dto.last_review_date;
                entity.next_review_due_date = dto.next_review_due_date;
                entity.is_active = dto.is_active;
                entity.risk_owner = dto.risk_owner;
                entity.responsible_department = dto.responsible_department;
                entity.initial_severity_code = dto.initial_severity_code;
                entity.initial_likelihood_code = dto.initial_likelihood_code;
                entity.initial_risk_level_code = dto.initial_risk_level_code;
                entity.residual_severity_code = dto.residual_severity_code;
                entity.residual_likelihood_code = dto.residual_likelihood_code;
                entity.residual_risk_level_code = dto.residual_risk_level_code;
                entity.risk_acceptance_status = dto.risk_acceptance_status;
                entity.risk_acceptance_date = dto.risk_acceptance_date;
                entity.risk_accepted_by = dto.risk_accepted_by;
                entity.risk_matrix_version = dto.risk_matrix_version;
                entity.created_by = dto.created_by;
                entity.created_at = dto.created_at;
                entity.updated_by = dto.updated_by;
                entity.updated_at = dto.updated_at;
                entity.row_version = dto.row_version;
                entity.hazard_status_id = dto.hazard_status_id;
                entity.initial_severity_id = dto.initial_severity_id;
                entity.initial_likelihood_id = dto.initial_likelihood_id;
                entity.initial_risk_level_id = dto.initial_risk_level_id;
                entity.residual_severity_id = dto.residual_severity_id;
                entity.residual_likelihood_id = dto.residual_likelihood_id;
                entity.residual_risk_level_id = dto.residual_risk_level_id;
                entity.risk_matrix_id = dto.risk_matrix_id;

                await context.SaveChangesAsync();

                return new DataResponse
                {
                    IsSuccess = true,
                    Data = dto
                };

            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Errors = new List<string> { ex.Message }
                };
            }
        }


        [HttpGet]
        [Route("api/cms/get/hazard/{id}")]
        public async Task<DataResponse> GetHazard(int id)
        {
            try
            {
                var context = new ppa_entities();
                var entity = await context.cms2_hazard.Select(q =>
                new
                {
                    q.id,
                    q.hazard_type_id,
                    q.code,
                    q.title,
                    q.description,
                    q.identified_date,
                    q.last_review_date,
                    q.next_review_due_date,
                    q.is_active,
                    q.risk_owner,
                    q.responsible_department,
                    q.initial_severity_code,
                    q.initial_likelihood_code,
                    q.initial_risk_level_code,
                    q.residual_severity_code,
                    q.residual_likelihood_code,
                    q.residual_risk_level_code,
                    q.risk_acceptance_status,
                    q.risk_acceptance_date,
                    q.risk_accepted_by,
                    q.risk_matrix_version,
                    q.created_by,
                    q.created_at,
                    q.updated_by,
                    q.updated_at,
                    q.row_version,
                    q.hazard_status_id,
                    q.initial_severity_id,
                    q.initial_likelihood_id,
                    q.initial_risk_level_id,
                    q.residual_severity_id,
                    q.residual_likelihood_id,
                    q.residual_risk_level_id,
                    q.risk_matrix_id,
                }).FirstOrDefaultAsync();



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
        [Route("api/cms/get/hazard/list")]
        public async Task<DataResponse> GetHazardList()
        {
            try
            {
                var context = new ppa_entities();
                var entity = context.cms2_hazard.Select(q => new { q.id, q.title, q.description, q.initial_risk_level_id, q.residual_risk_level_id, q.hazard_status_id, q.code, q.risk_owner });



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

        public class link_dto
        {
            public int id { get; set; }
            public int occurrence_id { get; set; }
            public int hazard_id { get; set; }
            public bool is_primary { get; set; }
            public string comment { get; set; }
            public string created_by { get; set; }

        }

        [HttpPost]
        [Route("api/cms/link/hazard/occurence")]
        public async Task<DataResponse> LinkHazardOccurence(List<link_dto> dto)
        {
            try
            {
                using (var context = new ppa_entities())
                {

                    foreach (var o in dto)
                    {

                        var entity = context.cms2_occurrence_hazard.FirstOrDefault(q => q.id == o.id);
                        if (entity == null)
                        {
                            entity = new cms2_occurrence_hazard();
                            context.cms2_occurrence_hazard.Add(entity);
                        }

                        entity.created_by = o.created_by;
                        entity.occurrence_id = o.occurrence_id;
                        entity.comment = o.comment;
                        entity.is_primary = o.is_primary;
                        entity.hazard_id = o.hazard_id;

                    }
                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = dto
                    };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        [HttpPost]
        [Route("api/cms/remove/link/hazard/occurence")]
        public async Task<DataResponse> RemoveLinkHazardOccurence(List<int> ids)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var entities = context.cms2_occurrence_hazard
                        .Where(q => ids.Contains(q.id))
                        .ToList();

                    if (!entities.Any())
                    {
                        return new DataResponse
                        {
                            IsSuccess = false,
                            Errors = new List<string> { "No matching records found." }
                        };
                    }

                    context.cms2_occurrence_hazard.RemoveRange(entities);
                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = entities.Count // or true, or ids
                    };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        [HttpGet]
        [Route("api/cms/get/hazard/linked/{hid}")]
        public async Task<DataResponse> GetHazardLinked(int hid)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var result = context.cms2_occurrence_hazard
                        .Where(q => q.hazard_id == hid)
                        .Select(q => q.QAAllEntity)
                        .Select(q => new
                        {
                            q.id,
                            q.title,
                            q.event_date,
                            q.entity_id,
                            //q.type_title,
                            //q.status_title,

                        })
                        .ToList();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = result
                    };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse
                {
                    IsSuccess = false,
                    Data = ex.Message
                };
            }
        }

          

        [HttpPost]
        [Route("api/cms/save/hazard/risk")]
        public async Task<DataResponse> SaveHazardRisk(risk_hazard_dto dto)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var risk = await context.cms2_risk_assessment_log.FirstOrDefaultAsync(q => q.id == dto.id);
                    if (risk == null)
                    {
                        risk = new cms2_risk_assessment_log();
                        context.cms2_risk_assessment_log.Add(risk);

                        risk.hazard_id = dto.hazard_id;
                        risk.initial_likelihood_id = dto.likelihood;
                        risk.initial_severity_id = dto.severity;
                        risk.created_at = DateTime.Now;
                    }

                    risk.residual_likelihood_id = risk.initial_likelihood_id != null ? dto.likelihood : null;
                    risk.residual_severity_id = risk.initial_likelihood_id != null ? dto.severity : null;
                    risk.assessment_type = "";


                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = dto
                    };
                }

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
        [Route("api/cms/list/hazard/risk/{hazard_id}")]
        public async Task<DataResponse> GetListHazardRisk(int hazard_id)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var risk = await context.view_cms2_risk_log.Where(q => q.hazard_id == hazard_id).ToListAsync();



                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = risk
                    };
                }

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

    }
}