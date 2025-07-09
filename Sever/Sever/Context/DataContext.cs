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
        public DbSet<Files> Files { get; set; }
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
        public DbSet<RefreshToken> RefreshToken { get; set; } = null!;
        public DbSet<ForgotPasswordToken> ForgotPasswordToken { get; set; } = null!;
        public DbSet<MedicalEventDetail> MedicalEventDetail { get; set; }


        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Notify
            modelBuilder.Entity<Notify>()
                .HasKey(n => new { n.NotifyID});

            modelBuilder.Entity<Notify>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notify)
                .HasForeignKey(n => n.UserID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Notify>()
                .Property(n => n.DateTime)
                .HasColumnType("date");
            #endregion

            #region Health Check Up
            modelBuilder.Entity<HealthCheckUp>()
                .HasOne(h => h.Checker)
                .WithMany(u => u.NurseHealthCheckUp)
                .HasForeignKey(h => h.CheckerID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<HealthCheckUp>()
                .HasOne(h => h.Parent)
                .WithMany(u => u.ParentHealthCheckUp)
                .HasForeignKey(h => h.ParentID)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region MedicalEvent
            modelBuilder.Entity<MedicalEvent>()
                .HasOne(m => m.Nurse)
                .WithMany(u => u.MedicalEvent)
                .HasForeignKey(m => m.NurseID)
                .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<MedicalEvent>()
            //    .HasOne(m => m.EventType)
            //    .WithMany(e => e.MedicalEvent)
            //    .HasForeignKey(m => m.EventTypeID)
            //    .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region Medicine
            modelBuilder.Entity<Medicine>()
                .HasKey(m => m.MedicineID);
            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.Parent)
                .WithMany(u => u.Medicine)
                .HasForeignKey(m => m.ParentID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Medicine>()
               .HasOne(m => m.StudentProfile)
               .WithMany()
               .HasForeignKey(m => m.StudentID)
               .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region VaccinationRecord

            modelBuilder.Entity<VaccinationRecord>()
                 .HasOne(v => v.Vaccinator)
                 .WithMany(u => u.VaccinatorVaccinationRecord)
                 .HasForeignKey(v => v.VaccinatorID)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VaccinationRecord>()
                .HasOne(v => v.Nurse)
                .WithMany(u => u.NurseVaccinationRecord)
                .HasForeignKey(v => v.NurseID)
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

            #region User
            modelBuilder.Entity<User>()
                .HasIndex(m => m.UserName).IsUnique();
            #endregion

            #region Medical Event Detail
            modelBuilder.Entity<MedicalEventDetail>()
                 .HasKey(m => new { m.MedicalEventID, m.StudentID });

            modelBuilder.Entity<MedicalEventDetail>()
                .HasOne(m => m.MedicalEvent)
                .WithMany(e => e.MedicalEventDetail)
                .HasForeignKey(m => m.MedicalEventID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MedicalEventDetail>()
                .HasOne(m => m.StudentProfile)
                .WithMany(s => s.MedicalEventDetail)
                .HasForeignKey(m => m.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion

            #region Role
            modelBuilder.Entity<Role>()
                .Property(r => r.RoleID)
                .ValueGeneratedNever();
            #endregion

            #region Files

            #endregion

        }

    }
}
