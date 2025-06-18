using System.ComponentModel.DataAnnotations;

namespace Sever.DTO.SendMedicine
{
    public class ChangeStatusDTO
    {
            [Required]
            public string NewStatus { get; set; }

            [Required]
            public string ChangeDescription { get; set; }
    }
}
