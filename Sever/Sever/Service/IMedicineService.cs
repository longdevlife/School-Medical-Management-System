using Microsoft.EntityFrameworkCore;
using Sever.DTO.File;
using Sever.DTO.SendMedicine;
using Sever.Model;
using Sever.Repository;
using System;

namespace Sever.Service
{
    public interface IMedicineService
    {
        Task<Medicine> CreateMedicineAsync(MedicineDTO medicineDto, string createdBy);
        Task<Medicine> UpdateMedicineAsync(string medicineId, MedicineUpdateDTO updateDto, string modifiedBy);
        Task<Medicine> ChangeStatusAsync(string medicineId,ChangeStatusDTO changeStatusDto, string modifiedBy);
        Task AddMedicinePhotoAsync(ImageUpload fileDto, string uploadedBy);
        Task<List<MedicineHistory>> GetMedicineHistoryAsync(string medicineId);
    }
    public class MedicineService : IMedicineService
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IFilesService _filesService;
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MedicineService(
            IMedicineRepository medicineRepository,
            IFilesService filesService,
            INotificationService notificationService,
            IHttpContextAccessor httpContextAccessor)
        {
            _medicineRepository = medicineRepository;
            _filesService = filesService;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<Medicine> CreateMedicineAsync(MedicineDTO medicineDto, string createdBy)
        {
            try
            {
                if (medicineDto == null)
                    throw new ArgumentNullException(nameof(medicineDto), "Thông tin đơn thuốc không được để trống.");

                // Lấy Role từ JWT Token
                var userId = _httpContextAccessor.HttpContext.User.Identity?.Name;
                var roleClaim = _httpContextAccessor.HttpContext.User
                    .FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(roleClaim))
                    throw new Exception("Không thể xác định người dùng hoặc vai trò.");

                string role = roleClaim;


                // Tạo mã đơn thuốc mới theo format Mxxx
                string newMedicineId = "M001";
                var latestMedicine = await _medicineRepository.GetLatestMedicineAsync();
                if (latestMedicine != null && latestMedicine.MedicineID.StartsWith("M"))
                {
                    var numberPart = latestMedicine.MedicineID.Substring(1);
                    if (int.TryParse(numberPart, out int currentIndex))
                    {
                        newMedicineId = $"M{(currentIndex + 1):D3}";
                    }
                }

                var medicine = new Medicine
                {
                    MedicineID = newMedicineId,
                    MedicineName = medicineDto.MedicineName,
                    Quantity = medicineDto.Quantity,
                    Dosage = medicineDto.Dosage,
                    Instructions = medicineDto.Instructions,
                    SentDate = medicineDto.SentDate,
                    Notes = medicineDto.Notes,
                    //Status = role == "Nurse" ? "Đã xác nhận" : "Chờ xử lý"
                    Status = role == "Nurse" 
                    ? (medicineDto.Status == "Chờ xử lý" || medicineDto.Status == "Đã xác nhận"
                    ? medicineDto.Status : "Chờ xử lý")
                    : "Chờ xử lý"
                };
                if (role == "Nurse")
                    medicine.NurseID = userId;
                else if (role == "Parent")
                    medicine.ParentID = userId;

                await _medicineRepository.CreateMedicineAsync(medicine);
               
          


                var history = new MedicineHistory
                {
                    MedicineID = medicine.MedicineID,
                    ModifiedBy = userId,
                    ChangeDescription = "Tạo đơn thuốc",
                    ModifiedAt = DateTime.UtcNow.AddHours(7),
                    PreviousStatus = "N/A",
                    NewStatus = medicine.Status
                };

                await _medicineRepository.AddHistoryAsync(history);

                if (role == "Nurse")
                {
                    await _notificationService.MedicineNotification(
                        medicine,
                        "Đơn thuốc được tạo bởi y tá. Vui lòng kiểm tra và xác nhận."
                    );
                }

                return medicine;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi tạo đơn thuốc.", ex);
            }
        }

