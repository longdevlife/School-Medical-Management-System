import axiosClient from "./axiosClient";

const healthCheckApi = {
  nurse: {
    // Lấy tất cả health check records
    getAll: () => {
      return axiosClient.get("nurse/get-all-health-check-up");
    },

    // Tạo yêu cầu khám sức khỏe theo lớp
    createByClass: (data) => {
      const formData = new FormData();

      if (data.classId) formData.append("classId", String(data.classId));
      if (data.dateCheckUp) formData.append("dateCheckUp", data.dateCheckUp);

      console.log("🚀 healthCheckApi.createByClass - data gửi lên:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      return axiosClient.post(
        "nurse/create-health-check-up-by-class",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },

    // Tạo health check mới
    create: (data) => {
      const formData = new FormData();

      if (data.StudentID) formData.append("StudentID", String(data.StudentID));
      if (data.CheckDate) formData.append("CheckDate", data.CheckDate);
      if (data.Height !== undefined)
        formData.append("Height", Number(data.Height));
      if (data.Weight !== undefined)
        formData.append("Weight", Number(data.Weight));
      if (data.BMI !== undefined) formData.append("BMI", Number(data.BMI));
      if (data.VisionLeft !== undefined)
        formData.append("VisionLeft", Number(data.VisionLeft));
      if (data.VisionRight !== undefined)
        formData.append("VisionRight", Number(data.VisionRight));
      if (data.BloodPressure !== undefined)
        formData.append("BloodPressure", Number(data.BloodPressure));
      if (data.Dental) formData.append("Dental", data.Dental);
      if (data.Skin) formData.append("Skin", data.Skin);
      if (data.Hearing) formData.append("Hearing", data.Hearing);
      if (data.Respiration) formData.append("Respiration", data.Respiration);
      if (data.Cardiovascular)
        formData.append("Cardiovascular", data.Cardiovascular);
      if (data.Notes) formData.append("Notes", data.Notes);
      if (data.Status) formData.append("Status", data.Status);

      // CheckerID
      if (data.CheckerID) {
        formData.append("CheckerID", String(data.CheckerID));
      } else {
        try {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const userID =
            currentUser.username ||
            currentUser.userID ||
            currentUser.id ||
            "nurse";
          formData.append("CheckerID", String(userID));
          console.log("✅ CheckerID từ localStorage:", userID);
        } catch (e) {
          formData.append("CheckerID", "nurse");
          console.log("✅ CheckerID fallback = nurse");
        }
      }

      console.log("🚀 healthCheckApi.create - data gửi lên:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      return axiosClient.post("nurse/health-check-up", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Cập nhật health check
    update: (healthCheckId, data) => {
      const updateData = {
        healthCheckId: String(healthCheckId),
        height: data.Height !== undefined ? Number(data.Height) : undefined,
        weight: data.Weight !== undefined ? Number(data.Weight) : undefined,
        bmi: data.BMI !== undefined ? Number(data.BMI) : undefined,
        visionLeft:
          data.VisionLeft !== undefined ? Number(data.VisionLeft) : undefined,
        visionRight:
          data.VisionRight !== undefined ? Number(data.VisionRight) : undefined,
        bloodPressure:
          data.BloodPressure !== undefined
            ? Number(data.BloodPressure)
            : undefined,
        dental: data.Dental || undefined,
        skin: data.Skin || undefined,
        hearing: data.Hearing || undefined,
        respiration: data.Respiration || undefined,
        ardiovascular: data.Cardiovascular || undefined,
        notes: data.Notes || undefined,
        status: data.Status || undefined,
      };

      // Loại bỏ các field undefined
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      console.log("🚀 healthCheckApi.update - healthCheckId:", healthCheckId);
      console.log("🚀 healthCheckApi.update - cleanData gửi lên:");
      console.log(JSON.stringify(cleanData, null, 2));

      return axiosClient.put("nurse/update-health-check-up", cleanData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },

    // tạo lịch hẹn khám sức khỏe
    createAppointment: (data) => {
      const appointmentData = {
        dateTime:
          data.dateTime ||
          `${data.appointmentDate}T${data.appointmentTime || "08:00"}:00.000Z`,
        location: data.location || "Phòng y tế trường",
        reason: data.reason || data.purpose || "Khám sức khỏe",
        notes: data.notes || "",
        healthCheckUpID: String(
          data.healthCheckUpID || data.healthCheckId || ""
        ),
      };

      console.log("🚀 healthCheckApi.createAppointment - data gửi lên:");
      console.log(JSON.stringify(appointmentData, null, 2));

      return axiosClient.post("nurse/create-appointment", appointmentData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },

    // Cập nhật lịch hẹn
    updateAppointment: (appointmentId, data) => {
      let actualAppointmentId = appointmentId;
      // Kiểm tra nếu appointmentId là chuỗi và bắt đầu bằng "app_"
      if (
        typeof appointmentId === "string" &&
        appointmentId.startsWith("app_")
      ) {
        actualAppointmentId = appointmentId.replace("app_", "");
      }

      const updateData = {
        appointmentID: String(actualAppointmentId),
        notes: data.notes || "",
      };

      console.log(
        "🚀 healthCheckApi.updateAppointment - appointmentID:",
        actualAppointmentId
      );
      console.log("🚀 healthCheckApi.updateAppointment - data gửi lên:");
      console.log(JSON.stringify(updateData, null, 2));

      return axiosClient.put("nurse/update-appointment", updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },

    //  Cập nhật status của health check
    updateStatus: (healthCheckId, status) => {
      const updateData = {
        healthCheckId: String(healthCheckId),
        status: String(status),
      };

      console.log(
        "🚀 healthCheckApi.updateStatus - healthCheckId:",
        healthCheckId
      );
      console.log("🚀 healthCheckApi.updateStatus - status:", status);
      console.log("🚀 healthCheckApi.updateStatus - data gửi lên:");
      console.log(JSON.stringify(updateData, null, 2));

      return axiosClient.put("nurse/update-health-check-status", updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    getAllApointment: () => {
      return axiosClient.get("nurse/get-all-appointment");
    },
  },

  parent: {
    // GET - Lấy danh sách health checkup của con theo parent ID
    getHealthCheckupsByParentId: (parentId) => {
      return axiosClient.get(
        `/parent/get-all-health-check-up-by-parent/${parentId}`
      );
    },

    // GET - Lấy thông tin students của parent để có parentID
    getStudentsByParent: () => {
      return axiosClient.get("/parent/get-student-info-by-parent");
    },

    // GET - Lấy thông tin user hiện tại để có parentId
    getCurrentUserInfo: () => {
      return axiosClient.get("/user/get-user-info");
    },

    // PUT - Xác nhận health checkup
    confirmHealthCheckup: (healthCheckupData) => {
      return axiosClient.put(
        "/parent/confirm-health-check-up",
        healthCheckupData
      );
    },

    // PUT - Từ chối health checkup
    denyHealthCheckup: (healthCheckupData) => {
      return axiosClient.put(
        "/parent/denied-health-check-up",
        healthCheckupData
      );
    },
  },
};

export default healthCheckApi;
