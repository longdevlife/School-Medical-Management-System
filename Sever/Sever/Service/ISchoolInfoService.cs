using Microsoft.EntityFrameworkCore;
using Sever.DTO.SchoolInfo;
using Sever.Model;
using Sever.Repository;

namespace Sever.Service
{
    public interface ISchoolInfoService
    {
        Task<SchoolInfo> GetSchoolInfoAsync();
        Task<bool> UpdateSchoolInfoAsync(SchoolInfoUpdate schoolInfo);
    }

    public class SchoolInfoService : ISchoolInfoService
    {
        private readonly ISchoolInfoRepository _repository;
        private readonly IFilesService _filesService;
        public SchoolInfoService(ISchoolInfoRepository repository, IFilesService filesService)
        {
            _repository = repository;
            _filesService = filesService;
        }
        public async Task<SchoolInfo> GetSchoolInfoAsync()
        {
            var school = await _repository.GetSchoolInfoAsync();
            if(school == null)
            {
                throw new Exception("Không tìm thấy thông tin trường học");
            }
            return new SchoolInfo
            {
                Name = school.Name,
                Address = school.Address,
                Hotline = school.Hotline,
                Email = school.Email,
                Logo = school.Logo
            };
        }
        public async Task<bool> UpdateSchoolInfoAsync(SchoolInfoUpdate schoolInfo)
        {
            var school = await _repository.GetSchoolInfoAsync();
            
            if (school != null)
            {
                if(school.Logo != null)
                {
                    var UpdatedLogo = await _filesService.UploadSchoolLogoByAsync(schoolInfo.Logo, schoolInfo.SchoolID);
                    school.Logo = UpdatedLogo.Url;
                }
               if(schoolInfo.Name != null)
                {
                    school.Name = schoolInfo.Name;
                }
                if(schoolInfo.Address != null)
                {
                    school.Address = schoolInfo.Address;
                }
                if(schoolInfo.Hotline != null)
                {
                    school.Hotline = schoolInfo.Hotline;
                }
                if(schoolInfo.Email != null)
                {
                    school.Email = schoolInfo.Email;
                }
                return await _repository.UpdateSchoolInfoAsync(school);
            }
            return false;
        }
    }
}
