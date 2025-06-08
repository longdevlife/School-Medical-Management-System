using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using OfficeOpenXml;
using Sever.DTO.File;
using Sever.DTO.User;
using Sever.Model;
using Sever.Repository;
using static System.Net.Mime.MediaTypeNames;

namespace Sever.Service
{
    public interface IFilesService
    {
        Task<ImageResponse> UploadImageAsync(IFormFile file);
        List<CreateUserRequest> GetUsersFromExcel(Stream file);
    }
    public class FilesSevice : IFilesService
    {
        private readonly IFilesRepository _repository;
        private readonly Cloudinary _cloudinary;

        public FilesSevice(IFilesRepository repository, IConfiguration config)
        {
            _repository = repository;
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<ImageResponse> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "your_folder_name"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                throw new Exception("Image upload failed");

            var image = new Files
            {
                FileName = file.FileName,
                FileType = "Image",
                FileLink = uploadResult.SecureUrl.AbsoluteUri,
                UploadDate = DateTime.UtcNow
            };

            await _repository.AddAsync(image);
            await _repository.SaveChangesAsync();

            return new ImageResponse
            {
                Id = image.FileID,
                Url = image.FileLink,
                UploadedAt = image.UploadDate
            };
        }

        public  List<CreateUserRequest> GetUsersFromExcel(Stream file)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var users = new List<CreateUserRequest>();

            using var package = new ExcelPackage(file);
            var worksheet = package.Workbook.Worksheets[0];
            var rowCount = worksheet.Dimension.Rows;

            for (int row = 2; row <= rowCount; row++) 
            {
                var user = new CreateUserRequest
                {
                    UserID = worksheet.Cells[row, 1].Text,
                    UserName = worksheet.Cells[row, 2].Text,
                    Password = worksheet.Cells[row, 3].Text,
                    Name = worksheet.Cells[row, 4].Text,
                    Email = worksheet.Cells[row, 5].Text,
                    RoleID = RoleIdByRoleName(worksheet.Cells[row, 6].Text.Trim())
                };
                users.Add(user);
            }

            return users;
        }
        public int RoleIdByRoleName(string roleName)
        {
            return roleName switch
            {
                "Admin" => 4,
                "Teacher" => 3,
                "Parent" => 2,
                "Student" => 1,
                _ => throw new ArgumentException("Invalid role name")
            };
        }
    }
}
