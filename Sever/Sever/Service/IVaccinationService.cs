using Sever.Context;
using Sever.DTO.HealthCheckUp;
using Sever.DTO.Vaccination;
using Sever.Model;
using Sever.Repository;
using static Sever.Repository.IMedicineRepository;

namespace Sever.Service
{
    public interface IVaccinationService
    {
        /* Nurse: 
          1. Create studentID, Class + Notify to parent
          2. Get studentID accept + Create schedule for vaccination
          3. Record & Update vaccination result + Get vaccination history by studentID
          4. Create & Update vaccine after vaccination +  Get all vaccination follow history by studentID

         * Parent:
          1. Get consent-form + Notify from nurse
          2. Accept/Not Accept consent-form + Notify to nurse
          3. Get vaccination schedule + Notify from nurse
          4. Get vaccination history by their StudentID + Notify from nurse
          5. Get result by their studentId + Notify from nurse
          6. Update vaccine after vaccination + Notify to nurse // (nếu có)
          7. Get all vaccination follow history by their studentID 
        */

        Task<VaccinationRecord> CreateVaccinationRecordByStudentIDAsync(CreateVaccination dto, string userName);
        Task<List<VaccinationRecord>> CreateVaccinationRecordByClassIDAsync(CreateVaccination dto, string userName);
        Task<bool> UpdateVaccinationRecordAsync(UpdateVaccineDTO updateDto, string userName, string recordId);
        Task<bool> UpdateVaccinationRecordAfterAsync(UpdateVaccineAfterDTO updateDto, string userName, string recordId);
        Task<List<VaccineReponse>> GetAllVaccineRecordAsync();
        Task<bool> ConfirmVaccination(string id);
        Task<bool> DeniedVaccination(string id);
        Task<List<VaccineReponse>> GetVaccineDeniedAsync();
        Task<List<VaccineReponse>> GetVaccineConfirmAsync();
        Task<List<VaccineReponse>> GetVaccineNotResponseAsync();
        Task<List<VaccineReponse>> GetVaccineByParentUsernameAsync(string username);
        Task<int> TotalVaccine(DateTime fromDate, DateTime toDate);
        Task<int> CountConfirmVaccine(DateTime fromDate, DateTime toDate);
        Task<int> CountDeniedVaccine(DateTime fromDate, DateTime toDate);
        Task<int> CountNotResponseVaccine(DateTime fromDate, DateTime toDate);

    }
    public class VaccinationService : IVaccinationService
    {
        private readonly IVaccinationRepository _vaccinationRepository;
        private readonly IStudentProfileRepository _studentProfileRepository;
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;


        public VaccinationService(IVaccinationRepository vaccinationRepository,
                                   IStudentProfileRepository studentProfileRepository,
                                   INotificationService notificationService,
                                   IUserService userService)
        {
            _vaccinationRepository = vaccinationRepository;
            _studentProfileRepository = studentProfileRepository;
            _notificationService = notificationService;
            _userService = userService;
        }

        public async Task<VaccinationRecord> CreateVaccinationRecordByStudentIDAsync(CreateVaccination dto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            string newId = await _vaccinationRepository.GetCurrentVaccinationRecordID();
            var student = await _studentProfileRepository.GetStudentProfileByStudentId(dto.StudentID);


            var record = new VaccinationRecord
            {
                RecordID = newId,
                StudentID = dto.StudentID,
                VaccineID = dto.VaccineID,
                Dose = dto.Dose,
                Notes = dto.Notes,
                NurseID = userId,
                VaccinatedAt = dto.VaccinatedAt,
                Status = "Chờ xác nhận"
            };

            await _vaccinationRepository.CreateVaccinationAsync(record);
            await _notificationService.SendVaccinationNotificationAsync(student, record.VaccinatedAt);
            return record;
        }

