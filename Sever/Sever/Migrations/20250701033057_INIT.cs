using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sever.Migrations
{
    /// <inheritdoc />
    public partial class INIT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "SchoolInfo",
                columns: table => new
                {
                    SchoolID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogGift = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Hotline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolInfo", x => x.SchoolID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RoleID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_Users_Role_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PolicyAndTerm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    titile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SchoolID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyAndTerm", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyAndTerm_SchoolInfo_SchoolID",
                        column: x => x.SchoolID,
                        principalTable: "SchoolInfo",
                        principalColumn: "SchoolID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ForgotPasswordToken",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForgotPasswordToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForgotPasswordToken_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalEvent",
                columns: table => new
                {
                    MedicalEventID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EventDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NurseID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalEvent", x => x.MedicalEventID);
                    table.ForeignKey(
                        name: "FK_MedicalEvent_Users_NurseID",
                        column: x => x.NurseID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalEvent_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    NewsID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_News", x => x.NewsID);
                    table.ForeignKey(
                        name: "FK_News_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notify",
                columns: table => new
                {
                    NotifyID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NotifyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateTime = table.Column<DateTime>(type: "date", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notify", x => x.NotifyID);
                    table.ForeignKey(
                        name: "FK_Notify_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshToken_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProfile",
                columns: table => new
                {
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StudentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Class = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StudentAvata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nationality = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ethnicity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Birthday = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProfile", x => x.StudentID);
                    table.ForeignKey(
                        name: "FK_StudentProfile_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vaccine",
                columns: table => new
                {
                    VaccineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VaccineName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccine", x => x.VaccineID);
                    table.ForeignKey(
                        name: "FK_Vaccine_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HealthCheckUp",
                columns: table => new
                {
                    HealthCheckUpID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CheckDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Height = table.Column<float>(type: "real", nullable: true),
                    Weight = table.Column<float>(type: "real", nullable: true),
                    BMI = table.Column<float>(type: "real", nullable: true),
                    VisionLeft = table.Column<int>(type: "int", nullable: true),
                    VisionRight = table.Column<int>(type: "int", nullable: true),
                    BloodPressure = table.Column<float>(type: "real", nullable: true),
                    Dental = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Skin = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Hearing = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Respiration = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ardiovascular = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CheckerID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthCheckUp", x => x.HealthCheckUpID);
                    table.ForeignKey(
                        name: "FK_HealthCheckUp_StudentProfile_StudentID",
                        column: x => x.StudentID,
                        principalTable: "StudentProfile",
                        principalColumn: "StudentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HealthCheckUp_Users_CheckerID",
                        column: x => x.CheckerID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthCheckUp_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HealthProfile",
                columns: table => new
                {
                    HealthProfileID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AllergyHistory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChronicDiseases = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PastSurgeries = table.Column<byte>(type: "tinyint", nullable: true),
                    SurgicalCause = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Disabilities = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Height = table.Column<float>(type: "real", nullable: true),
                    Weight = table.Column<float>(type: "real", nullable: true),
                    VisionLeft = table.Column<int>(type: "int", nullable: true),
                    VisionRight = table.Column<int>(type: "int", nullable: true),
                    ToothDecay = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OtheHealthIssues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthProfile", x => x.HealthProfileID);
                    table.ForeignKey(
                        name: "FK_HealthProfile_StudentProfile_StudentID",
                        column: x => x.StudentID,
                        principalTable: "StudentProfile",
                        principalColumn: "StudentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalEventDetail",
                columns: table => new
                {
                    MedicalEventID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalEventDetail", x => new { x.MedicalEventID, x.StudentID });
                    table.ForeignKey(
                        name: "FK_MedicalEventDetail_MedicalEvent_MedicalEventID",
                        column: x => x.MedicalEventID,
                        principalTable: "MedicalEvent",
                        principalColumn: "MedicalEventID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicalEventDetail_StudentProfile_StudentID",
                        column: x => x.StudentID,
                        principalTable: "StudentProfile",
                        principalColumn: "StudentID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicine",
                columns: table => new
                {
                    MedicineID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicineName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    NurseID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicine", x => x.MedicineID);
                    table.ForeignKey(
                        name: "FK_Medicine_StudentProfile_StudentID",
                        column: x => x.StudentID,
                        principalTable: "StudentProfile",
                        principalColumn: "StudentID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medicine_Users_NurseID",
                        column: x => x.NurseID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Medicine_Users_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VaccinationRecord",
                columns: table => new
                {
                    RecordID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Dose = table.Column<int>(type: "int", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VaccinatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FollowUpNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StudentID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    NurseID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    VaccineID = table.Column<int>(type: "int", nullable: false),
                    VaccinatorID = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaccinationRecord", x => x.RecordID);
                    table.ForeignKey(
                        name: "FK_VaccinationRecord_StudentProfile_StudentID",
                        column: x => x.StudentID,
                        principalTable: "StudentProfile",
                        principalColumn: "StudentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VaccinationRecord_Users_NurseID",
                        column: x => x.NurseID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VaccinationRecord_Users_VaccinatorID",
                        column: x => x.VaccinatorID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VaccinationRecord_Vaccine_VaccineID",
                        column: x => x.VaccineID,
                        principalTable: "Vaccine",
                        principalColumn: "VaccineID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointment",
                columns: table => new
                {
                    AppointmentID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HealthCheckUpID = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointment", x => x.AppointmentID);
                    table.ForeignKey(
                        name: "FK_Appointment_HealthCheckUp_HealthCheckUpID",
                        column: x => x.HealthCheckUpID,
                        principalTable: "HealthCheckUp",
                        principalColumn: "HealthCheckUpID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    FileID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileData = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    FileLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MedicalEventID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    NewsID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SchoolID = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    MedicineID = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.FileID);
                    table.ForeignKey(
                        name: "FK_Files_MedicalEvent_MedicalEventID",
                        column: x => x.MedicalEventID,
                        principalTable: "MedicalEvent",
                        principalColumn: "MedicalEventID");
                    table.ForeignKey(
                        name: "FK_Files_Medicine_MedicineID",
                        column: x => x.MedicineID,
                        principalTable: "Medicine",
                        principalColumn: "MedicineID");
                    table.ForeignKey(
                        name: "FK_Files_News_NewsID",
                        column: x => x.NewsID,
                        principalTable: "News",
                        principalColumn: "NewsID");
                    table.ForeignKey(
                        name: "FK_Files_SchoolInfo_SchoolID",
                        column: x => x.SchoolID,
                        principalTable: "SchoolInfo",
                        principalColumn: "SchoolID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointment_HealthCheckUpID",
                table: "Appointment",
                column: "HealthCheckUpID");

            migrationBuilder.CreateIndex(
                name: "IX_Files_MedicalEventID",
                table: "Files",
                column: "MedicalEventID");

            migrationBuilder.CreateIndex(
                name: "IX_Files_MedicineID",
                table: "Files",
                column: "MedicineID");

            migrationBuilder.CreateIndex(
                name: "IX_Files_NewsID",
                table: "Files",
                column: "NewsID");

            migrationBuilder.CreateIndex(
                name: "IX_Files_SchoolID",
                table: "Files",
                column: "SchoolID");

            migrationBuilder.CreateIndex(
                name: "IX_ForgotPasswordToken_UserId",
                table: "ForgotPasswordToken",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckUp_CheckerID",
                table: "HealthCheckUp",
                column: "CheckerID");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckUp_ParentID",
                table: "HealthCheckUp",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckUp_StudentID",
                table: "HealthCheckUp",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_HealthProfile_StudentID",
                table: "HealthProfile",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalEvent_NurseID",
                table: "MedicalEvent",
                column: "NurseID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalEvent_ParentID",
                table: "MedicalEvent",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalEventDetail_StudentID",
                table: "MedicalEventDetail",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_NurseID",
                table: "Medicine",
                column: "NurseID");

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_ParentID",
                table: "Medicine",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_StudentID",
                table: "Medicine",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_News_UserID",
                table: "News",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notify_UserID",
                table: "Notify",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyAndTerm_SchoolID",
                table: "PolicyAndTerm",
                column: "SchoolID");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_UserId",
                table: "RefreshToken",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfile_ParentID",
                table: "StudentProfile",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VaccinationRecord_NurseID",
                table: "VaccinationRecord",
                column: "NurseID");

            migrationBuilder.CreateIndex(
                name: "IX_VaccinationRecord_StudentID",
                table: "VaccinationRecord",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_VaccinationRecord_VaccinatorID",
                table: "VaccinationRecord",
                column: "VaccinatorID");

            migrationBuilder.CreateIndex(
                name: "IX_VaccinationRecord_VaccineID",
                table: "VaccinationRecord",
                column: "VaccineID");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccine_UserID",
                table: "Vaccine",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointment");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "ForgotPasswordToken");

            migrationBuilder.DropTable(
                name: "HealthProfile");

            migrationBuilder.DropTable(
                name: "MedicalEventDetail");

            migrationBuilder.DropTable(
                name: "Notify");

            migrationBuilder.DropTable(
                name: "PolicyAndTerm");

            migrationBuilder.DropTable(
                name: "RefreshToken");

            migrationBuilder.DropTable(
                name: "VaccinationRecord");

            migrationBuilder.DropTable(
                name: "HealthCheckUp");

            migrationBuilder.DropTable(
                name: "Medicine");

            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "MedicalEvent");

            migrationBuilder.DropTable(
                name: "SchoolInfo");

            migrationBuilder.DropTable(
                name: "Vaccine");

            migrationBuilder.DropTable(
                name: "StudentProfile");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
