﻿namespace Sever.DTO.Authentication
{
    public class ResetPasswordRequest
    {
        public string Token { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}
