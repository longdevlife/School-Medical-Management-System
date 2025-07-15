using Sever.Context;
using Sever.DTO.HealthCheckUp;
using Sever.DTO.Vaccination;
using Sever.Model;
using Sever.Repository;
using System.Reflection.PortableExecutable;
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
        Task<List<VaccineReponse>> GetVaccineByStudentIDAsync(string studentId);
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
        private readonly IEmailService _emailService;

        public VaccinationService(IVaccinationRepository vaccinationRepository,
                                   IStudentProfileRepository studentProfileRepository,
                                   INotificationService notificationService,
                                   IUserService userService,
                                   IEmailService emailService)
        {
            _vaccinationRepository = vaccinationRepository;
            _studentProfileRepository = studentProfileRepository;
            _notificationService = notificationService;
            _userService = userService;
            _emailService = emailService;
        }

        public async Task<VaccinationRecord> CreateVaccinationRecordByStudentIDAsync(CreateVaccination dto, string userName)
        {
            var nurse = await _userService.GetUserAsyc(userName);
            var userId = nurse.UserID;

            string newId = await _vaccinationRepository.GetCurrentVaccinationRecordID();
            var student = await _studentProfileRepository.GetStudentProfileByStudentId(dto.StudentID);

            if (student == null)
                throw new Exception("Không tìm thấy học sinh.");

            if (student.Parent == null)
                throw new Exception("Không tìm thấy thông tin phụ huynh của học sinh.");

            var record = new VaccinationRecord
            {
                RecordID = newId,
                StudentID = dto.StudentID,
                VaccineID = dto.VaccineID,
                Dose = dto.Dose,
                Notes = dto.Notes,
                NurseID = userId,
                VaccinatedAt = dto.VaccinatedAt,
                Status = "Chờ xác nhận",
                DateTime = DateTime.UtcNow.AddHours(7),
            };

            await _vaccinationRepository.CreateVaccinationAsync(record);
            await _notificationService.SendVaccinationNotificationAsync(student, record.VaccinatedAt);

            var parent = await _userService.GetUserByIdAsyc(student.Parent.UserID);
            var vaccine = await _vaccinationRepository.GetVaccineByIdAsync(dto.VaccineID);

            if (vaccine == null)
                throw new Exception("Không tìm thấy thông tin vaccine.");

            string message = $@"
        <p>Kính gửi Quý phụ huynh,</p>

        <p>Nhà trường xin thông báo lịch tiêm vaccine dành cho học sinh như sau:</p>

        <ul>
            <li><b>Họ và tên học sinh:</b> {student.StudentName}</li>
            <li><b>Lớp:</b> {student.Class}</li>
            <li><b>Tên vaccine:</b> {vaccine.VaccineName}</li>
            <li><b>Thời gian tiêm:</b> {record.DateTime:HH:mm} {(record.DateTime.Hour < 12 ? "sáng" : "chiều")}, ngày <b>{record.DateTime:dd/MM/yyyy}</b></li>
            <li><b>Địa điểm:</b> Phòng Y tế – Trường Tiểu học ABC</li>
        </ul>

        <p>Việc tiêm vaccine nhằm tăng cường sức khỏe và phòng ngừa bệnh tật cho học sinh. Nhà trường kính mong quý phụ huynh quan tâm và phối hợp để học sinh được tiêm đúng lịch.</p>

        <p>Quý phụ huynh vui lòng đăng nhập vào hệ thống để xác nhận đồng ý hoặc từ chối tiêm vaccine cho học sinh.</p>

        <br>
        <p>Trân trọng,</p>
        <p><b>Ban Y tế Trường học</b></p>
    ";

            await _emailService.SendEmailAsync(parent.Email, "Thông báo xác nhận tiêm chủng", message);
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
                        Status = "Chờ xác nhận",
                    };
                    await _vaccinationRepository.CreateVaccinationAsync(record);
                    await _notificationService.SendVaccinationNotificationAsync(student, record.VaccinatedAt);
                    var parent = await _userService.GetUserByIdAsyc(student.Parent.UserID);
                    var vaccine = await _vaccinationRepository.GetVaccineByIdAsync(dto.VaccineID);
                    string message = $@"
                                    <p>Kính gửi Quý phụ huynh,</p>

                                    <p>Nhà trường xin thông báo lịch tiêm vaccine dành cho học sinh như sau:</p>
                                    <ul>
                                        <li><b>Họ và tên học sinh:</b> {student.StudentName}</li>
                                        <li><b>Lớp:</b> {student.Class}</li>
                                        <li><b>Tên vaccine:</b> {vaccine.VaccineName}</li>
                                        <li><b>Thời gian tiêm:</b> {record.DateTime:HH:mm} {(record.DateTime.Hour < 12 ? "sáng" : "chiều")}, ngày <b>{record.DateTime:dd/MM/yyyy}</b></li>
                                        <li><b>Địa điểm:</b> Phòng Y tế – Trường Tiểu học ABC</li>
                                    </ul>
                                    <p>Việc tiêm vaccine nhằm tăng cường sức khỏe và phòng ngừa bệnh tật cho học sinh. Nhà trường kính mong quý phụ huynh quan tâm và phối hợp để học sinh được tiêm đúng lịch.</p>
                                    <p>Quý phụ huynh vui lòng đăng nhập vào hệ thống để xác nhận đồng ý hoặc từ chối tiêm vaccine cho học sinh.</p>
                                    <br>
                                    <p>Trân trọng,</p>
                                    <p><b>Ban Y tế Trường học</b></p>
                                    ";
                    await _emailService.SendEmailAsync(parent.Email, "Thông báo xác nhận tiêm chủng", message);
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


            update.DateTime = DateTime.UtcNow;
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

            var parent = await _userService.GetUserByIdAsyc(student.Parent.UserID);
            var vaccine = await _vaccinationRepository.GetVaccineByIdAsync(update.VaccineID);

            string message = $@"
                            <p>Kính gửi Quý phụ huynh,</p>

                            <p>Nhà trường xin thông báo rằng học sinh sau đây đã hoàn tất việc tiêm vaccine theo lịch trình:</p>

                            <ul>
                                <li><b>Họ và tên học sinh:</b> {student.StudentName}</li>
                                <li><b>Lớp:</b> {student.Class}</li>
                                <li><b>Tên vaccine:</b> {update.Vaccine.VaccineName}</li>
                                <li><b>Thời gian tiêm:</b> {update.DateTime:HH:mm} {(update.DateTime.Hour < 12 ? "sáng" : "chiều")}, ngày <b>{update.DateTime:dd/MM/yyyy}</b></li>
                                <li><b>Người tiêm:</b> {nurse.Name}</li>
                            </ul>

                            <p>Việc tiêm chủng đã được thực hiện đúng quy trình y tế và theo dõi sức khỏe học sinh sau tiêm được đảm bảo.</p>

                            <p>Thông tin chi tiết đã được cập nhật trên hệ thống quản lý y tế học đường.</p>

                            <br>
                            <p>Trân trọng,</p>
                            <p><b>Ban Y tế Trường học</b></p>
                            ";
            await _emailService.SendEmailAsync(parent.Email, "Thông báo hoàn tất tiêm chủng", message);
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
                    VaccinatorID = e.VaccinatorID,
                    Class = e.StudentProfile?.Class,
                    StudentName = e.StudentProfile?.StudentName,
                    VaccinatorName = e.Vaccinator?.Name,
                    VaccineName = e.Vaccine?.VaccineName,
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
                    Class = e.StudentProfile?.Class,
                    StudentName = e.StudentProfile?.StudentName,
                    VaccineName = e.Vaccine?.VaccineName,
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
                    VaccinatorID = e.VaccinatorID,
                    Class = e.StudentProfile?.Class,
                    StudentName = e.StudentProfile?.StudentName,
                    VaccineName = e.Vaccine?.VaccineName,
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
                    VaccinatorID = e.VaccinatorID,
                    Class = e.StudentProfile?.Class,
                    StudentName = e.StudentProfile?.StudentName,
                    VaccineName = e.Vaccine?.VaccineName,
                });
            }
            return responses;
        }

        public async Task<List<VaccineReponse>> GetVaccineByStudentIDAsync(string studentId)
        {
            var vaccineRecords = await _vaccinationRepository.GetVaccineByStudentIdAsync(studentId);

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
                    VaccinatorID = e.VaccinatorID,
                    Class = e.StudentProfile?.Class,
                    StudentName = e.StudentProfile?.StudentName,
                    VaccinatorName = e.Vaccinator?.Name,
                    VaccineName = e.Vaccine?.VaccineName,
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
                VaccinatorID = e.VaccinatorID,
                Class = e.StudentProfile?.Class,
                StudentName = e.StudentProfile?.StudentName,
                VaccinatorName = e.Vaccinator?.Name,
                VaccineName = e.Vaccine?.VaccineName,
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
