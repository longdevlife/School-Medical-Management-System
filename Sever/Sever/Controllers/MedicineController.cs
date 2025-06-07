using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Sever.DTO;
using Sever.Interface;
using Sever.Model;
using Sever.Service;

namespace Sever.Controllers
{
    [ApiController]
    [Route("api/medicine")]
    public class MedicineController : ControllerBase
    {
        private readonly IMedicine _service;
        public MedicineController(IMedicine service) => _service = service;

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] MedicineCreateDTO dto)
        {
            var userId = User.Identity.Name; // or get from JWT
            var medicineId = await _service.CreateMedicineAsync(dto, userId);
            return Ok(new { medicineId });
        }

        [HttpPut("verify/{id}")]
        public async Task<IActionResult> Verify(string id, [FromBody] string note)
        {
            var nurseId = User.Identity.Name;
            var result = await _service.VerifyMedicineAsync(id, nurseId, note);
            return result ? Ok() : NotFound();
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> Reject(string id, [FromBody] string reason)
        {
            var nurseId = User.Identity.Name;
            var result = await _service.RejectMedicineAsync(id, nurseId, reason);
            return result ? Ok() : NotFound();
        }

        [HttpGet("history/{id}")]
        public async Task<IActionResult> GetHistory(string id)
        {
            var history = await _service.GetEditHistoryAsync(id);
            return Ok(history);
        }
    }
}

// http://localhost:5166/api/medicine/create
// /api/medicine/verify/{id}
// /api / medicine / reject /{ id}
// /api/medicine/history/{id}