IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [ConfigSystem] (
    [ConfigID] nvarchar(450) NOT NULL,
    [value] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [DateTimeUpdate] datetime2 NOT NULL,
    CONSTRAINT [PK_ConfigSystem] PRIMARY KEY ([ConfigID])
);

CREATE TABLE [EventType] (
    [EventTypeID] nvarchar(450) NOT NULL,
    [EventTypeName] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_EventType] PRIMARY KEY ([EventTypeID])
);

CREATE TABLE [Form] (
    [FormID] nvarchar(450) NOT NULL,
    [FormName] nvarchar(max) NOT NULL,
    [Link] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    CONSTRAINT [PK_Form] PRIMARY KEY ([FormID])
);

CREATE TABLE [Role] (
    [RoleID] nvarchar(450) NOT NULL,
    [RoleName] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Role] PRIMARY KEY ([RoleID])
);

CREATE TABLE [SchoolInfo] (
    [SchoolID] nvarchar(450) NOT NULL,
    [Logo] varbinary(max) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [Hotline] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_SchoolInfo] PRIMARY KEY ([SchoolID])
);

CREATE TABLE [Users] (
    [UserID] nvarchar(450) NOT NULL,
    [UserName] nvarchar(450) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Name] nvarchar(max) NULL,
    [Email] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [RoleID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserID]),
    CONSTRAINT [FK_Users_Role_RoleID] FOREIGN KEY ([RoleID]) REFERENCES [Role] ([RoleID]) ON DELETE CASCADE
);

CREATE TABLE [PolicyAndTerm] (
    [Id] int NOT NULL IDENTITY,
    [titile] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [SchoolID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_PolicyAndTerm] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PolicyAndTerm_SchoolInfo_SchoolID] FOREIGN KEY ([SchoolID]) REFERENCES [SchoolInfo] ([SchoolID]) ON DELETE CASCADE
);

