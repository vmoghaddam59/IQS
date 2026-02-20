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

            public int program_id { get; set; }   // NEW (برای Create لازم)
            public int? department_id { get; set; } // NEW

            public string planned_period_type { get; set; }  // NEW: Month | Quarter
            public int? planned_period_value { get; set; }   // NEW
            public int? planned_year { get; set; }           // NEW

            public string priority { get; set; }             // NEW
            public string audit_method { get; set; }         // NEW
            public string execution_mode { get; set; }       // NEW
            public string selection_basis { get; set; }      // NEW
            public int? planned_count { get; set; }          // NEW
            public string notes { get; set; }                // NEW

            public string code { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public int type_id { get; set; }
            public string objective { get; set; }
            public DateTime? issue_date { get; set; }

            public int? created_by { get; set; }
            public int? updated_by { get; set; }
            public DateTime? created_at { get; set; }
            public DateTime? updated_at { get; set; }
        }
        public class audit_program_save_dto
        {
            public int id { get; set; }
            public string title { get; set; }   // NEW (برای Create لازم)
            public DateTime period_from { get; set; }
            public DateTime period_to { get; set; }
            public string program_type { get; set; }
            public string status { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? updated_date { get; set; }
            public string notes { get; set; }
            public string code { get; set; }
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

            public int? auditee_id { get; set; }
            public string audit_location { get; set; }   // ✅ string
            public int? auditor_id { get; set; }

            // ✅ saved fields
            public string scheduling_type { get; set; }
            public string audit_method { get; set; }
            public string execution_mode { get; set; }
            public DateTime? scheduled_start { get; set; }
            public DateTime? scheduled_end { get; set; }
            public int? department_id { get; set; }

            // optional (will be ignored in Save)
            public string status { get; set; }

            public int? created_by { get; set; }
            public int? updated_by { get; set; }
        }


        public class audit_transition_dto
        {
            public string action { get; set; }     // Approve | Start | Close | Cancel
                                                   // public int? updated_by { get; set; }
        }

        public class finding_save_dto
        {
            public int id { get; set; }
            public int audit_id { get; set; }
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

        public class program_item_create_audit_dto
        {
            public int program_id { get; set; }          // همان audit_plan_id
            public int? plan_item_id { get; set; }       // فعلاً استفاده نمی‌کنیم (چون جدول نداریم)

            // mapping کمک کننده
            public string title { get; set; }
            public string scope { get; set; }
            public string area { get; set; }

            // required for cms2_audit (NOT NULL ها)
            public int auditee_id { get; set; }
            public int type_id { get; set; }
            public int location_id { get; set; }
            public int auditor_id { get; set; }

            public DateTime? audit_date { get; set; }
            public string standards_refrences { get; set; }
            public string remark { get; set; }

            public int? created_by { get; set; }
        }

        public class create_audit_from_plan_dto
        {
            public string title { get; set; }
            public string audit_method { get; set; }
            public string execution_mode { get; set; }
            public DateTime? scheduled_start { get; set; }
            public DateTime? scheduled_end { get; set; }
            public string audit_location { get; set; }
            public int? created_by { get; set; }
        }
        public class audit_ref_add_dto
        {
            public int doc_id { get; set; }
            public int? clause_id { get; set; }
            public byte? weight { get; set; }
            public string note { get; set; }
        }

        [HttpPost]
        [Route("api/cms/delete/audit/plan/ref/{refId:int}")]
        public async Task<DataResponse> DeletePlanRef(int refId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit_plan_ref.FirstOrDefaultAsync(x => x.id == refId);
                    if (entity == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Ref not found." } };

                    context.cms2_audit_plan_ref.Remove(entity);
                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { deleted = true } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        [HttpPost]
        [Route("api/cms/add/audit/plan/{planId:int}/ref")]
        public async Task<DataResponse> AddPlanRef(int planId, [FromBody] audit_ref_add_dto dto)
        {
            try
            {
                if (dto == null) return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };
                if (planId <= 0) return new DataResponse { IsSuccess = false, Errors = new List<string> { "planId is invalid." } };
                if (dto.doc_id <= 0) return new DataResponse { IsSuccess = false, Errors = new List<string> { "doc_id is required." } };

                using (var context = new ppa_entities())
                {
                    var exists = await context.cms2_audit_plan_ref
                        .AnyAsync(x => x.audit_plan_id == planId
                                    && x.doc_id == dto.doc_id
                                    && x.clause_id == dto.clause_id);

                    if (exists)
                        return new DataResponse { IsSuccess = true, Data = new { inserted = false, reason = "exists" } };

                    var entity = new cms2_audit_plan_ref
                    {
                        audit_plan_id = planId,
                        doc_id = dto.doc_id,
                        clause_id = dto.clause_id,
                        weight = dto.weight,
                        note = dto.note,
                        created_at = DateTime.Now
                    };

                    context.cms2_audit_plan_ref.Add(entity);
                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { inserted = true, id = entity.id } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        [HttpGet]
        [Route("api/cms/get/ref/docs")]
        public async Task<DataResponse> GetRefDocs()
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.cms2_ref_doc
                        .AsNoTracking()
                        .Where(x => x.status == "Active")
                        .OrderBy(x => x.doc_type).ThenBy(x => x.title)
                        .Select(x => new
                        {
                            x.id,
                            x.doc_type,
                            x.title,
                            x.issuer,
                            x.edition
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
        [Route("api/cms/get/ref/clauses/{docId:int}")]
        public async Task<DataResponse> GetRefClauses(int docId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.cms2_ref_clause
                        .AsNoTracking()
                        .Where(x => x.doc_id == docId && x.is_active)
                        .OrderBy(x => x.clause_code)
                        .Select(x => new
                        {
                            x.id,
                            x.doc_id,
                            x.parent_id,
                            x.clause_code,
                            x.title
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
        [Route("api/cms/get/audit/plan/{planId:int}/refs")]
        public async Task<DataResponse> GetPlanRefs(int planId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await (
                        from r in context.cms2_audit_plan_ref.AsNoTracking()
                        join d in context.cms2_ref_doc.AsNoTracking() on r.doc_id equals d.id
                        join c in context.cms2_ref_clause.AsNoTracking() on r.clause_id equals c.id into cc
                        from c in cc.DefaultIfEmpty()
                        where r.audit_plan_id == planId
                        orderby r.id descending
                        select new
                        {
                            r.id,
                            r.audit_plan_id,
                            r.doc_id,
                            r.clause_id,
                            r.weight,
                            r.note,
                            doc_title = d.title,
                            doc_type = d.doc_type,
                            clause_code = c != null ? c.clause_code : null,
                            clause_title = c != null ? c.title : null
                        }
                    ).ToListAsync();

                    return new DataResponse { IsSuccess = true, Data = list };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }
        [HttpGet]
        [Route("api/cms/get/audit/{auditId:int}/refs")]
        public async Task<DataResponse> GetAuditRefs(int auditId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await (
                        from r in context.cms2_audit_ref.AsNoTracking()
                        join d in context.cms2_ref_doc.AsNoTracking() on r.doc_id equals d.id
                        join c in context.cms2_ref_clause.AsNoTracking() on r.clause_id equals c.id into cc
                        from c in cc.DefaultIfEmpty()
                        where r.audit_id == auditId
                        orderby r.id descending
                        select new
                        {
                            r.id,
                            r.audit_id,
                            r.doc_id,
                            r.clause_id,
                            r.weight,
                            r.note,
                            doc_title = d.title,
                            doc_type = d.doc_type,
                            clause_code = c != null ? c.clause_code : null,
                            clause_title = c != null ? c.title : null
                        }
                    ).ToListAsync();

                    return new DataResponse { IsSuccess = true, Data = list };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }


        [HttpPost]
        [Route("api/cms/delete/audit/ref/{refId:int}")]
        public async Task<DataResponse> DeleteAuditRef(int refId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit_ref.FirstOrDefaultAsync(x => x.id == refId);
                    if (entity == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Ref not found." } };

                    context.cms2_audit_ref.Remove(entity);
                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { deleted = true } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }


        [HttpPost]
        [Route("api/cms/add/audit/{auditId:int}/ref")]
        public async Task<DataResponse> AddAuditRef(int auditId, [FromBody] audit_ref_add_dto dto)
        {
            try
            {
                if (dto == null) return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };
                if (dto.doc_id <= 0) return new DataResponse { IsSuccess = false, Errors = new List<string> { "doc_id is required." } };
                if (auditId <= 0) return new DataResponse { IsSuccess = false, Errors = new List<string> { "auditId is invalid." } };

                using (var context = new ppa_entities())
                {
                    var exists = await context.cms2_audit_ref
                        .AnyAsync(x => x.audit_id == auditId
                                    && x.doc_id == dto.doc_id
                                    && x.clause_id == dto.clause_id);

                    if (exists)
                        return new DataResponse { IsSuccess = true, Data = new { inserted = false, reason = "exists" } };

                    var entity = new cms2_audit_ref
                    {
                        audit_id = auditId,
                        doc_id = dto.doc_id,
                        clause_id = dto.clause_id,
                        weight = dto.weight,
                        note = dto.note,
                        created_at = DateTime.Now
                    };

                    context.cms2_audit_ref.Add(entity);
                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { inserted = true, id = entity.id } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }



        [HttpPost]
        [Route("api/cms/audits/from-plan/{planItemId:int}")]
        public async Task<DataResponse> CreateDraftAuditFromPlan(int planItemId, [FromBody] create_audit_from_plan_dto dto)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var plan = await context.cms2_audit_plan
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.id == planItemId);

                    if (plan == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Plan item not found." } };

                    // (اختیاری) اگر برنامه Locked است، اجازه نده
                    // var programStatus = await context.cms2_audit_program
                    //     .Where(x => x.id == plan.program_id)
                    //     .Select(x => x.status)
                    //     .FirstOrDefaultAsync();
                    // if (programStatus == "Locked")
                    //     return new DataResponse { IsSuccess = false, Errors = new List<string> { "Program is locked." } };

                    // (اختیاری) جلوگیری از ساخت دوباره
                    // var exists = await context.cms2_audit.AnyAsync(a => a.audit_plan_id == planItemId && a.status != "Cancelled");
                    // if (exists)
                    //     return new DataResponse { IsSuccess = false, Errors = new List<string> { "Audit already exists for this plan item." } };

                    var title = string.IsNullOrWhiteSpace(dto?.title) ? plan.title : dto.title;

                    var audit = new cms2_audit
                    {
                        audit_plan_id = planItemId,
                        audit_program_id = plan.program_id,
                        type_id = plan.type_id,

                        title = title,

                        // اگر فعلاً scope/area را نگه می‌داری:
                        scope = title,
                        area = null,

                        status = "Draft",
                        scheduling_type = "Scheduled",

                        // ✅ default from plan first
                        audit_method = !string.IsNullOrWhiteSpace(dto?.audit_method)
                                        ? dto.audit_method
                                        : (!string.IsNullOrWhiteSpace(plan.audit_method) ? plan.audit_method : "Process"),

                        execution_mode = !string.IsNullOrWhiteSpace(dto?.execution_mode)
                                        ? dto.execution_mode
                                        : (!string.IsNullOrWhiteSpace(plan.execution_mode) ? plan.execution_mode : "Onsite"),

                        scheduled_start = dto?.scheduled_start,
                        scheduled_end = dto?.scheduled_end,

                        // ✅ set audit_location from dto
                        audit_location = dto?.audit_location,

                        // ✅ copy department link (اگر لازم داری)
                        department_id = plan.department_id,

                        created_at = DateTime.Now,
                        created_by = dto?.created_by ?? 1
                    };

                    context.cms2_audit.Add(audit);
                    await context.SaveChangesAsync();

                    return new DataResponse
                    {
                        IsSuccess = true,
                        Data = new { id = audit.id, code = audit.code }
                    };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        [HttpGet]
        [Route("api/cms/get/audit/programs")]
        public async Task<DataResponse> GetAuditPrograms()
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.view_cms2_audit_program
                        .AsNoTracking()
                        .OrderByDescending(x => x.period_from)
                        .ThenByDescending(x => x.id)
                        .Select(x => new
                        {
                            x.id,
                            x.code,
                            x.title,
                            program_type = x.program_type,
                            x.period_from,
                            x.period_to,
                            x.status,
                            x.updated_date
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

        [HttpPost]
        [Route("api/cms/cancel/audit/program/item/{itemId:int}")]
        public async Task<DataResponse> CancelAuditProgramItem(int itemId)
        {
            try
            {
                if (itemId <= 0)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "itemId is invalid." } };

                using (var context = new ppa_entities())
                {
                    var plan = await context.cms2_audit_plan.FirstOrDefaultAsync(p => p.id == itemId);
                    if (plan == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Plan item not found." } };

                    // ✅ اگر از قبل غیرفعال شده
                    if (!plan.is_active)
                        return new DataResponse { IsSuccess = true, Data = new { cancelled = true, already = true } };

                    // ✅ اگر برای این Plan آیتم، Audit فعال ساخته شده باشد، اجازه Cancel نده
                    var hasActiveAudit = await context.cms2_audit
                        .AnyAsync(a => a.audit_plan_id == itemId && a.status != "Cancelled");

                    if (hasActiveAudit)
                        return new DataResponse
                        {
                            IsSuccess = false,
                            Errors = new List<string> { "Cannot cancel: audit exists for this plan item." }
                        };

                    // ✅ Soft delete
                    plan.is_active = false;
                    plan.updated_at = DateTime.Now;
                    plan.updated_by = plan.updated_by ?? plan.created_by; // ساده و بدون پیچیدگی کاربر جاری

                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { cancelled = true } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }
        [HttpGet]
        [Route("api/cms/get/audit/program/{programId:int}")]
        public async Task<DataResponse> GetAuditProgramDetail(int programId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var p = await context.view_cms2_audit_program
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.id == programId);

                    if (p == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Program not found." } };

                    // فعلاً KPI خالی برمی‌گردونیم تا UI نشکنه
                    var dto = new
                    {
                        program = new
                        {
                            id = p.id,
                            code = p.code,
                            title = p.title,
                            program_type = p.program_type,
                            status = p.status,
                            periodFrom = p.period_from,
                            periodTo = p.period_to,
                            notes = p.notes,
                            lastUpdate = (DateTime?)(p.updated_date ?? p.created_date)
                        },
                        kpi = new { planned = 0, created = 0, inProgress = 0, overdue = 0, completed = 0, coveragePct = 0 },
                        coverage = new
                        {
                            flightOps = new { planned = 0, created = 0 },
                            ramp = new { planned = 0, created = 0 }
                        }
                    };

                    return new DataResponse { IsSuccess = true, Data = dto };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }
        [HttpGet]
        [Route("api/cms/get/audit/program/items/{programId:int}")]
        public async Task<DataResponse> GetAuditProgramItems(int programId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    // 1) Plan items
                    var plans = await context.view_cms2_audit_plan
                        .AsNoTracking()
                         .Where(p => p.program_id == programId && p.is_active)
                        .OrderByDescending(p => p.planned_from)
                        .ThenByDescending(p => p.id)
                        .Select(p => new
                        {
                            id = p.id,
                            program_id = p.program_id,
                            code = p.code,
                            title = p.title,
                            description = p.description,
                            type_id = p.type_id,
                            objective = p.objective,
                            planned_from = p.planned_from,
                            planned_to = p.planned_to,
                            issue_date = p.issue_date,
                            created_at = p.created_at,
                            updated_at = p.updated_at,
                            planned_period_type = p.planned_period_type,
                            planned_period_value = p.planned_period_value,
                            planned_year = p.planned_year,
                            priority = p.priority,
                            audit_method = p.audit_method,
                            execution_mode = p.execution_mode,
                            selection_basis = p.selection_basis,
                            planned_count = p.planned_count,
                            department_id = p.department_id,
                            department_title = p.department_title,
                            is_active = p.is_active,
                            notes = p.notes

                        })
                        .ToListAsync();

                    var planIds = plans.Select(x => x.id).ToList();

                    // اگر چیزی نیست
                    if (planIds.Count == 0)
                        return new DataResponse { IsSuccess = true, Data = new object[0] };

                    // 2) Latest audit per plan item
                    // چون EF6 group-by + ordering سخت می‌شود، دو مرحله‌ای می‌رویم:
                    var audits = await context.cms2_audit
                        .AsNoTracking()
                        .Where(a => a.audit_plan_id != null && planIds.Contains(a.audit_plan_id.Value))
                        .Select(a => new
                        {
                            a.id,
                            audit_plan_id = a.audit_plan_id.Value,
                            a.status,
                            a.audit_method,
                            a.execution_mode,
                            a.scheduling_type,
                            a.scheduled_start,
                            a.scheduled_end,
                            a.code


                        })
                        .ToListAsync();

                    // latest per plan: max id
                    var latestByPlan = audits
                        .GroupBy(a => a.audit_plan_id)
                        .Select(g => g.OrderByDescending(x => x.id).First())
                        .ToDictionary(x => x.audit_plan_id, x => x);

                    // 3) Build response rows (match your UI fields)
                    var plannedCount = 0;
                    var createdCount = 0;
                    var inProgressCount = 0;
                    var completedCount = 0;
                    var cancelledCount = 0;
                    var rows = plans.Select(p =>
                    {
                        latestByPlan.TryGetValue(p.id, out var la);

                        // status mapping for the plan item row (UI status)
                        var rowStatus = "Planned";
                        if (la != null)
                        {
                            if (la.status == "Draft" || la.status == "Scheduled") rowStatus = "Created";
                            else if (la.status == "InExecution") rowStatus = "InExecution";
                            else if (la.status == "FieldCompleted" || la.status == "Closed") rowStatus = "FieldCompleted";
                            else if (la.status == "Cancelled") rowStatus = "Cancelled";
                            else rowStatus = "Created";
                        }
                        switch (rowStatus)
                        {
                            case "Planned": plannedCount++; break;
                            case "Created": createdCount++; break;
                            case "InExecution": inProgressCount++; break;
                            case "FieldCompleted": completedCount++; break;
                            case "Cancelled": cancelledCount++; break;
                        }

                        // period label based on your enforced types: Month / Quarter
                        string periodLabel = "—";
                        if (p.planned_year.HasValue && !string.IsNullOrEmpty(p.planned_period_type) && p.planned_period_value.HasValue)
                        {
                            if (p.planned_period_type == "Month")
                                periodLabel = $"{p.planned_year.Value} / M{p.planned_period_value.Value:00}";
                            else if (p.planned_period_type == "Quarter")
                                periodLabel = $"{p.planned_year.Value} / Q{p.planned_period_value.Value}";
                            else
                                periodLabel = $"{p.planned_year.Value} / {p.planned_period_type} {p.planned_period_value.Value}";
                        }
                        else if (p.planned_year.HasValue && !string.IsNullOrEmpty(p.planned_period_type))
                        {
                            // if value missing, still show something
                            periodLabel = $"{p.planned_year.Value} / {p.planned_period_type}";
                        }

                        return new
                        {
                            id = p.id,
                            program_id = p.program_id,

                            // PLAN fields
                            plan_code = p.code,
                            scope_title = p.title,
                            description = p.description,
                            type_id = p.type_id,
                            objective = p.objective,

                            department_id = p.department_id,
                            department_title = p.department_title,
                            notes = p.notes,

                            planned_period_type = p.planned_period_type,
                            planned_period_value = p.planned_period_value,
                            planned_year = p.planned_year,
                            period_label = periodLabel,

                            priority = p.priority,
                            audit_method = p.audit_method,
                            execution_mode = p.execution_mode,
                            selection_basis = p.selection_basis,
                            planned_count = p.planned_count,

                            // keep (legacy)
                            planned_from = p.planned_from,
                            planned_to = p.planned_to,

                            // EXECUTION summary linkage
                            status = rowStatus,
                            audit_id = (la != null ? (int?)la.id : null),
                            audit_status = (la != null ? la.status : null),

                            scheduling_type = (la != null ? la.scheduling_type : null),
                            scheduled_start = (la != null ? la.scheduled_start : null),
                            scheduled_end = (la != null ? la.scheduled_end : null),

                            audit_code = (la != null ? la.code : null)
                        };

                    }).ToList();
                    var summary = new
                    {
                        planned = plannedCount,
                        created = createdCount,
                        inProgress = inProgressCount,
                        completed = completedCount,
                        cancelled = cancelledCount,
                        total = plans.Count
                        // overdue = plans.Count - plannedCount - createdCount - inProgressCount - completedCount - cancelledCount;
                    };


                    return new DataResponse { IsSuccess = true, Data = rows, DataExtra = summary };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
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
        // Program
        // =========================================================

        [HttpPost]
        [Route("api/cms/save/audit/program")]
        public async Task<DataResponse> SaveAuditProgram([FromBody] audit_program_save_dto dto)
        {
            try
            {
                if (dto == null)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "DTO is null." } };

                if (string.IsNullOrWhiteSpace(dto.title))
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "title is required." } };

                using (var context = new ppa_entities())
                {
                    var entity = await context.cms2_audit_program.FirstOrDefaultAsync(q => q.id == dto.id);
                    var isNew = entity == null;

                    if (isNew)
                    {
                        entity = new cms2_audit_program();
                        context.cms2_audit_program.Add(entity);

                        entity.created_date = DateTime.Now;
                        // entity. = dto.created_by ?? 1;

                    }
                    else
                    {
                        entity.updated_date = DateTime.Now;
                        //entity.updated_by = dto.updated_by ?? dto.created_by ?? 1;
                    }

                    // fields
                    //entity.code = dto.code;
                    entity.title = dto.title;
                    entity.program_type = dto.program_type;
                    ;
                    entity.period_from = dto.period_from;
                    entity.period_to = dto.period_to;
                    entity.status = dto.status;

                    entity.notes = dto.notes;


                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { id = entity.id } };
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

                            a.audit_location,
                   

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
        [HttpGet]
        [Route("api/cms/get/audits/by-plan/{planId:int}")]
        public async Task<DataResponse> GetAuditsByPlan(int planId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var list = await context.view_cms2_audit
                        .AsNoTracking()
                        .Where(a => a.audit_plan_id == planId)
                        .OrderByDescending(a => a.id)
                        .Select(a => new {
                            a.id,
                            a.audit_plan_id,
                            a.code,
                            a.status,
                            a.audit_date,
                            a.scheduled_start,
                            a.scheduled_end,
                            a.department_id,
                            a.auditee_department_title
                            // اگر department_title می‌خوای بهتره از view_cms2_audit بخونی
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
        // 3) POST: ذخیره Audit Plan (Write فقط روی جدول cms2_audit_plan)
        //// =========================================================


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
                        entity.created_by = dto.created_by ?? 4011;

                        // NEW: program_id برای ایجاد
                        entity.program_id = dto.program_id;
                        entity.is_active = true;
                    }
                    else
                    {
                        entity.updated_at = DateTime.Now;
                        entity.updated_by = dto.updated_by ?? dto.created_by ?? 4011;
                    }

                    // fields
                    entity.code = dto.code;
                    entity.title = dto.title;
                    entity.description = dto.description;
                    entity.type_id = dto.type_id;
                    entity.objective = dto.objective;
                    entity.issue_date = dto.issue_date;


                    entity.department_id = dto.department_id;
                    entity.planned_period_type = dto.planned_period_type ?? entity.planned_period_type; // اگر null بود همون قبلی
                    entity.planned_period_value = dto.planned_period_value;
                    entity.planned_year = dto.planned_year;

                    entity.priority = dto.priority;
                    entity.audit_method = dto.audit_method;
                    entity.execution_mode = dto.execution_mode;
                    entity.selection_basis = dto.selection_basis;
                    entity.planned_count = dto.planned_count;
                    entity.notes = dto.notes;

                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { id = entity.id } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

        // =========================================================
        // 5) GeT:  Audit  
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/audits")]
        public async Task<DataResponse> GetAudits(int? program_id = null, string status = null, string q = null, DateTime? df = null, DateTime? dt = null)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    var query = context.cms2_audit.AsNoTracking().AsQueryable();

                    if (program_id.HasValue && program_id.Value > 0)
                        query = query.Where(x => x.audit_program_id == program_id.Value);

                    if (!string.IsNullOrWhiteSpace(status))
                        query = query.Where(x => x.status == status);

                    if (df.HasValue) query = query.Where(x => x.created_at >= df.Value);
                    if (dt.HasValue) query = query.Where(x => x.created_at <= dt.Value);

                    if (!string.IsNullOrWhiteSpace(q))
                    {
                        q = q.Trim();
                        query = query.Where(x =>
                            x.code.Contains(q) ||
                            x.title.Contains(q) ||
                            x.scope.Contains(q) ||
                            x.area.Contains(q) ||
                            x.audit_location.Contains(q)
                        );
                    }

                    var list = await query
                        .OrderByDescending(x => x.id)
                        .Select(x => new
                        {
                            id = x.id,
                            code = x.code,
                            title = x.title,
                            status = x.status,
                            audit_method = x.audit_method,
                            execution_mode = x.execution_mode,
                            scheduling_type = x.scheduling_type,
                            scheduled_start = x.scheduled_start,
                            scheduled_end = x.scheduled_end,
                            audit_program_id = x.audit_program_id,
                            audit_plan_id = x.audit_plan_id,
                            created_at = x.created_at
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
        [Route("api/cms/get/audit/{auditId:int}")]
        public async Task<DataResponse> GetAuditForm(int auditId)
        {
            try
            {
                using (var context = new ppa_entities())
                {
                    // برای add جدید (auditId = -1)
                    object audit = null;
                    var auditRefs = new List<object>();

                    if (auditId > 0)
                    {
                        audit = await context.view_cms2_audit
                            .AsNoTracking()
                            .Where(a => a.id == auditId)
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

                                a.audit_location,                            

                                a.auditor_id,
                                a.auditor_name,

                                a.status,
                                a.scheduling_type,
                                a.audit_method,
                                a.execution_mode,
                                a.scheduled_start,
                                a.scheduled_end,
                                a.department_id
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

                        var auditRefsData = await (
    from r in context.cms2_audit_ref.AsNoTracking()
    join d in context.cms2_ref_doc.AsNoTracking() on r.doc_id equals d.id
    join c in context.cms2_ref_clause.AsNoTracking() on r.clause_id equals c.id into cc
    from c in cc.DefaultIfEmpty()
    where r.audit_id == auditId
    orderby r.id descending
    select new
    {
        r.id,
        r.audit_id,
        r.doc_id,
        r.clause_id,
        r.weight,
        r.note,
        doc_title = d.title,
        doc_type = d.doc_type,
        clause_code = c != null ? c.clause_code : null,
        clause_title = c != null ? c.title : null
    }
).ToListAsync();

                        auditRefs = auditRefsData.Cast<object>().ToList();

                        // تبدیل بعد از materialize شدن
                        findings = findingsData.Cast<object>().ToList();
                        actions = actionsData.Cast<object>().ToList();
                    }

                    var auditors = await context.cms2_auditors
                        .AsNoTracking()
                        .OrderBy(a => a.first_name).ThenBy(a => a.last_name)
                        .Select(a => new { id = a.id, name = a.first_name + " " + a.last_name })
                        .ToListAsync();

                    var refDocs = await context.cms2_ref_doc
    .AsNoTracking()
    .Where(d => d.status == "Active")
    .OrderBy(d => d.doc_type).ThenBy(d => d.title)
    .Select(d => new
    {
        d.id,
        d.doc_type,
        d.title,
        d.issuer,
        d.edition
    })
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
                            // audit = audit ?? new { id = -1 },
                            auditors,
                            findings = findings,
                            actions = actions,
                            ref_docs = refDocs,
                            audit_refs = auditRefs

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
        //  Audit  
        // =========================================================
        [HttpGet]
        [Route("api/cms/get/audit/lookups")]
        public DataResponse GetAuditLookups()
        {
            try
            {
                // مقادیر باید دقیقاً مطابق CHECK CONSTRAINT ها باشند
                var data = new
                {
                    scheduling_types = new[]
                    {
                new { value = "Scheduled", label = "Scheduled" },
                new { value = "NonScheduled", label = "Non-Scheduled" },
                new { value = "AdHoc", label = "Ad-Hoc" },
                new { value = "FollowUp", label = "Follow-up" }
            },
                    execution_modes = new[]
                    {
                new { value = "Onsite", label = "Onsite" },
                new { value = "Remote", label = "Remote" }
            },
                    audit_methods = new[]
                    {
                new { value = "Process", label = "Process" },
                new { value = "Product", label = "Product" },
                new { value = "GapAnalysis", label = "Gap analysis" },
                new { value = "PreAudit", label = "Pre-audit" },
                new { value = "NightAudit", label = "Night audit" },
                new { value = "RampInspection", label = "Ramp inspection" },
                new { value = "LOSA", label = "LOSA" }
            },
                    statuses = new[]
                    {
                new { value = "Draft", label = "Draft" },
                new { value = "Scheduled", label = "Scheduled" },
                new { value = "InExecution", label = "In Execution" },
                new { value = "FieldCompleted", label = "Field Completed" },
                new { value = "Closed", label = "Closed" },
                new { value = "Cancelled", label = "Cancelled" }
            }
                };

                return new DataResponse { IsSuccess = true, Data = data };
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }
        [HttpPost]
        [Route("api/cms/audit/{auditId:int}/transition")]
        public async Task<DataResponse> TransitionAudit(int auditId, [FromBody] audit_transition_dto dto)
        {
            try
            {
                if (auditId <= 0)
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "auditId is invalid." } };

                if (dto == null || string.IsNullOrWhiteSpace(dto.action))
                    return new DataResponse { IsSuccess = false, Errors = new List<string> { "action is required." } };

                var action = dto.action.Trim();

                using (var context = new ppa_entities())
                {
                    var audit = await context.cms2_audit.FirstOrDefaultAsync(x => x.id == auditId);
                    if (audit == null)
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Audit not found." } };

                    var current = audit.status ?? "Draft";
                    var next = current;

                    // قوانین ساده (بعداً می‌تونیم سخت‌گیرانه‌ترش کنیم)
                    if (action == "Approve")
                    {
                        if (current != "Draft")
                            return new DataResponse { IsSuccess = false, Errors = new List<string> { "Only Draft can be approved." } };

                        next = "Scheduled"; // چون در constraint Approved ندارید
                    }
                    else if (action == "Start")
                    {
                        if (current != "Scheduled")
                            return new DataResponse { IsSuccess = false, Errors = new List<string> { "Only Scheduled can be started." } };

                        next = "InExecution";
                        if (!audit.actual_start.HasValue) audit.actual_start = DateTime.Now;
                    }
                    else if (action == "Close")
                    {
                        if (current != "InExecution" && current != "FieldCompleted")
                            return new DataResponse { IsSuccess = false, Errors = new List<string> { "Only InExecution can be closed." } };

                        next = "Closed";
                        if (!audit.actual_end.HasValue) audit.actual_end = DateTime.Now;
                    }
                    else if (action == "Cancel")
                    {
                        if (current == "Closed" || current == "FieldCompleted" || current == "Cancelled")
                            return new DataResponse { IsSuccess = false, Errors = new List<string> { "Audit cannot be cancelled in this status." } };

                        next = "Cancelled";
                    }
                    else
                    {
                        return new DataResponse { IsSuccess = false, Errors = new List<string> { "Invalid action." } };
                    }

                    audit.status = next;
                    audit.updated_at = DateTime.Now;
                    audit.updated_by = 4011; //dto.updated_by ?? audit.updated_by ?? audit.created_by ?? 1;

                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { id = audit.id, from = current, to = next } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
            }
        }

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
                        entity.created_by = dto.created_by ?? 4011;

                        // ✅ status only on create (Save will NOT update status later)
                        entity.status = "Draft";

                        // defaults (DB also has defaults, this is just for safety)
                        entity.scheduling_type = string.IsNullOrWhiteSpace(dto.scheduling_type) ? "Scheduled" : dto.scheduling_type;
                        entity.audit_method = string.IsNullOrWhiteSpace(dto.audit_method) ? "Process" : dto.audit_method;
                        entity.execution_mode = string.IsNullOrWhiteSpace(dto.execution_mode) ? "Onsite" : dto.execution_mode;
                    }
                    else
                    {
                        entity.updated_at = DateTime.Now;
                        entity.updated_by = dto.updated_by ?? dto.created_by ?? 4011;

                        // ⚠️ status is intentionally NOT changed here (workflow endpoint only)
                    }

                    // core
                    entity.audit_plan_id = dto.audit_plan_id;

                    // code usually generated by trigger; allow manual only if provided
                    if (!string.IsNullOrWhiteSpace(dto.code))
                        entity.code = dto.code;

                    entity.title = dto.title;
                    entity.remark = dto.remark;

                    // nullable-safe mappings
                    entity.type_id = dto.type_id;
                    entity.auditee_id = dto.auditee_id;
                    entity.auditor_id = dto.auditor_id;

                    entity.scope = dto.scope;
                    entity.area = dto.area;
                    entity.audit_date = dto.audit_date;


                    entity.auditee_id = (int)dto.auditee_id;

                    entity.auditor_id = (int)dto.auditor_id;

                    // ✅ location as string
                    entity.audit_location = dto.audit_location;

                    // ✅ department (Location table)
                    entity.department_id = dto.department_id;

                    // ✅ scheduling/execution fields (update allowed)
                    if (!string.IsNullOrWhiteSpace(dto.scheduling_type))
                        entity.scheduling_type = dto.scheduling_type;

                    if (!string.IsNullOrWhiteSpace(dto.audit_method))
                        entity.audit_method = dto.audit_method;

                    if (!string.IsNullOrWhiteSpace(dto.execution_mode))
                        entity.execution_mode = dto.execution_mode;

                    entity.scheduled_start = dto.scheduled_start;
                    entity.scheduled_end = dto.scheduled_end;


                    await context.SaveChangesAsync();

                    return new DataResponse { IsSuccess = true, Data = new { id = entity.id } };
                }
            }
            catch (Exception ex)
            {
                return new DataResponse { IsSuccess = false, Errors = new List<string> { ex.Message } };
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

                    entity.audit_id = dto.audit_id;
                    entity.code = dto.code;
                    entity.title = dto.title;
                    entity.level = dto.level;
                    entity.standard_id = (int?)dto.standard_id;
                    entity.standard_title = dto.standard_title;
                    entity.standard_description = dto.standard_description;
                    entity.none_compliance_description = dto.none_compliance_description;
                    // entity.closure_deadline = (DateTime)dto.closure_deadline;
                    entity.closure_deadline = DateTime.Now;
                    entity.closure_auditor_date = (DateTime?)dto.closure_auditor_date;
                    entity.sent_report_date = (DateTime?)dto.sent_report_date;
                    entity.auditor_id = (int?)dto.auditor_id;
                    entity.verified_qa_by = (int?)dto.verified_qa_by;
                    entity.verified_qa_date = (DateTime?)dto.verified_qa_date;

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