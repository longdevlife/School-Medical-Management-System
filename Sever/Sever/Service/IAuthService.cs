using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Sever.DTO;
using Sever.Model;
using Sever.Repository;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Sever.Service
{
    public interface IAuthService
    {
        Task<TokenResponse?> LoginAsync(LoginRequest request);
        Task<TokenResponse?> RefreshTokenAsync(string accessToken, string refreshToken);
        Task<bool> LogoutAsync(string refreshToken);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly TokenService _tokenService;

        public AuthService(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            TokenService tokenService)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _tokenService = tokenService;
        }

        public async Task<TokenResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetUserByUsernameAsync(request.Username);

            if (user == null)
                return null;

            // Xác thực password
           if(request.Password != user.Password)
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
            var key = Encoding.UTF8.GetBytes(_config["JWT:SecretKey"]!);

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
    }

}
