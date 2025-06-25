using Sever.Model;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sever.DTO.Vaccination
{
    public class CreateVaccination
    {
        public int VaccineID { get; set; }           
        public int Dose { get; set; }                
        public DateTime DateTime { get; set; }       
        public string? Notes { get; set; }           

        public string? StudentID { get; set; }
        public string? ClassID { get; set; }

    }
}



/*
public async Task<VaccinationRecord> CreateVaccinationRecordByStudentAsync(CreateVaccinationInfoDTO dto, string vaccinatorId)
{
    if (string.IsNullOrWhiteSpace(dto.StudentID))
        throw new ArgumentException("StudentID không được để trống.");

    var student = await _studentProfileRepository.GetStudentByIdAsync(dto.StudentID);
    if (student == null)
        throw new Exception("Không tìm thấy học sinh.");

    var record = new VaccinationRecord
    {
        RecordID = Guid.NewGuid().ToString(),
        StudentID = student.StudentID,
        VaccineID = dto.VaccineID,
        Dose = dto.Dose,
        DateTime = dto.DateTime,
        Notes = dto.Notes,
        VaccinatorID = vaccinatorId,
        Status = "PENDING"
    };

    await _vaccinationRepository.CreateVaccinationAsync(record);

    await _notificationService.SendNotificationAsync(
        student.ParentID,
        $"Bạn có đồng ý tiêm chủng cho học sinh {student.FullName}? Liều: {dto.Dose}, Vaccine ID: {dto.VaccineID}"
    );

    return record;
}.
 */ 