        public async Task<Medicine> UpdateMedicineAsync(string medicineId, MedicineUpdateDTO updateDto, string modifiedBy)
        {
            try
            {
                var medicine = await _medicineRepository.GetMedicineByIdAsync(medicineId);
                if (medicine == null)
                {
                    throw new Exception("Không tìm thấy đơn thuốc.");
                }


                var previousStatus = medicine.Status;

                medicine.MedicineName = updateDto.MedicineName;
                medicine.Quantity = updateDto.Quantity;
                medicine.Dosage = updateDto.Dosage;
                medicine.Instructions = updateDto.Instructions;
                medicine.SentDate = updateDto.SentDate;
                medicine.Notes = updateDto.Notes;
                medicine.Status = "Đang xử lý";

            


                var history = new MedicineHistory
                {
 
                    MedicineID = medicineId,
                    ModifiedBy = modifiedBy,
                    ChangeDescription = $"Cập nhật chi tiết đơn thuốc.",
                    ModifiedAt = DateTime.UtcNow.AddHours(7),
                    PreviousStatus = previousStatus,
                    NewStatus = medicine.Status
                };
                await _medicineRepository.AddHistoryAsync(history);

                await _medicineRepository.UpdateMedicineAsync(medicine);

                await _notificationService.MedicineNotification(medicine, "Đơn thuốc đã được cập nhật. Vui lòng kiểm tra và xác nhận.");

                return medicine;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi cập nhật đơn thuốc.", ex);
            }
        }

        public async Task<Medicine> ChangeStatusAsync(string medicineId, ChangeStatusDTO changeStatusDto, string modifiedBy)
        {
            try
            {
                var medicine = await _medicineRepository.GetMedicineByIdAsync(medicineId);
                if (medicine == null)
                {
                    throw new Exception("Không tìm thấy đơn thuốc.");
                }

                // Kiểm tra trạng thái hợp lệ
                var validStatuses = new List<string> {"Chờ xử lý", "Đã xác nhận", "Đang thực hiện", "Từ chối" };
                if (!validStatuses.Contains(changeStatusDto.NewStatus))
                {
                    throw new ArgumentException("Trạng thái không hợp lệ.");
                }

                // Kiểm tra quyền (chỉ y tá được thay đổi trạng thái)
                if (modifiedBy == medicine.ParentID)
                {
                    throw new UnauthorizedAccessException("Phụ huynh không có quyền thay đổi trạng thái đơn thuốc.");
                }

                var previousStatus = medicine.Status;
                medicine.Status = changeStatusDto.NewStatus;



                var history = new MedicineHistory
                {

                    MedicineID = medicineId,
                    ModifiedBy = modifiedBy,
                    ChangeDescription = changeStatusDto.ChangeDescription,
                    ModifiedAt = DateTime.UtcNow.AddHours(7),
                    PreviousStatus = previousStatus,
                    NewStatus = changeStatusDto.NewStatus
                };

                await _medicineRepository.AddHistoryAsync(history);
                await _medicineRepository.UpdateMedicineAsync(medicine);

                await _notificationService.MedicineNotification(medicine, $"Trạng thái đơn thuốc đã được cập nhật thành '{changeStatusDto.NewStatus}'.");

                return medicine;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi thay đổi trạng thái đơn thuốc.", ex);
            }
        }

        public async Task AddMedicinePhotoAsync(ImageUpload fileDto, string uploadedBy)
        {
            try
            {
                var medicine = await _medicineRepository.GetMedicineByIdAsync(fileDto.MedicineID);
                if (medicine == null)
                {
                    throw new Exception("Không tìm thấy đơn thuốc.");
                }

                //var imageResponse = await _filesService.UploadImageAsync(fileDto.File);

                //var file = new Files
                //{
                //    FileID = imageResponse.Id,
                //    FileName = fileDto.File.FileName,
                //    FileType = "Image",
                //    FileLink = imageResponse.Url,
                //    UploadDate = imageResponse.UploadedAt,
                //    MedicineID = fileDto.MedicineID
                //};

                //await _filesService.AddFileAsync(file);

              

                var history = new MedicineHistory
                {
    
                    MedicineID = fileDto.MedicineID,
                    ModifiedBy = uploadedBy,
                    ChangeDescription = $"Đã tải lên ảnh: {fileDto.File.FileName}",
                    ModifiedAt = DateTime.UtcNow.AddHours(7),
                    PreviousStatus = medicine.Status,
                    NewStatus = medicine.Status
                };
                await _medicineRepository.AddHistoryAsync(history);

                //await _notificationService.MedicineNotification(medicine, $"Ảnh mới được tải lên cho đơn thuốc: {fileDto.File.FileName}");

            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi tải lên ảnh đơn thuốc.", ex);
            }
        }

        public async Task<List<MedicineHistory>> GetMedicineHistoryAsync(string medicineId)
        {
            return await _medicineRepository.GetMedicineHistoryAsync(medicineId);
        }
    }
}

