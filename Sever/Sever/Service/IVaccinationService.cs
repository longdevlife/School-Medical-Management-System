using Sever.Context;
using Sever.Model;

namespace Sever.Service
{
    public interface IVaccinationService
    {
        /* Nurse: 
          1. Create studentID, Class + Notify to parent
          2. Get studentID accept + Create schedule for vaccination
          3. Record & Update vaccination result + Get vaccination history by studentID
          4. Create & Update vaccine after vaccination +  Get all vaccination follow history by studentID

         * Parent:
          1. Get consent-form + Notify from nurse
          2. Accept/Not Accept consent-form + Notify to nurse
          3. Get vaccination schedule + Notify from nurse
          4. Get vaccination history by their StudentID + Notify from nurse
          5. Get result by their studentId + Notify from nurse
          6. Update vaccine after vaccination + Notify to nurse // (nếu có)
          7. Get all vaccination follow history by their studentID 
        */
        public class VaccinationRepository
        {
            private readonly DataContext _context;

            public VaccinationRepository(DataContext context)
            {
                _context = context;
            }

        }
    }
}