CREATE TABLE [MedicalEvent] (
    [MedicalEventID] nvarchar(450) NOT NULL,
    [EventDateTime] datetime2 NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [ActionTaken] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NULL,
    [EventTypeID] nvarchar(450) NOT NULL,
    [NurseID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_MedicalEvent] PRIMARY KEY ([MedicalEventID]),
    CONSTRAINT [FK_MedicalEvent_EventType_EventTypeID] FOREIGN KEY ([EventTypeID]) REFERENCES [EventType] ([EventTypeID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_MedicalEvent_Users_NurseID] FOREIGN KEY ([NurseID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);

CREATE TABLE [Medicine] (
    [MedicineID] nvarchar(450) NOT NULL,
    [MedicineName] nvarchar(max) NOT NULL,
    [Quantity] nvarchar(max) NOT NULL,
    [Dosage] nvarchar(max) NOT NULL,
    [Instructions] nvarchar(max) NOT NULL,
    [SentDate] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NULL,
    [ParentID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Medicine] PRIMARY KEY ([MedicineID]),
    CONSTRAINT [FK_Medicine_Users_ParentID] FOREIGN KEY ([ParentID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);

CREATE TABLE [News] (
    [NewsID] nvarchar(450) NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [DateTime] datetime2 NOT NULL,
    [Summary] nvarchar(max) NOT NULL,
    [Author] nvarchar(max) NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Status] tinyint NOT NULL,
    [UserID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_News] PRIMARY KEY ([NewsID]),
    CONSTRAINT [FK_News_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);

CREATE TABLE [Notify] (
    [FormID] nvarchar(450) NOT NULL,
    [UserID] nvarchar(450) NOT NULL,
    [NotifyName] nvarchar(max) NOT NULL,
    [DateTime] date NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Notify] PRIMARY KEY ([UserID], [FormID]),
    CONSTRAINT [FK_Notify_Form_FormID] FOREIGN KEY ([FormID]) REFERENCES [Form] ([FormID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Notify_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);

CREATE TABLE [RefreshToken] (
    [Id] int NOT NULL IDENTITY,
    [Token] nvarchar(max) NOT NULL,
    [ExpiryDate] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_RefreshToken] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RefreshToken_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);

CREATE TABLE [StudentProfile] (
    [StudentID] nvarchar(450) NOT NULL,
    [StudentName] nvarchar(max) NOT NULL,
    [RelationName] nvarchar(max) NOT NULL,
    [Nationality] nvarchar(max) NOT NULL,
    [Ethnicity] nvarchar(max) NOT NULL,
    [Birthday] datetime2 NOT NULL,
    [Sex] nvarchar(max) NOT NULL,
    [Location] nvarchar(max) NOT NULL,
    [ParentID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_StudentProfile] PRIMARY KEY ([StudentID]),
    CONSTRAINT [FK_StudentProfile_Users_ParentID] FOREIGN KEY ([ParentID]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);

CREATE TABLE [Vaccine] (
    [VaccineID] nvarchar(450) NOT NULL,
    [VaccineName] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [UserID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Vaccine] PRIMARY KEY ([VaccineID]),
    CONSTRAINT [FK_Vaccine_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);

CREATE TABLE [Files] (
    [FileID] nvarchar(450) NOT NULL,
    [FileName] nvarchar(max) NOT NULL,
    [FileData] varbinary(max) NOT NULL,
    [UploadDate] nvarchar(max) NOT NULL,
    [MedicalEventID] nvarchar(450) NULL,
    [NewsID] nvarchar(450) NULL,
    [SchoolID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Files] PRIMARY KEY ([FileID]),
    CONSTRAINT [FK_Files_MedicalEvent_MedicalEventID] FOREIGN KEY ([MedicalEventID]) REFERENCES [MedicalEvent] ([MedicalEventID]),
    CONSTRAINT [FK_Files_News_NewsID] FOREIGN KEY ([NewsID]) REFERENCES [News] ([NewsID]),
    CONSTRAINT [FK_Files_SchoolInfo_SchoolID] FOREIGN KEY ([SchoolID]) REFERENCES [SchoolInfo] ([SchoolID]) ON DELETE CASCADE
);

CREATE TABLE [HealthCheckUp] (
    [HealthCheckUpID] nvarchar(450) NOT NULL,
    [CheckDate] datetime2 NOT NULL,
    [Height] real NOT NULL,
    [Weight] real NOT NULL,
    [BMI] real NOT NULL,
    [VisionLeft] int NOT NULL,
    [VisionRight] int NOT NULL,
    [BloodPressure] real NOT NULL,
    [Dental] nvarchar(max) NOT NULL,
    [Skin] nvarchar(max) NOT NULL,
    [Hearing] nvarchar(max) NOT NULL,
    [Respiration] nvarchar(max) NOT NULL,
    [Ardiovascular] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NULL,
    [CheckerID] nvarchar(450) NOT NULL,
    [ParentID] nvarchar(450) NOT NULL,
    [StudentID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_HealthCheckUp] PRIMARY KEY ([HealthCheckUpID]),
    CONSTRAINT [FK_HealthCheckUp_StudentProfile_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [StudentProfile] ([StudentID]) ON DELETE CASCADE,
    CONSTRAINT [FK_HealthCheckUp_Users_CheckerID] FOREIGN KEY ([CheckerID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_HealthCheckUp_Users_ParentID] FOREIGN KEY ([ParentID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);

CREATE TABLE [HealthProfile] (
    [HealthProfileID] nvarchar(450) NOT NULL,
    [AllergyHistory] nvarchar(max) NULL,
    [ChronicDiseases] nvarchar(max) NULL,
    [PastSurgeries] tinyint NULL,
    [SurgicalCause] nvarchar(max) NULL,
    [Disabilities] nvarchar(max) NULL,
    [Height] nvarchar(max) NULL,
    [VisionLeft] nvarchar(max) NULL,
    [VisionRight] nvarchar(max) NULL,
    [ToothDecay] nvarchar(max) NULL,
    [OtheHealthIssues] nvarchar(max) NULL,
    [StudentID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_HealthProfile] PRIMARY KEY ([HealthProfileID]),
    CONSTRAINT [FK_HealthProfile_StudentProfile_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [StudentProfile] ([StudentID]) ON DELETE CASCADE
);

CREATE TABLE [MedicalEventDetail] (
    [MedicalEventID] nvarchar(450) NOT NULL,
    [StudentID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_MedicalEventDetail] PRIMARY KEY ([MedicalEventID], [StudentID]),
    CONSTRAINT [FK_MedicalEventDetail_MedicalEvent_MedicalEventID] FOREIGN KEY ([MedicalEventID]) REFERENCES [MedicalEvent] ([MedicalEventID]) ON DELETE CASCADE,
    CONSTRAINT [FK_MedicalEventDetail_StudentProfile_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [StudentProfile] ([StudentID]) ON DELETE NO ACTION
);

CREATE TABLE [VaccinationRecord] (
    [RecordID] nvarchar(450) NOT NULL,
    [Dose] int NOT NULL,
    [DateTime] datetime2 NOT NULL,
    [Notes] nvarchar(max) NULL,
    [StudentID] nvarchar(450) NOT NULL,
    [VaccinatorID] nvarchar(450) NOT NULL,
    [VaccineID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_VaccinationRecord] PRIMARY KEY ([RecordID]),
    CONSTRAINT [FK_VaccinationRecord_StudentProfile_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [StudentProfile] ([StudentID]) ON DELETE CASCADE,
    CONSTRAINT [FK_VaccinationRecord_Users_VaccinatorID] FOREIGN KEY ([VaccinatorID]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_VaccinationRecord_Vaccine_VaccineID] FOREIGN KEY ([VaccineID]) REFERENCES [Vaccine] ([VaccineID]) ON DELETE NO ACTION
);

CREATE TABLE [Appointment] (
    [AppointmentID] nvarchar(450) NOT NULL,
    [DateTime] datetime2 NOT NULL,
    [Location] nvarchar(max) NOT NULL,
    [Reason] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NULL,
    [HealthCheckUpID] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Appointment] PRIMARY KEY ([AppointmentID]),
    CONSTRAINT [FK_Appointment_HealthCheckUp_HealthCheckUpID] FOREIGN KEY ([HealthCheckUpID]) REFERENCES [HealthCheckUp] ([HealthCheckUpID]) ON DELETE CASCADE
);

CREATE INDEX [IX_Appointment_HealthCheckUpID] ON [Appointment] ([HealthCheckUpID]);

CREATE INDEX [IX_Files_MedicalEventID] ON [Files] ([MedicalEventID]);

CREATE INDEX [IX_Files_NewsID] ON [Files] ([NewsID]);

CREATE INDEX [IX_Files_SchoolID] ON [Files] ([SchoolID]);

CREATE INDEX [IX_HealthCheckUp_CheckerID] ON [HealthCheckUp] ([CheckerID]);

CREATE INDEX [IX_HealthCheckUp_ParentID] ON [HealthCheckUp] ([ParentID]);

CREATE INDEX [IX_HealthCheckUp_StudentID] ON [HealthCheckUp] ([StudentID]);

CREATE INDEX [IX_HealthProfile_StudentID] ON [HealthProfile] ([StudentID]);

CREATE INDEX [IX_MedicalEvent_EventTypeID] ON [MedicalEvent] ([EventTypeID]);

CREATE INDEX [IX_MedicalEvent_NurseID] ON [MedicalEvent] ([NurseID]);

CREATE INDEX [IX_MedicalEventDetail_StudentID] ON [MedicalEventDetail] ([StudentID]);

CREATE INDEX [IX_Medicine_ParentID] ON [Medicine] ([ParentID]);

CREATE INDEX [IX_News_UserID] ON [News] ([UserID]);

CREATE INDEX [IX_Notify_FormID] ON [Notify] ([FormID]);

CREATE INDEX [IX_PolicyAndTerm_SchoolID] ON [PolicyAndTerm] ([SchoolID]);

CREATE INDEX [IX_RefreshToken_UserId] ON [RefreshToken] ([UserId]);

CREATE INDEX [IX_StudentProfile_ParentID] ON [StudentProfile] ([ParentID]);

CREATE INDEX [IX_Users_RoleID] ON [Users] ([RoleID]);

CREATE UNIQUE INDEX [IX_Users_UserName] ON [Users] ([UserName]);

CREATE INDEX [IX_VaccinationRecord_StudentID] ON [VaccinationRecord] ([StudentID]);

CREATE INDEX [IX_VaccinationRecord_VaccinatorID] ON [VaccinationRecord] ([VaccinatorID]);

CREATE INDEX [IX_VaccinationRecord_VaccineID] ON [VaccinationRecord] ([VaccineID]);

CREATE INDEX [IX_Vaccine_UserID] ON [Vaccine] ([UserID]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250530055947_init', N'9.0.5');

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250607101039_SomeName', N'9.0.5');

COMMIT;
GO

