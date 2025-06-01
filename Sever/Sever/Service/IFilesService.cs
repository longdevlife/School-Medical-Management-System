using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Sever.DTO.File;
using Sever.Model;
using Sever.Repository;
using static System.Net.Mime.MediaTypeNames;

namespace Sever.Service
{
    public interface IFilesService
    {
        Task<ImageResponse> UploadImageAsync(IFormFile file);
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
    }
}
