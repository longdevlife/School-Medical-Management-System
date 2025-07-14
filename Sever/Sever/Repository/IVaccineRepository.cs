using Sever.Context;
using Sever.Model;

namespace Sever.Repository
{
    public interface IVaccineRepository
    {
        Vaccine GetVaccineById(int id);
    }
    public class VaccineRepository : IVaccineRepository
    {
        private readonly DataContext _context;
        public VaccineRepository(DataContext context)
        {
            _context = context;
        }
        public Vaccine GetVaccineById(int id)
        {
            return _context.Vaccine.FirstOrDefault(v => v.VaccineID == id);
        }
    }
}