        public async Task<List<VaccinationRecord>> CreateVaccinationRecordByClassIDAsync(CreateVaccination dto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            var listStudent = await _studentProfileRepository.GetStudentProfilesByClassIdAsync(dto.ClassID);
            if (listStudent == null || listStudent.Count == 0) throw new ArgumentException("Không có học sinh trong lớp đã chọn.");

            var resultList = new List<VaccinationRecord>();
            try
            {
                foreach (var student in listStudent)
                {
                    string newId = await _vaccinationRepository.GetCurrentVaccinationRecordID();
                    var record = new VaccinationRecord
                    {

                        RecordID = newId,
                        StudentID = student.StudentID,
                        VaccineID = dto.VaccineID,
                        Dose = dto.Dose,
                        Notes = dto.Notes,
                        NurseID = userId,
                        DateTime = DateTime.UtcNow.AddHours(7),
                        VaccinatedAt = dto.VaccinatedAt,
                        Status = "Chờ xác nhận"
                    };
                    await _vaccinationRepository.CreateVaccinationAsync(record);
                    await _notificationService.SendVaccinationNotificationAsync(student, record.VaccinatedAt);
                    resultList.Add(record);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi tạo hồ sơ tiêm chủng cho lớp: " + ex.Message);
            }
            return resultList;
        }

        public async Task<bool> UpdateVaccinationRecordAsync(UpdateVaccineDTO updateDto, string userName, string recordId)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            var update = await _vaccinationRepository.GetVaccineByRecordIdAsync(recordId);
            if (update == null)
            {
                throw new Exception("Không tìm thấy mã tiêm chủng.");
            }

            var student = await _studentProfileRepository.GetStudentProfileByStudentId(update.StudentID);
            if (student == null)
            {
                throw new Exception("Không tìm thấy học sinh.");
            }

            var previousStatus = update.Status;

            if (updateDto.Dose.HasValue)
                update.Dose = updateDto.Dose.Value;

            if (updateDto.VaccineID.HasValue)
                update.VaccineID = updateDto.VaccineID.Value;

            if (updateDto.VaccinatedAt.HasValue)
                update.VaccinatedAt = updateDto.VaccinatedAt;

            if (!string.IsNullOrWhiteSpace(updateDto.VaccinatorID))
                update.VaccinatorID = updateDto.VaccinatorID;

            if (!string.IsNullOrWhiteSpace(updateDto.Notes))
                update.Notes = updateDto.Notes;

            update.DateTime = DateTime.UtcNow.AddHours(7);
            update.NurseID = userId;

            var validStatuses = new List<string> { "Đã tiêm", "Chờ tiêm", "Đang theo dõi", "Từ chối", "Hoàn thành" };

            if (!string.IsNullOrWhiteSpace(updateDto.Status))
            {
                if (!validStatuses.Contains(updateDto.Status))
                    throw new Exception("Trạng thái không hợp lệ.");

                update.Status = updateDto.Status;
            }

            await _vaccinationRepository.UpdateVaccinationAsync(update);
            await _notificationService.UpdateVaccinationNotifycationAsync(student);

            return true;
        }

        public async Task<bool> UpdateVaccinationRecordAfterAsync(UpdateVaccineAfterDTO updateDto, string userName, string recordId)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            var update = await _vaccinationRepository.GetVaccineByRecordIdAsync(recordId);
            if (update == null)
            {
                throw new Exception("Không tìm thấy mã tiêm chủng.");
            }

            var student = await _studentProfileRepository.GetStudentProfileByStudentId(update.StudentID);
            if (student == null)
            {
                throw new Exception("Không tìm thấy học sinh.");
            }

            var previousStatus = update.Status;

            if (!string.IsNullOrWhiteSpace(updateDto.FollowUpNotes))
                update.FollowUpNotes = updateDto.FollowUpNotes;

            if (updateDto.FollowUpDate.HasValue)
                update.FollowUpDate = updateDto.FollowUpDate;


            update.DateTime = DateTime.UtcNow.AddHours(7);
            update.NurseID = userId;

            var validStatuses = new List<string> { "Đã tiêm", "Đang theo dõi", "Từ chối", "Hoàn thành" };

            if (!string.IsNullOrWhiteSpace(updateDto.Status))
            {
                if (!validStatuses.Contains(updateDto.Status))
                    throw new Exception("Trạng thái không hợp lệ.");

                update.Status = updateDto.Status;
            }

            await _vaccinationRepository.UpdateVaccinationAsync(update);
            await _notificationService.UpdateVaccinationNotifycationAsync(student);

            return true;
        }

        public async Task<List<VaccineReponse>> GetAllVaccineRecordAsync()
        {
            var vaccineRecords = await _vaccinationRepository.GetAllVaccinationRecordsAsync();

            List<VaccineReponse> responses = new List<VaccineReponse>();
            foreach (var e in vaccineRecords)
            {
                responses.Add(new VaccineReponse
                {
                    RecordID = e.RecordID,
                    Dose = e.Dose,
                    DateTime = e.DateTime,
                    Notes = e.Notes,
                    Status = e.Status,
                    VaccinatedAt = e.VaccinatedAt,
                    FollowUpNotes = e.FollowUpNotes,
                    FollowUpDate = e.FollowUpDate,
                    StudentID = e.StudentID,
                    NurseID = e.NurseID,
                    VaccineID = e.VaccineID,
                    VaccinatorID = e.VaccinatorID
                });
            }
            return responses;
        }

        public async Task<bool> ConfirmVaccination(string id)
        {
            var vaccine = await _vaccinationRepository.GetVaccineByRecordIdAsync(id);
            return await _vaccinationRepository.UpdateStatus(vaccine, "Đã xác nhận");
        }

        public async Task<bool> DeniedVaccination(string id)
        {
            var vaccine = await _vaccinationRepository.GetVaccineByRecordIdAsync(id);
            return await _vaccinationRepository.UpdateStatus(vaccine, "Đã từ chối");
        }

