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
    public class AuditController : ApiController
    {

        public class DataResponse
        {
            public bool IsSuccess { get; set; }
            public object Data { get; set; }
            public object DataExtra { get; set; }
            public List<string> Errors { get; set; }

        }

        // ----------------------------
        // DTOs
        // ----------------------------
        public class audit_plan_save_dto
        {
            public int id { get; set; }
            public string code { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public int type_id { get; set; }
            public string objective { get; set; }
            public int? lead_auditor { get; set; }
            public DateTime? issue_date { get; set; }
            public DateTime? opening_meeting_start { get; set; }
            public DateTime? opening_meeting_end { get; set; }
            public string opening_meeting_venue { get; set; }
            public DateTime? closing_meeting_start { get; set; }
            public DateTime? closing_meeting_end { get; set; }
            public string closing_meeting_venue { get; set; }
            public int? created_by { get; set; }
            public int? updated_by { get; set; }
            public DateTime? created_at { get; set; }
            public DateTime? updated_at { get; set; }

            // اگر بعداً خواستی تیم را هم در همین Save ذخیره کنی:
            // public List<int> team_auditor_ids { get; set; }
            // public int? leader_auditor_id { get; set; }
        }

        public class audit_save_dto
        {
            public int id { get; set; }
            public int audit_plan_id { get; set; }

            public string code { get; set; }
            public string title { get; set; }
            public string remark { get; set; }

            public int? type_id { get; set; }
            public string scope { get; set; }
            public string area { get; set; }

            public DateTime? audit_date { get; set; }
            public string standards_refrences { get; set; }

            public int? auditee_id { get; set; }
            public int? location_id { get; set; }
            public int? auditor_id { get; set; }

            public int? created_by { get; set; }
            public int? updated_by { get; set; }
        }

        public class finding_save_dto
        {
            public int id { get; set; }
            public int? audit_id { get; set; }
            public string code { get; set; }
            public string title { get; set; }
            public string level { get; set; }
            public int? standard_id { get; set; }
            public string standard_title { get; set; }
            public string standard_description { get; set; }
            public string none_compliance_description { get; set; }
            public DateTime? closure_deadline { get; set; }
            public DateTime? closure_auditor_date { get; set; }
            public int? auditor_id { get; set; }
            public string auditor_name { get; set; }
            public DateTime? sent_report_date { get; set; }
            public int? verified_qa_by { get; set; }
            public DateTime? verified_qa_date { get; set; }
        }
        

        [HttpGet]
        [Route("api/cms/get/auditors")]
        public async Task<DataResponse> GetAuditors()
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.cms2_auditors
                        .AsNoTracking()
                        .OrderBy(a => a.first_name)
                        .ThenBy(a => a.last_name)
                        .Select(a => new
                        {
                            id = a.id,
                            name = a.first_name + " " + a.last_name
                        })
                        .ToListAsync();

                    return new DataResponse { IsSuccess = true, Data = list };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        [HttpGet]
        [Route("api/cms/get/locations")]
        public async Task<DataResponse> GetLocations()
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.ViewLocations
                        .AsNoTracking()
                        .OrderBy(a => a.Id)
                        .Select(a => new
                        {
                            id = a.Id,
                            title = a.Title
                        })
                        .ToListAsync();

                    return new DataResponse { IsSuccess = true, Data = list };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        [HttpGet]
        [Route("api/cms/get/auditees")]
        public async Task<DataResponse> GetAuditees()
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.view_cms2_auditees
                        .AsNoTracking()
                        .OrderBy(a => a.Name)
                        .Select(a => new
                        {
                            id = a.id,
                            name = a.Name
                        })
                        .ToListAsync();

                    return new DataResponse { IsSuccess = true, Data = list };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }


        // =========================================================
        // 1) GET: فقط Header پلان (از view_cms2_audit_plan)
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/audit/plan/{id:int}")]
        public async Task<DataResponse> GetAuditPlanHeader(int id)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var plan = await context.view_cms2_audit_plan
                        .AsNoTracking()
                        .FirstOrDefaultAsync(q => q.id == id);

                    return new DataResponse { IsSuccess = true, Data = plan };
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

        // =========================================================
        // 2) GET: فرم پلان (Plan + Audits + Team + ALL Findings + ALL Actions)
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/audit/plan/form/{planId:int}")]
        public async Task<DataResponse> GetAuditPlanForm(int planId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    // Plan header
                    var plan = await context.view_cms2_audit_plan
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.id == planId);

                    if (plan == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Plan not found." } };

                    // Audits (از view)
                    var audits = await context.view_cms2_audit
                        .AsNoTracking()
                        .Where(a => a.audit_plan_id == planId)
                        .OrderByDescending(a => a.id)
                        .Select(a => new
                        {
                            a.id,
                            a.audit_plan_id,
                            a.code,
                            a.title,
                            a.remark,
                            a.type_id,
                            a.scope,
                            a.area,
                            a.audit_date,
                            a.standards_refrences,
                            a.auditee_id,
                            a.auditee_name,
                        
                            a.auditor_id,
                            a.auditor_name
                        })
                        .ToListAsync();

                    var auditIds = audits.Select(x => x.id).ToList();

                    // Team (از view) — طبق FK فعلی شما: audit_id == planId
                    //var team = await context.view_cms2_audit_team
                    //    .AsNoTracking()
                    //    .Where(t => t.audit_id == planId)
                    //    .OrderByDescending(t => t.is_leader)
                    //    .ThenBy(t => t.auditor_name)
                    //    .Select(t => new
                    //    {
                    //        t.id,
                    //        t.audit_id,
                    //        t.auditor_id,
                    //        t.is_leader,
                    //        t.auditor_name
                    //    })
                    //    .ToListAsync();

           

                    // اگر پلان هیچ Audit نداشته باشد
                    if (auditIds.Count == 0)
                    {
                        return new DataResponse
                        {
                            IsSuccess = true,
                            Data = new
                            {
                                plan,
                                audits,
                                //team,
                                findings = new object[0],
                                actions = new object[0]
                            }
                        };
                    }

                    // Findings (از view) - همه‌ی findings مربوط به کل plan
                    var findings = await context.view_cms2_audit_finding
                        .AsNoTracking()
                        .Where(f => auditIds.Contains(f.audit_id))
                        .OrderByDescending(f => f.id)
                        .Select(f => new
                        {
                            f.id,
                            f.audit_id,
                            f.code,
                            f.title,
                            f.level,
                            f.standard_id,
                            f.standard_title,
                            f.standard_description,
                            f.none_compliance_description,
                            f.closure_deadline,
                            f.sent_report_date,
                            f.closure_auditor_date,
                            f.verified_qa_date,
                            f.auditor_id,
                            f.auditor_name,
                            f.verified_qa_by,
                            f.verified_qa_name
                           
                        })
                        .ToListAsync();

                    // Corrective Actions (از view) - همه‌ی actions مربوط به کل plan
                    var actions = await context.view_cms2_audit_corrective_action
                        .AsNoTracking()
                        .Where(ca => auditIds.Contains(ca.audit_id))
                        .OrderByDescending(ca => ca.id)
                        .Select(ca => new
                        {
                            ca.id,
                            ca.audit_id,
                            ca.finding_id,
                            ca.code,
                            ca.action_title,
                            ca.root_cause_analysis_desc,
                            ca.request_implementation_date,
                            ca.sign_date,
                            ca.is_approved,
                            ca.approved_date,

                            ca.follow_up1_date,
                            ca.follow_up1_is_approved,
                            ca.follow_up1_extended_deadline_date,
                            ca.follow_up1_approved_date,

                            ca.follow_up2_date,
                            ca.follow_up2_is_approved,
                            ca.follow_up2_mrb_meeting_date,

                            ca.created_date,
                            ca.created_by,

                            ca.responsible_manager_id,
                            ca.responsible_manager_name,

                            ca.approved_by,
                            ca.approved_by_name,

                            ca.follow_up1_approved_by,
                            ca.follow_up1_approved_by_name,

                            ca.follow_up2_approved_by,
                            ca.follow_up2_approved_by_name
                        })
                        .ToListAsync();
                    var auditors = await context.cms2_auditors
                           .AsNoTracking()
                           .OrderBy(a => a.first_name).ThenBy(a => a.last_name)
                            .Select(a => new { id = a.id, name = a.first_name + " " + a.last_name })
                            .ToListAsync();
                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new
                        {
                            plan,
                            audits,
                            //team,
                            findings,
                            actions,
                            auditors
                        }
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

        // =========================================================
        // 3) POST: ذخیره Audit Plan (Write فقط روی جدول cms2_audit_plan)
        // =========================================================
        
        [HttpPost]
        [Route("api/cms/save/audit/plan")]
        public async Task<DataResponse> SaveAuditPlan([FromBody] audit_plan_save_dto dto)
        {
            try
            {
                if (dto == null)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };

                if (string.IsNullOrWhiteSpace(dto.title))
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "title is required." } };

                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit_plan.FirstOrDefaultAsync(q => q.id == dto.id);
                    var isNew = entity == null;

                    if (isNew)
                    {
                        entity = new cms2_audit_plan();
                        context.cms2_audit_plan.Add(entity);

                        entity.created_at = DateTime.Now;
                        //entity.created_at = (DateTime)dto.created_at;
                        entity.created_by = (int)dto.created_by;
                        //entity.created_by = 1; // TODO: از کاربر جاری
                    }
                    else
                    {
                        entity.updated_at = DateTime.Now;
                        entity.updated_by = (int)dto.created_by;
                    }

                    entity.code = dto.code;
                    entity.title = dto.title;
                    entity.description = dto.description;
                    entity.type_id = dto.type_id;
                    entity.objective = dto.objective;
                    entity.issue_date = dto.issue_date;
                 

                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new { id = entity.id }
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
        // =========================================================
        // 5) GeT:  Audit  
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/audit/{auditId:int}")]
        public async Task<DataResponse> GetAuditForm(int auditId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    // برای add جدید (auditId = -1)
                    object audit = null;

                    if (auditId > 0)
                    {
                        audit = await context.view_cms2_audit
                            .AsNoTracking()
                            .Where(a => a.id == auditId )
                            .Select(a => new
                            {
                                a.id,
                                a.audit_plan_id,
                                a.code,
                                a.title,
                                a.remark,
                                a.type_id,
                                a.scope,
                                a.area,
                                a.audit_date,
                                a.standards_refrences,
                                a.auditee_id,
                                a.auditee_name,
                              
                                a.auditor_id,
                                a.auditor_name
                            })
                            .FirstOrDefaultAsync();

                        if (audit == null)
                            return new DataResponse
                            {
                                IsSuccess = false,
                                Errors = new List<string> { "Audit not found." }
                            };
                    }

                    List<object> findings = new List<object>();
                    List<object> actions = new List<object>();

                    if (auditId > 0)
                    {
                        var findingsData = await context.view_cms2_audit_finding
       .AsNoTracking()
       .Where(f => f.audit_id == auditId)
       .OrderByDescending(f => f.id)
       .Select(f => new
       {
           f.id,
           f.audit_id,
           f.code,
           f.title,
           f.level,
           f.standard_id,
           f.standard_title,
           f.standard_description,
           f.none_compliance_description,
           f.closure_deadline,
           f.closure_auditor_date,
           f.auditor_id,
           f.auditor_name,
           f.sent_report_date,
           f.verified_qa_by,
           f.verified_qa_name,
           f.verified_qa_date
       })
       .ToListAsync();

                        var actionsData = await context.view_cms2_audit_corrective_action
                            .AsNoTracking()
                            .Where(ca => ca.audit_id == auditId)
                            .OrderByDescending(ca => ca.id)
                            .Select(ca => new
                            {
                                ca.id,
                                ca.audit_id,
                                ca.finding_id,
                                ca.code,
                                ca.action_title,
                                ca.root_cause_analysis_desc,
                                ca.request_implementation_date,
                                ca.sign_date,
                                ca.is_approved,
                                ca.approved_date,
                                ca.follow_up1_date,
                                ca.follow_up1_is_approved,
                                ca.follow_up1_extended_deadline_date,
                                ca.follow_up1_approved_date,
                                ca.follow_up2_date,
                                ca.follow_up2_is_approved,
                                ca.follow_up2_mrb_meeting_date,
                                ca.responsible_manager_id,
                                ca.responsible_manager_name
                            })
                            .ToListAsync();

                        // تبدیل بعد از materialize شدن
                        findings = findingsData.Cast<object>().ToList();
                        actions = actionsData.Cast<object>().ToList();
                        //    findings = await context.view_cms2_audit_finding
                        //        .AsNoTracking()
                        //        .Where(f => f.audit_id == auditId)
                        //        .OrderByDescending(f => f.id)
                        //        .Select(f => new
                        //        {
                        //            f.id,
                        //            f.audit_id,
                        //            f.code,
                        //            f.title,
                        //            f.level,
                        //            f.standard_id,
                        //            f.standard_title,
                        //            f.standard_description,
                        //            f.none_compliance_description,
                        //            f.closure_deadline,
                        //            f.closure_auditor_date,
                        //            f.auditor_id,
                        //            f.auditor_name,
                        //            f.sent_report_date,
                        //            f.verified_qa_by,
                        //            f.verified_qa_name,
                        //            f.verified_qa_date
                        //        })
                        //        .Cast<object>()
                        //        .ToListAsync();

                        //    actions = await context.view_cms2_audit_corrective_action
                        //        .AsNoTracking()
                        //        .Where(ca => ca.audit_id == auditId)
                        //        .OrderByDescending(ca => ca.id)
                        //        .Select(ca => new
                        //        {
                        //            ca.id,
                        //            ca.audit_id,
                        //            ca.finding_id,
                        //            ca.action_title,
                        //            ca.code,
                        //            ca.responsible_manager_name,
                        //            ca.request_implementation_date,
                        //            ca.is_approved,  
                        //            ca.root_cause_analysis_desc,
                        //            ca.sign_date,                                
                        //            ca.approved_date,
                        //            ca.follow_up1_date,
                        //            ca.follow_up1_is_approved,
                        //            ca.follow_up1_extended_deadline_date,
                        //            ca.follow_up1_approved_date,
                        //            ca.follow_up2_date,
                        //            ca.follow_up2_is_approved,
                        //            ca.follow_up2_mrb_meeting_date,
                        //            ca.created_date,
                        //            ca.created_by,

                        //            ca.responsible_manager_id,
                        //            ca.approved_by,
                        //            ca.approved_by_name,

                        //            ca.follow_up1_approved_by,
                        //            ca.follow_up1_approved_by_name,
                        //            ca.follow_up2_approved_by,
                        //            ca.follow_up2_approved_by_name
                        //        })
                        //        .Cast<object>()
                        //        .ToListAsync();
                    }

                    var auditors = await context.cms2_auditors
                        .AsNoTracking()
                        .OrderBy(a => a.first_name).ThenBy(a => a.last_name)
                        .Select(a => new { id = a.id, name = a.first_name + " " + a.last_name })
                        .ToListAsync();

                                         

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new
                        {
                            audit = audit ?? new
                            {
                                id = -1,
                               
                            },
                            auditors,
                            findings = findings,
                            actions = actions

                        }
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
        // =========================================================
        // 6) POst:  Audit  
        // =========================================================
        [HttpPost]
        [Route("api/cms/save/audit")]
        public async Task<DataResponse> SaveAudit([FromBody] audit_save_dto dto)
        {
            try
            {
                if (dto == null)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };

                if (string.IsNullOrWhiteSpace(dto.title))
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "title is required." } };

                if (dto.audit_plan_id <= 0)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "audit_plan_id is required." } };

                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit.FirstOrDefaultAsync(x => x.id == dto.id);
                    var isNew = entity == null;

                    if (isNew)
                    {
                        entity = new cms2_audit();
                        context.cms2_audit.Add(entity);

                        entity.created_at = DateTime.Now;
                        entity.created_by = dto.created_by ?? 1;
                    }
                    else
                    {
                        entity.updated_at = DateTime.Now;
                        entity.updated_by = dto.updated_by ?? dto.created_by ?? 1;
                    }

                    entity.audit_plan_id = dto.audit_plan_id;
                    entity.code = dto.code;
                    entity.title = dto.title;
                    entity.remark = dto.remark;

                    entity.type_id = (int)dto.type_id;
                    entity.scope = dto.scope;
                    entity.area = dto.area;
                    entity.audit_date = dto.audit_date;
                    entity.standards_refrences = dto.standards_refrences;

                    entity.auditee_id = (int)dto.auditee_id;
                   
                    entity.auditor_id = (int)dto.auditor_id;

                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new { id = entity.id }
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
        // =========================================================
        // 7) GeT:  Finding  
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/finding/{findingId:int}")]
        public async Task<DataResponse> GetFindingForm(int findingId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                  
                    object finding = null;

                    if (findingId > 0)
                    {
                        finding = await context.view_cms2_audit_finding
                            .AsNoTracking()
                            .Where(a => a.id == findingId)
                            .Select(a => new
                            {
                                a.id,
                                a.audit_id,
                                a.code,
                                a.title,
                                a.level,
                                a.standard_id,
                                a.standard_title,
                                a.standard_description,                       
                                a.none_compliance_description,
                                a.closure_deadline,
                                a.sent_report_date,
                                a.closure_auditor_date,
                                a.verified_qa_date,
                                a.auditor_id,
                                a.auditor_name,
                                a.verified_qa_by,
                                a.verified_qa_name
                            })
                            .FirstOrDefaultAsync();

                        if (finding == null)
                            return new DataResponse
                            {
                                IsSuccess = false,
                                Errors = new List<string> { "finding not found." }
                            };
                    }

                   // List<object> findings = new List<object>();
                    List<object> actions = new List<object>();

                    if (findingId > 0)
                    {
                        var actionsData = await context.view_cms2_audit_corrective_action
                        .AsNoTracking()
                        .Where(ca => ca.finding_id == findingId)
                        .OrderByDescending(ca => ca.id)
                        .Select(ca => new
                        {
                            ca.id,
                            ca.audit_id,
                            ca.finding_id,
                            ca.code,
                            ca.action_title,
                            ca.root_cause_analysis_desc,
                            ca.request_implementation_date,
                            ca.sign_date,
                            ca.is_approved,
                            ca.approved_date,
                            ca.follow_up1_date,
                            ca.follow_up1_is_approved,
                            ca.follow_up1_extended_deadline_date,
                            ca.follow_up1_approved_date,
                            ca.follow_up2_date,
                            ca.follow_up2_is_approved,
                            ca.follow_up2_mrb_meeting_date,
                            ca.responsible_manager_id,
                            ca.responsible_manager_name
                        })
                        .ToListAsync();

                        actions = actionsData.Cast<object>().ToList();
                    }

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new
                        {
                            finding = finding ?? new
                            {
                                id = -1,
                            },                          
                            
                            actions = actions

                        }
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
        // =========================================================
        // 8) POst:  Finding  
        // =========================================================
        [HttpPost]
        [Route("api/cms/save/finding")]
        public async Task<DataResponse> SaveFinding([FromBody] finding_save_dto dto)
        {
            try
            {
                if (dto == null)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };

                if (string.IsNullOrWhiteSpace(dto.title))
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "title is required." } };

                if (dto.audit_id <= 0)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "audit_id is required." } };

                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit_finding.FirstOrDefaultAsync(x => x.id == dto.id);
                    var isNew = entity == null;

                    if (isNew)
                    {
                        entity = new cms2_audit_finding();
                        context.cms2_audit_finding.Add(entity);

                       // entity.created_at = DateTime.Now;
                        //entity.created_by = dto.created_by ?? 1;
                    }
                    else
                    {
                        //entity.updated_at = DateTime.Now;
                        //entity.updated_by = dto.updated_by ?? dto.created_by ?? 1;
                    }

                    entity.audit_id = (int)dto.audit_id;
                    entity.code = dto.code;
                    entity.title = dto.title;
                    entity.level = dto.level;
                    entity.standard_id = (int)dto.standard_id;
                    entity.standard_title = dto.standard_title;
                    entity.standard_description = dto.standard_description;
                    entity.none_compliance_description = dto.none_compliance_description;
                    entity.closure_deadline = (DateTime)dto.closure_deadline;
                    entity.closure_auditor_date = (DateTime)dto.closure_auditor_date;
                    entity.sent_report_date = (DateTime)dto.sent_report_date;
                    entity.auditor_id = (int)dto.auditor_id;
                    entity.verified_qa_by = (int) dto.verified_qa_by;
                    entity.verified_qa_date = (DateTime) dto.verified_qa_date;

                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new { id = entity.id }
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


    }
}