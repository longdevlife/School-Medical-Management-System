using Microsoft.EntityFrameworkCore;
using Sever.Context;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Model;
using Sever.Repository;
using System;

namespace Sever.Service
{
    public class MedicineService : IMedicineService
    {
        private readonly DataContext _context;
        private readonly IFilesService _filesService;

        public MedicineService(DataContext context, IFilesService filesService)
        {
            _context = context;
            _filesService = filesService;
        }

        public async Task<Medicine> CreateMedicineAsync(MedicineDTO medicineDto, string createdBy)
        {
            var isNurse = createdBy != medicineDto.ParentID; // Nurse-created form
            var medicine = new Medicine
            {
                MedicineID = string.IsNullOrEmpty(medicineDto.MedicineID) ? Guid.NewGuid().ToString() : medicineDto.MedicineID,
                MedicineName = medicineDto.MedicineName,
                Quantity = medicineDto.Quantity,
                Dosage = medicineDto.Dosage,
                Instructions = medicineDto.Instructions,
                SentDate = medicineDto.SentDate,
                Notes = medicineDto.Notes ?? (isNurse ? "Tạo bởi y tá – chưa có xác nhận phụ huynh" : null),
                ParentID = medicineDto.ParentID,
                NurseID = isNurse ? createdBy : null,
                Status = isNurse ? "Đã xác nhận" : "Chờ xử lý"
            };

            _context.Medicine.Add(medicine);
            await _context.SaveChangesAsync();



            // Log history
            var history = new MedicineHistory
            {
                MedicineID = medicine.MedicineID,
                ModifiedBy = string.IsNullOrWhiteSpace(createdBy) ? "System" : createdBy,
                ChangeDescription = "Tạo đơn thuốc",
                ModifiedAt = DateTime.UtcNow,
                PreviousStatus = "None",
                NewStatus = medicine.Status
            };
            _context.MedicineHistory.Add(history);
            await _context.SaveChangesAsync();

            // Notify parent if created by nurse
            if (isNurse)
            {
                await NotifyParentAsync(medicine.MedicineID, medicineDto.ParentID, "Đơn thuốc được tạo bởi y tá. Vui lòng kiểm tra và xác nhận.");
            }

            return medicine;
        }

        public async Task<Medicine> UpdateMedicineAsync(string medicineId, MedicineUpdateDTO updateDto, string modifiedBy)
        {
            var medicine = await _context.Medicine.FindAsync(medicineId);
            if (medicine == null)
                throw new Exception("Không tìm thấy đơn thuốc");

            var previousStatus = medicine.Status;

            medicine.MedicineName = updateDto.MedicineName;
            medicine.Quantity = updateDto.Quantity;
            medicine.Dosage = updateDto.Dosage;
            medicine.Instructions = updateDto.Instructions;
            medicine.SentDate = updateDto.SentDate;
            medicine.Notes = updateDto.Notes;
            medicine.Status = updateDto.Status;

            //// Update doses if Quantity changes
            //int newDoseCount = int.Parse(updateDto.Quantity);
            //var existingDoses = await _context.MedicineDose.Where(d => d.MedicineID == medicineId).ToListAsync();
            //if (existingDoses.Count != newDoseCount)
            //{
            //    _context.MedicineDose.RemoveRange(existingDoses);
            //    for (int i = 1; i <= newDoseCount; Territory: i++)
            //    {
            //        _context.MedicineDose.Add(new MedicineDose
            //        {
            //            MedicineID = medicineId,
            //            DoseNumber = i,
            //            Status = "Pending"
            //        });
            //    }
            //}

            // Log history
            var history = new MedicineHistory
            {
                MedicineID = medicineId,
                ModifiedBy = modifiedBy,
                ChangeDescription = $"Cập nhật chi tiết đơn thuốc. Trạng thái thay đổi từ {previousStatus} sang {updateDto.Status}",
                ModifiedAt = DateTime.UtcNow,
                PreviousStatus = previousStatus,
                NewStatus = updateDto.Status
            };
            _context.MedicineHistory.Add(history);

            await _context.SaveChangesAsync();

            // Notify parent
            await NotifyParentAsync(medicineId, medicine.ParentID, "Đơn thuốc đã được cập nhật. Vui lòng kiểm tra và xác nhận.");

            return medicine;
        }

        public async Task<Medicine> ChangeStatusAsync(string medicineId, string newStatus, string modifiedBy, string changeDescription)
        {
            var medicine = await _context.Medicine.FindAsync(medicineId);
            if (medicine == null)
                throw new Exception("Không tìm thấy đơn thuốc");

            var previousStatus = medicine.Status;
            medicine.Status = newStatus;

            //// Update overall status based on doses
            //var doses = await _context.MedicineDose.Where(d => d.MedicineID == medicineId).ToListAsync();
            //if (newStatus == "Complete" && doses.Any(d => d.Status != "Administered"))
            //{
            //    throw new Exception("Không thể hoàn thành đơn thuốc khi còn liều chưa được cho uống.");
            //}

            // Log history
            var history = new MedicineHistory
            {
                MedicineID = medicineId,
                ModifiedBy = modifiedBy,
                ChangeDescription = changeDescription,
                ModifiedAt = DateTime.UtcNow,
                PreviousStatus = previousStatus,
                NewStatus = newStatus
            };
            _context.MedicineHistory.Add(history);

            await _context.SaveChangesAsync();

            // Notify parent
            await NotifyParentAsync(medicineId, medicine.ParentID, $"Trạng thái đơn thuốc được cập nhật thành {newStatus}. Vui lòng kiểm tra.");

            return medicine;
        }

