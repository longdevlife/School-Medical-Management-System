using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Model;

namespace Sever.Repository
{
    public interface IMedicineService
    {
        Task<Medicine> CreateMedicineAsync(MedicineDTO medicineDto, string createdBy);
        Task<Medicine> UpdateMedicineAsync(string medicineId, MedicineUpdateDTO updateDto, string modifiedBy);
        Task<Medicine> ChangeStatusAsync(string medicineId, string newStatus, string modifiedBy, string changeDescription);
        Task AddMedicinePhotoAsync(ImageUpload fileDto, string uploadedBy);
        Task NotifyParentAsync(string medicineId, string userId, string message);
        Task<List<MedicineHistory>> GetMedicineHistoryAsync(String medicineId);
    }
}
