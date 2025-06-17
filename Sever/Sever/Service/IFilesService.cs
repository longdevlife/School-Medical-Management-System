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
        Task<ImageResponse> UploadImageAsync(IFormFile file);
        List<CreateUserRequest> GetUsersFromExcel(Stream file);
        Task AddFileAsync(Files file);
        Task<string?> GetLatestFileIdAsync();

    }
    public class FilesSevice : IFilesService
    {
        private readonly IFilesRepository _repository;
        private readonly Cloudinary _cloudinary;
        private readonly DataContext _context;

        public FilesSevice(IFilesRepository repository, IConfiguration config, DataContext context)
        {
            _repository = repository;
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _context = context;

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
            
            var latestFileId = await _repository.GetLatestFileIdAsync();
            string newFileId = "F001";

            if (!string.IsNullOrEmpty(latestFileId) && latestFileId.StartsWith("F"))
            {
                var numberPart = latestFileId.Substring(1);
                if (int.TryParse(numberPart, out int number))
                {
                    newFileId = $"F{(number + 1):D3}";
                }
            }
            var image = new Files
            {
                FileID = newFileId,
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
                "Manager" => 3,
                "SchoolNurse" => 2,
                "Parent" => 1,
                _ => throw new ArgumentException("Invalid role name")
            };
        }
        public async Task AddFileAsync(Files file)
        {
            await _context.Files.AddAsync(file);
            await _context.SaveChangesAsync();
        }
        public async Task<string?> GetLatestFileIdAsync()
        {
            return await _repository.GetLatestFileIdAsync();
        }

    }
}
