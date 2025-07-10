import axiosClient from "./axiosClient";

const studentApi = {
    parent : {
        // CORRECT METHOD: GET with parentId as path parameter
        getStudentInfoByParent: (parentID) => {
            return axiosClient.get(`/admin/get-student-info-by-parentID/${parentID}`);
        },
        
        // DELETE student profile
        deleteStudentProfile: (studentId) => {
            return axiosClient.delete(`/admin/delete-student-profile/${studentId}`);
        },
        
        // UPDATE student profile with file upload
        updateStudentProfileWithFile: (formData) => {
            console.log('📤 studentApi.updateStudentProfileWithFile called with FormData');
            
            // Log FormData contents for debugging
            console.log('📤 FormData entries:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
            
            return axiosClient.put('/admin/update-student-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).catch(error => {
                console.error('❌ Update student with file API error:', error);
                if (error.response?.data?.errors) {
                    console.error('📋 Validation errors:', error.response.data.errors);
                }
                throw error;
            });
        },

        // UPDATE student profile (JSON only - no avatar change)
        updateStudentProfile: (studentData) => {
            console.log('📤 studentApi.updateStudentProfile called with:', studentData);
            
            // Always use FormData for consistency with backend API
            const formData = new FormData();
            formData.append('StudentID', studentData.StudentID);
            formData.append('StudentName', studentData.StudentName);
            formData.append('Class', studentData.Class);
            formData.append('StudentAvata', ''); // Empty string for no change
            formData.append('RelationName', studentData.RelationName);
            formData.append('Nationality', studentData.Nationality);
            formData.append('Ethnicity', studentData.Ethnicity);
            formData.append('Birthday', studentData.Birthday);
            formData.append('Sex', studentData.Sex);
            formData.append('Location', studentData.Location);
            
            console.log('📤 Sending FormData (no file):');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            
            return axiosClient.put('/admin/update-student-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).catch(error => {
                console.error('❌ Update student API error:', error);
                if (error.response?.data?.errors) {
                    console.error('📋 Validation errors:', error.response.data.errors);
                }
                throw error;
            });
        },

        //GET- lấy danh sách con của phụ huynh 
        getMyChildren: () => {
            return axiosClient.get("parent/get-student-info-by-parent");
        },
    }
};

export default studentApi;