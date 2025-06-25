//using Sever.Context;
//using Sever.DTO.HealthCheckUp;
//using Sever.DTO.Vaccination;
//using Sever.Model;
//using Sever.Repository;

//namespace Sever.Service
//{
//    public interface IVaccinationService
//    {
//        /* Nurse: 
//          1. Create studentID, Class + Notify to parent
//          2. Get studentID accept + Create schedule for vaccination
//          3. Record & Update vaccination result + Get vaccination history by studentID
//          4. Create & Update vaccine after vaccination +  Get all vaccination follow history by studentID

//         * Parent:
//          1. Get consent-form + Notify from nurse
//          2. Accept/Not Accept consent-form + Notify to nurse
//          3. Get vaccination schedule + Notify from nurse
//          4. Get vaccination history by their StudentID + Notify from nurse
//          5. Get result by their studentId + Notify from nurse
//          6. Update vaccine after vaccination + Notify to nurse // (nếu có)
//          7. Get all vaccination follow history by their studentID 
//        */

//        Task<VaccinationRecord> CreateVaccinationRecordByStudentIDAsync(CreateVaccination dto);
//        Task<bool> CreateVaccinationRecordByClassAsync(CreateHealthCheckUp newHealthCheckup);
//        Task<bool> UpdateVaccinationRecordAsync(UpdateHealthCheckUp healthCheckupUpdate);
//        Task<bool> DeleteHealthCheckupAsync(string id);
//        Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id);
//    }
//    public class VaccinationService : IVaccinationService
//    {
//        private readonly IVaccinationRepository _vaccinationRepository;
//        private readonly IStudentProfileRepository _studentProfileRepository;
//        private readonly INotificationService _notificationService;

//        public VaccinationService( IVaccinationRepository vaccinationRepository,
//                                   IStudentProfileRepository studentProfileRepository,
//                                   INotificationService notificationService)
//        {
//            _vaccinationRepository = vaccinationRepository;
//            _studentProfileRepository = studentProfileRepository;
//            _notificationService = notificationService;
//        }

//        public async Task<VaccinationRecord> CreateVaccinationRecordByStudentIDAsync(CreateVaccination dto, string)
//        {
//            if (dto == null) throw new ArgumentNullException(nameof(dto), "Không được để trống.");

//            // 1. Kiểm tra học sinh tồn tại
//            var student = await _studentProfileRepository.GetStudentProfileByParentId(dto.StudentID);
//            if (student == null) throw new Exception("Không tìm thấy học sinh.");

//            // 2. Tạo record mới
//            var record = new VaccinationRecord
//            {
//                RecordID = Guid.NewGuid().ToString(),
//                StudentID = dto.StudentID,
//                VaccineID = dto.VaccineID,
//                Dose = dto.Dose,
//                DateTime = dto.DateTime,
//                Notes = dto.Notes,
//                Status = "Chờ xác nhận"
//            };

//            // 3. Ghi vào DB
//            await _vaccinationRepository.CreateVaccinationAsync(record);

//            // 4. Gửi thông báo cho phụ huynh
//            await _notificationService.SendNotificationAsync(
//                student.ParentID,
//                $"📢 Phiếu tiêm chủng mới: Học sinh {student.FullName}, Vaccine {dto.VaccineID}, Liều {dto.Dose}. Vui lòng xác nhận."
//            );

//            return record;
//        }

//        public Task<bool> CreateVaccinationRecordByClassAsync(CreateHealthCheckUp newHealthCheckup)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> DeleteHealthCheckupAsync(string id)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<HealthCheckUp> GetHealthCheckupByIdAsync(string id)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> UpdateVaccinationRecordAsync(UpdateHealthCheckUp healthCheckupUpdate)
//        {
//            throw new NotImplementedException();
//        }
//    }

//}