        //public async Task<MedicineDose> UpdateDoseStatusAsync(int medicineId, int doseNumber, string newStatus, string modifiedBy, string changeDescription)
        //{
        //    var dose = await _context.MedicineDose
        //        .FirstOrDefaultAsync(d => d.MedicineID == medicineId && d.DoseNumber == doseNumber);
        //    if (dose == null)
        //        throw new Exception("Không tìm thấy liều thuốc");

        //    var previousStatus = dose.Status;
        //    dose.Status = newStatus;
        //    if (newStatus == "Administered")
        //        dose.AdministeredAt = DateTime.UtcNow;

        //    // Log history
        //    var history = new MedicineHistory
        //    {
        //        MedicineID = medicineId,
        //        ModifiedBy = modifiedBy,
        //        ChangeDescription = $"Cập nhật trạng thái liều {doseNumber}: {changeDescription}",
        //        ModifiedAt = DateTime.UtcNow,
        //        PreviousStatus = previousStatus,
        //        NewStatus = newStatus
        //    };
        //    _context.MedicineHistory.Add(history);

        //    // Update overall medicine status
        //    var medicine = await _context.Medicine.FindAsync(medicineId);
        //    var doses = await _context.MedicineDose.Where(d => d.MedicineID == medicineId).ToListAsync();
        //    if (doses.Any(d => d.Status == "Administered") && !doses.All(d => d.Status == "Administered"))
        //        medicine.Status = "Administered";
        //    else if (doses.All(d => d.Status == "Administered"))
        //        medicine.Status = "Complete";

        //    await _context.SaveChangesAsync();

        //    // Notify parent
        //    await NotifyParentAsync(medicineId, medicine.ParentID, $"Liều {doseNumber} của đơn thuốc đã được cập nhật thành {newStatus}. Vui lòng kiểm tra.");

        //    return dose;
        //}

        public async Task AddMedicinePhotoAsync(ImageUpload fileDto, string uploadedBy)
        {
        var medicine = await _context.Medicine
        .FirstOrDefaultAsync(m => m.MedicineID == fileDto.MedicineID);
            if (medicine == null)
                throw new Exception("Không tìm thấy đơn thuốc");

            var imageResponse = await _filesService.UploadImageAsync(fileDto.File);

            var file = new Files
            {
                FileName = fileDto.File.FileName,
                FileType = "Image",
                FileLink = imageResponse.Url,
                UploadDate = imageResponse.UploadedAt,
                MedicineID = fileDto.MedicineID
            };

            _context.Files.Add(file);
            await _context.SaveChangesAsync();

            // Log history
            var history = new MedicineHistory
            {
                MedicineID = fileDto.MedicineID,
                ModifiedBy = uploadedBy,
                ChangeDescription = $"Đã tải lên ảnh: {fileDto.File.FileName}",
                ModifiedAt = DateTime.UtcNow,
                PreviousStatus = medicine.Status,
                NewStatus = medicine.Status
            };
            _context.MedicineHistory.Add(history);
            await _context.SaveChangesAsync();
        }

        public async Task NotifyParentAsync(string medicineId, string userId, string message)
        {
            var notification = new Notify
            {
                FormID = "ĐƠN THUỐC",
                UserID = userId,
                NotifyName = "Cập nhật thông tin đơn thuốc",
                DateTime = DateTime.UtcNow,
                Title = "CẬP NHẬT ĐƠN THUỐC",
                Description = message
            };

            _context.Notify.Add(notification);
            await _context.SaveChangesAsync();

            // TODO: Implement actual notification delivery (e.g., email, push notification)
            // Schedule reminder after 24 hours if no response (requires background job)
        }

        public async Task<List<MedicineHistory>> GetMedicineHistoryAsync(string medicineId)
        {
            return await _context.MedicineHistory
                .Where(h => h.MedicineID == medicineId)
                .OrderBy(h => h.ModifiedAt)
                .ToListAsync();
        }
    }
}

// đơn thuốc được tạo bởi phụ huynh – chưa có xác nhận y tá sẽ luôn ở trạng thái "Chờ xử lý" và không cần xác nhận y tá.Y tá có thể cập nhật đơn thuốc và thay đổi trạng thái của nó.
// Nếu y tá tạo đơn thuốc, nó sẽ ở trạng thái "Đã xác nhận". Y tá có thể cập nhật đơn thuốc và thay đổi trạng thái của nó.
// --> vậy thì khi nào đơn thuốc được thay đổi trạng thái hàm nào thể hiện việc thay đổi trạng thái đơn thuốc? và cập nhật trạng thái là phải viết hay được quyền chọn đã xác nhận hoặc từ chối ... còn có chia nhỏ cac trạng thái khi cho student uống lần 1,2,3 
// Notify parent thì sẽ như thế nào thông báo qua đâu và hàm nào xử lý vấn đề đó
// bên cạnh đó thì file upload đã có sẵn ÌilesService.cs rồi, chỉ cần sử dụng lại thôi
