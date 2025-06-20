using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Sever.Context;
using Sever.DTO.File;
using Sever.DTO.User;
using Sever.Model;
using Sever.Repository;

namespace Sever.Service
{
    public interface IFilesService
    {
        //Task<ImageResponse> UploadImageAsync(IFormFile file);
        //Task AddFileAsync(Files file);
        //Task<string?> GetLatestFileIdAsync();

        Task<ImageResponse> UploadSchoolLogoByAsync(IFormFile file, string id);
        Task<ImageResponse> UploadMedicalEventImageByAsync(IFormFile file, string id);
        Task<ImageResponse> UploadNewsImageByAsync(IFormFile file, string id);
        Task<ImageResponse> UploadMedicineImageByAsync(IFormFile file, string id);
        Task<List<CreateUserRequest>> ReadUsersFromExcelAsync(IFormFile file);
        Task<List<Files>> GetLogoBySchoolIdAsync(string id);
        Task<List<Files>> GetImageByMedicineIdAsync(string id);
        Task<List<Files>> GetImageByMedicalEventIdAsync(string id);
        Task<List<Files>> GetImageByNewsIdAsync(string id);
        Task<bool> DeleteFileAsync(string id);
    }
    public class FilesSevice : IFilesService
    {
        private readonly IFilesRepository _fileRepository;
        private readonly Cloudinary _cloudinary;
        private readonly DataContext _context;
        private readonly IUserRepository _userRepository;
        public FilesSevice(IFilesRepository repository, IConfiguration config, DataContext context, IUserRepository userRepository)
        {
            _fileRepository = repository;
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _context = context;
            _userRepository = userRepository;
        }

        public async Task<ImageResponse> UploadSchoolLogoByAsync(IFormFile file, string id)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "img"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Image upload failed");

            var image = new Files
            {
                FileName = file.FileName,
                FileType = "Image",
                FileLink = uploadResult.SecureUrl.AbsoluteUri,
                UploadDate = DateTime.UtcNow,
                IsActive = true,
                SchoolID = id
            };

            await _fileRepository.AddAsync(image);
            await _fileRepository.SaveChangesAsync();

            return new ImageResponse
            {
                Url = image.FileLink,
                UploadedAt = image.UploadDate
            };
        }

        public async Task<ImageResponse> UploadMedicalEventImageByAsync(IFormFile file, string id)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "img"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Image upload failed");

            var image = new Files
            {
                FileName = file.FileName,
                FileType = "Image",
                FileLink = uploadResult.SecureUrl.AbsoluteUri,
                UploadDate = DateTime.UtcNow,
                IsActive = true,
                MedicalEventID = id
            };

            await _fileRepository.AddAsync(image);
            await _fileRepository.SaveChangesAsync();

            return new ImageResponse
            {
                Url = image.FileLink,
                UploadedAt = image.UploadDate
            };
        }

        public async Task<ImageResponse> UploadNewsImageByAsync(IFormFile file, string id)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "img"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Image upload failed");

            var image = new Files
            {
                FileName = file.FileName,
                FileType = "Image",
                FileLink = uploadResult.SecureUrl.AbsoluteUri,
                UploadDate = DateTime.UtcNow,
                IsActive = true,
                NewsID = id
            };

            await _fileRepository.AddAsync(image);
            await _fileRepository.SaveChangesAsync();

            return new ImageResponse
            {
                Url = image.FileLink,
                UploadedAt = image.UploadDate
            };
        }

        public async Task<ImageResponse> UploadMedicineImageByAsync(IFormFile file, string id)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "img"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Image upload failed");

            var image = new Files
            {
                FileName = file.FileName,
                FileType = "Image",
                FileLink = uploadResult.SecureUrl.AbsoluteUri,
                UploadDate = DateTime.UtcNow,
                IsActive = true,
                MedicineID = id
            };

            await _fileRepository.AddAsync(image);
            await _fileRepository.SaveChangesAsync();

            return new ImageResponse
            {
                Url = image.FileLink,
                UploadedAt = image.UploadDate
            };
        }

        public async Task<List<CreateUserRequest>> ReadUsersFromExcelAsync(IFormFile file)
        {
            ExcelPackage.License.SetNonCommercialPersonal("SchoolMedicalManagement");

            var users = new List<CreateUserRequest>();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];

            int rowCount = worksheet.Dimension.Rows;

            for (int row = 2; row <= rowCount; row++)
            {
                var user = new CreateUserRequest
                {
                    UserName = worksheet.Cells[row, 1].Text.Trim(),
                    Password = worksheet.Cells[row, 2].Text.Trim(),
                    Name = worksheet.Cells[row, 3].Text?.Trim(),
                    Email = worksheet.Cells[row, 4].Text?.Trim(),
                    Phone = worksheet.Cells[row, 5].Text?.Trim(),
                    RoleID = worksheet.Cells[row, 6].Text.Trim()
                };

                if (!string.IsNullOrEmpty(user.UserName) && !string.IsNullOrEmpty(user.Password))
                {
                    users.Add(user);
                }
            }

            return users;
        }

        public int RoleIdByRoleName(string roleName)
        {
            return roleName switch
            {
                "Admin" => 4,
                "Manager" => 3,
                "SchoolNurse" => 2,
                "Parent" => 1,
                _ => throw new ArgumentException("Invalid role name")
            };
        }

        public async Task<List<Files>> GetLogoBySchoolIdAsync(string id)
        {
            var list = await _fileRepository.GetLogoBySchoolIdAsync(id);
            if (list == null || list.Count == 0)
            {
                throw new ArgumentException("Tải file từ repository thất bại");
            }
            return list;
        }

        public async Task<List<Files>> GetImageByMedicineIdAsync(string id)
        {
            var list = await _fileRepository.GetImageByMedicineIdAsync(id);
            if (list == null || list.Count == 0)
            {
                throw new ArgumentException("Tải file từ repository thất bại");
            }
            return list;
        }

        public async Task<List<Files>> GetImageByMedicalEventIdAsync(string id)
        {
            var list = await _fileRepository.GetImageByMedicalEventIdAsync(id);
            if (list == null || list.Count == 0)
            {
                throw new ArgumentException("Tải file từ repository thất bại");
            }
            return list;
        }

        public async Task<List<Files>> GetImageByNewsIdAsync(string id)
        {
            var list = await _fileRepository.GetImageByNewsIdAsync(id);
            if (list == null || list.Count == 0)
            {
                throw new ArgumentException("Tải file từ repository thất bại");
            }
            return list;
        }

        public async Task<bool> DeleteFileAsync(string linkFile)
        {
            return await _fileRepository.DeleteAsync(linkFile);
        }


        //public async Task AddFileAsync(Files file)
        //{
        //    await _context.Files.AddAsync(file);
        //    await _context.SaveChangesAsync();
        //}
        //public async Task<string?> GetLatestFileIdAsync()
        //{
        //    return await _repository.GetLatestFileIdAsync();
        //}

    }
}
