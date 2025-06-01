using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Sever.DTO.Authentication;
using Sever.Model;
using Sever.Repository;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using static System.Net.WebRequestMethods;

namespace Sever.Service
{
    public interface IAuthService
    {
        Task<TokenResponse?> LoginAsync(LoginRequest request);
        Task<TokenResponse?> RefreshTokenAsync(string accessToken, string refreshToken);
        Task<bool> LogoutAsync(string refreshToken);
        Task<TokenResponse> AuthenticateWithGoogleAsync(string idToken);
        Task<string> SendForgotPasswordEmailAsync(string usernameOrEmail, string resetUrlBase);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly TokenService _tokenService;
        private readonly IForgotPasswordTokenRepository _forgotRepo;
        private readonly IEmailService _emailService;

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            TokenService tokenService,
            IConfiguration config,
            IEmailService emailService,
            IForgotPasswordTokenRepository forgotRepo)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _tokenService = tokenService;
            _config = config;
            _forgotRepo = forgotRepo;
            _emailService = emailService;
        }

        public async Task<TokenResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetUserByUsernameAsync(request.Username);

            if (user == null)
                return null;

            // Xác thực password
            if (request.Password != user.Password)
            {
                return null;
            }

            var accessToken = _tokenService.GenerateAccessToken(user.UserName);
            var refreshTokenString = _tokenService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                UserId = user.UserID,
                Token = refreshTokenString,
                ExpiryDate = DateTime.UtcNow.AddDays(7)
            };

            await _refreshTokenRepository.AddAsync(refreshToken);
            await _refreshTokenRepository.SaveChangesAsync();

            return new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenString
            };
        }

        public async Task<bool> LogoutAsync(string refreshToken)
        {
            var tokenEntity = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (tokenEntity == null) return false;
            await _refreshTokenRepository.DeleteAsync(tokenEntity);
            await _refreshTokenRepository.SaveChangesAsync();

            return true;

        }

        public async Task<TokenResponse?> RefreshTokenAsync(string accessToken, string refreshToken)
        {
            var username = GetUsernameFromExpiredToken(accessToken);
            if (username == null)
                return null;

            var storedRefreshToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedRefreshToken == null || storedRefreshToken.User.UserName != username || storedRefreshToken.ExpiryDate < DateTime.UtcNow)
                return null;

            // Xóa refresh token cũ
            await _refreshTokenRepository.DeleteAsync(storedRefreshToken);
            await _refreshTokenRepository.SaveChangesAsync();

            // Tạo token mới
            var newAccessToken = _tokenService.GenerateAccessToken(username);
            var newRefreshTokenString = _tokenService.GenerateRefreshToken();

            var newRefreshToken = new RefreshToken
            {
                UserId = storedRefreshToken.UserId,
                Token = newRefreshTokenString,
                ExpiryDate = DateTime.UtcNow.AddDays(7)
            };

            await _refreshTokenRepository.AddAsync(newRefreshToken);
            await _refreshTokenRepository.SaveChangesAsync();

            return new TokenResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshTokenString
            };
        }

        private string? GetUsernameFromExpiredToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secret = _config["JWT:Secretkey"];
            if (string.IsNullOrEmpty(secret))
            {
                throw new Exception("JWT SecretKey is not configured!");
            }
            var key = Encoding.UTF8.GetBytes(secret);

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);

                return principal.Identity?.Name;
            }
            catch
            {
                return null;
            }
        }
        public async Task<TokenResponse> AuthenticateWithGoogleAsync(string idToken)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["GoogleKey:ClientID"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (payload == null || string.IsNullOrEmpty(payload.Email))
            {
                throw new Exception("Invalid Google token");
            }

            var user = await _userRepository.GetByEmailAsync(payload.Email);
            if (user == null)
            {
                throw new Exception("This email has not been registered yet.");
            }

            // Tạo access + refresh token
            var accessToken = _tokenService.GenerateAccessToken(user.UserName);
            var refreshToken = _tokenService.GenerateRefreshToken();

            return new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task<string> SendForgotPasswordEmailAsync(string usernameOrEmail, string resetUrlBase)
        {
            var user = await _userRepository.GetUserByUsernameAsync(usernameOrEmail);
            if (user == null)
            {
                user = await _userRepository.GetUserByEmailAsync(usernameOrEmail);
                if (user == null)
                {
                    return null;
                }
            }
            var token = _tokenService.GenerateRefreshToken();
            var resetToken = new ForgotPasswordToken
            {
                UserId = user.UserID,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddMinutes(5)
            };

            await _forgotRepo.CreateTokenAsync(resetToken);
            await _forgotRepo.SaveChangesAsync();

            var resetLink = $"{resetUrlBase}?token={Uri.EscapeDataString(token)}";
            var subject = "Đặt lại mật khẩu";
            var body = $"Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập vào đường link sau:\n{resetLink}\nLink này sẽ hết hạn sau 5 phút.";

            await _emailService.SendEmailAsync(user.Email, subject, body);

            return token;

        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var record = await _forgotRepo.GetByTokenAsync(token);
            if (record == null || record.ExpiryDate < DateTime.UtcNow)
                return false;

            record.User.Password = newPassword;

            await _forgotRepo.DeleteAsync(record);
            await _forgotRepo.SaveChangesAsync();

            return true;

        }
    }
}
