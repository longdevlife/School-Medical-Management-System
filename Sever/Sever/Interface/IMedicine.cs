using Sever.DTO;

namespace Sever.Interface
{
    public interface IMedicine
    {
        Task<string> CreateMedicineAsync(MedicineCreateDTO dto, string createdBy);
        Task<bool> VerifyMedicineAsync(string medicineId, string nurseId, string notes);
        Task<bool> RejectMedicineAsync(string medicineId, string nurseId, string reason);
        Task<List<MedicineHistoryDTO>> GetEditHistoryAsync(string medicineId);
    }
}
