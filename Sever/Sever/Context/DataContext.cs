using Microsoft.EntityFrameworkCore;
using Sever.Model;

namespace Sever.Context
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        #region Entity Sets
        public DbSet<Appointment> Appointment { get; set; }
        public DbSet<ConfigSystem> ConfigSystem { get; set; }
        public DbSet<EventType> EventType { get; set; }
        public DbSet<Files> Files { get; set; }
        public DbSet<Form> Form { get; set; }
        public DbSet<HealthCheckUp> HealthCheckUp { get; set; }
        public DbSet<HealthProfile> HealthProfile { get; set; }
        public DbSet<MedicalEvent> MedicalEvent { get; set; }
        public DbSet<Medicine> Medicine { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Notify> Notify { get; set; }
        public DbSet<PolicyAndTerm> PolicyAndTerm { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<SchoolInfo> SchoolInfo { get; set; }
        public DbSet<StudentProfile> StudentProfile { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<VaccinationRecord> VaccinationRecord { get; set; }
        public DbSet<Vaccine> Vaccine { get; set; }

        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Notify
            modelBuilder.Entity<Notify>()
                .HasKey(n => new { n.UserID, n.FormID });

            modelBuilder.Entity<Notify>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notify)
                .HasForeignKey(n => n.UserID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Notify>()
                .HasOne(n => n.Form)
                .WithMany(f => f.Notify)
                .HasForeignKey(n => n.FormID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Notify>()
                .Property(n => n.DateTime)
                .HasColumnType("date");
            #endregion

            #region Appointment
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.MedicalSpecilist)
                .WithMany(u => u.MedicalAppointments)
                .HasForeignKey(a => a.MedicalSpecilistID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Parent)
                .WithMany(u => u.ParentAppointments)
                .HasForeignKey(a => a.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.StudentProfile)
                .WithMany(s => s.Appointment) 
                .HasForeignKey(a => a.StudentID)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region MedicalEvent
            modelBuilder.Entity<MedicalEvent>()
                .HasOne(m => m.Nurse)
                .WithMany(u => u.MedicalEvent)
                .HasForeignKey(m => m.NurseID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicalEvent>()
                .HasOne(m => m.StudentProfile)
                .WithMany(s => s.MedicalEvent)
                .HasForeignKey(m => m.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MedicalEvent>()
                .HasOne(m => m.EventType)
                .WithMany(e => e.MedicalEvent)
                .HasForeignKey(m => m.EventTypeID)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region Medicine
            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.Parent)
                .WithMany(u => u.Medicine)
                .HasForeignKey(m => m.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.StudentProfile)
                .WithMany(s => s.Medicine)
                .HasForeignKey(m => m.StudentID)
                .OnDelete(DeleteBehavior.Cascade);
            #endregion

            #region VaccinationRecord
            modelBuilder.Entity<VaccinationRecord>()
                .HasOne(vr => vr.Vaccinator)
                .WithMany(u => u.VaccinationRecord)
                .HasForeignKey(vr => vr.VaccinatorID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationRecord>()
                .HasOne(vr => vr.StudentProfile)
                .WithMany(s => s.VaccinationRecord)
                .HasForeignKey(vr => vr.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VaccinationRecord>()
                .HasOne(vr => vr.Vaccine)
                .WithMany(v => v.VaccinationRecord)
                .HasForeignKey(vr => vr.VaccineID)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region
            modelBuilder.Entity<User>()
                .HasIndex(m => m.UserName).IsUnique();
            #endregion
        }

    }
}