        public async Task<List<VaccineReponse>> GetVaccineDeniedAsync()
        {
            var vaccineRecords = await _vaccinationRepository.GetVaccineDeniedAsync();

            List<VaccineReponse> responses = new List<VaccineReponse>();
            foreach (var e in vaccineRecords)
            {
                responses.Add(new VaccineReponse
                {
                    RecordID = e.RecordID,
                    Dose = e.Dose,
                    DateTime = e.DateTime,
                    Notes = e.Notes,
                    Status = e.Status,
                    VaccinatedAt = e.VaccinatedAt,
                    FollowUpNotes = e.FollowUpNotes,
                    FollowUpDate = e.FollowUpDate,
                    StudentID = e.StudentID,
                    NurseID = e.NurseID,
                    VaccineID = e.VaccineID,
                    VaccinatorID = e.VaccinatorID
                });
            }
            return responses;
        }

        public async Task<List<VaccineReponse>> GetVaccineConfirmAsync()
        {
            var vaccineRecords = await _vaccinationRepository.GetVaccineConfirmdAsync();

            List<VaccineReponse> responses = new List<VaccineReponse>();
            foreach (var e in vaccineRecords)
            {
                responses.Add(new VaccineReponse
                {
                    RecordID = e.RecordID,
                    Dose = e.Dose,
                    DateTime = e.DateTime,
                    Notes = e.Notes,
                    Status = e.Status,
                    VaccinatedAt = e.VaccinatedAt,
                    FollowUpNotes = e.FollowUpNotes,
                    FollowUpDate = e.FollowUpDate,
                    StudentID = e.StudentID,
                    NurseID = e.NurseID,
                    VaccineID = e.VaccineID,
                    VaccinatorID = e.VaccinatorID
                });
            }
            return responses;
        }

        public async Task<List<VaccineReponse>> GetVaccineNotResponseAsync()
        {
            var vaccineRecords = await _vaccinationRepository.GetVaccineNotResponseAsync();

            List<VaccineReponse> responses = new List<VaccineReponse>();
            foreach (var e in vaccineRecords)
            {
                responses.Add(new VaccineReponse
                {
                    RecordID = e.RecordID,
                    Dose = e.Dose,
                    DateTime = e.DateTime,
                    Notes = e.Notes,
                    Status = e.Status,
                    VaccinatedAt = e.VaccinatedAt,
                    FollowUpNotes = e.FollowUpNotes,
                    FollowUpDate = e.FollowUpDate,
                    StudentID = e.StudentID,
                    NurseID = e.NurseID,
                    VaccineID = e.VaccineID,
                    VaccinatorID = e.VaccinatorID
                });
            }
            return responses;
        }

        public async Task<List<VaccineReponse>> GetVaccineByParentUsernameAsync(string username)
        {
            var parent = await _userService.GetUserAsyc(username);
            if (parent == null)
                throw new Exception("Không tìm thấy thông tin phụ huynh.");

            var parentId = parent.UserID;
            var students = await _studentProfileRepository.GetStudentProfileByParentId(parentId);
            if (students == null || students.Count == 0)
                throw new KeyNotFoundException("Không tìm thấy học sinh cho phụ huynh này.");

            var allVaccines = new List<VaccinationRecord>();
            foreach (var s in students)
            {
                var vaccines = await _vaccinationRepository.GetVaccineByStudentIdAsync(s.StudentID);
                allVaccines.AddRange(vaccines);
            }

            var responses = allVaccines.Select(e => new VaccineReponse
            {
                RecordID = e.RecordID,
                Dose = e.Dose,
                DateTime = e.DateTime,
                Notes = e.Notes,
                Status = e.Status,
                VaccinatedAt = e.VaccinatedAt,
                FollowUpNotes = e.FollowUpNotes,
                FollowUpDate = e.FollowUpDate,
                StudentID = e.StudentID,
                NurseID = e.NurseID,
                VaccineID = e.VaccineID,
                VaccinatorID = e.VaccinatorID
            }).ToList();

            return responses;
        }

        public async Task<int> TotalVaccine(DateTime fromDate, DateTime toDate)
        {
            return await _vaccinationRepository.TotalVaccine(fromDate, toDate);
        }

        public async Task<int> CountConfirmVaccine(DateTime fromDate, DateTime toDate)
        {
            return await _vaccinationRepository.CountConfirmVaccinesAsync(fromDate, toDate);
        }

        public async Task<int> CountDeniedVaccine(DateTime fromDate, DateTime toDate)
        {
            return await _vaccinationRepository.CountDeniedVaccinesAsync(fromDate, toDate);
        }

        public async Task<int> CountNotResponseVaccine(DateTime fromDate, DateTime toDate)
        {
            return await _vaccinationRepository.CountNotResponseVaccinesAsync(fromDate, toDate);
        }
    }
}
