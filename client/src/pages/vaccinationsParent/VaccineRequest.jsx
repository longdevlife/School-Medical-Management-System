import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Card,
    Tag,
    Space,
    message,
    Row,
    Col,
    Descriptions,
    Typography,
    Spin,
    Empty,
    Badge,
    Tooltip,
    Popconfirm,
    Select
} from 'antd';
import {
    EyeOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import vaccineApi from '../../api/vaccineApi';
import studentApi from '../../api/studentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const VaccineRequest = () => {
    const [vaccines, setVaccines] = useState([]);
    const [allVaccines, setAllVaccines] = useState([]); // Tất cả vaccine để tính thống kê
    const [loading, setLoading] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingVaccine, setViewingVaccine] = useState(null);

    // Student management states
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Component mount
    useEffect(() => {
        console.log('🚀 VaccineRequest component mounting...');
        fetchStudents();
    }, []);

    // Effect để tải vaccine khi selectedStudentId thay đổi
    useEffect(() => {
        if (selectedStudentId) {
            console.log('🔄 Học sinh đã thay đổi:', selectedStudentId);
            fetchVaccineData();
        }
    }, [selectedStudentId]);

    // ==================== API FUNCTIONS ====================

    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);
            console.log('🔄 Đang lấy danh sách học sinh của phụ huynh...');

            const response = await studentApi.parent.getMyChildren();
            console.log('✅ API getMyChildren response:', response);

            const studentsData = response.data || [];

            if (Array.isArray(studentsData) && studentsData.length > 0) {
                const processedStudents = studentsData.map(student => ({
                    StudentID: student.studentID || student.StudentID || student.id,
                    StudentName: student.studentName || student.StudentName || student.name || 'Học sinh',
                    StudentCode: student.studentID || student.StudentID || student.studentCode || student.id,
                    Class: student.class || student.className || student.ClassName || student.grade || student.classRoom || student.class_name || 'Chưa phân lớp',
                }));

                console.log('📋 Danh sách học sinh đã xử lý:', processedStudents);
                setStudents(processedStudents);

                // Tự động chọn học sinh đầu tiên nếu chưa chọn
                if (processedStudents.length > 0 && !selectedStudentId) {
                    console.log('🔍 Tự động chọn học sinh đầu tiên:', processedStudents[0].StudentID);
                    setSelectedStudentId(processedStudents[0].StudentID);
                }

                console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
            } else {
                console.warn('⚠️ Không có dữ liệu học sinh hoặc dữ liệu không hợp lệ:', studentsData);
                setStudents([]);
                message.warning('Không tìm thấy thông tin học sinh');
            }
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách học sinh:', error);
            message.error('Không thể tải danh sách học sinh. Vui lòng thử lại!');
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    const fetchVaccineData = async () => {
        if (!selectedStudentId) {
            console.log('⚠️ Chưa chọn học sinh, không tải vaccine');
            return;
        }

        try {
            setLoading(true);
            console.log('🔄 Đang lấy danh sách yêu cầu tiêm chủng từ server cho học sinh:', selectedStudentId);

            const response = await vaccineApi.parent.getVaccineByParentId();
            console.log('✅ API getVaccineByParentId response:', response);

            const vaccineData = response.data || [];

            if (Array.isArray(vaccineData)) {
                // Lọc vaccine theo học sinh đã chọn
                const filteredVaccines = vaccineData.filter(vaccine => {
                    const match = vaccine.studentID && selectedStudentId &&
                        vaccine.studentID.toString().toLowerCase() === selectedStudentId.toString().toLowerCase();

                    return match;
                });

                // Chuẩn hóa dữ liệu
                const normalizedVaccines = filteredVaccines.map(vaccine => ({
                    RecordID: vaccine.recordID,
                    StudentID: vaccine.studentID,
                    StudentName: vaccine.studentName,
                    Class: vaccine.class,
                    VaccineName: vaccine.vaccineName,
                    Dose: vaccine.dose,
                    VaccinatedAt: vaccine.vaccinatedAt,
                    Status: vaccine.status,  // Giữ nguyên status từ backend
                    DateTime: vaccine.dateTime,
                    VaccinatorName: vaccine.vaccinatorName,
                    Notes: vaccine.notes,
                    FollowUpNotes: vaccine.followUpNotes,
                    FollowUpDate: vaccine.followUpDate,
                    VaccineID: vaccine.vaccineID,
                    VaccinatorID: vaccine.vaccinatorID,
                    NurseID: vaccine.nurseID,
                    ParentID: vaccine.parentID
                }));

                // 📊 Lưu tất cả vaccine để tính thống kê
                setAllVaccines(normalizedVaccines);

                // 🎯 Lọc chỉ vaccine "Pending" - cần phản hồi từ parent
                const pendingRequests = normalizedVaccines.filter(vaccine => {
                    const status = (vaccine.Status || '').toLowerCase();
                    return status === 'pending' || status === 'chờ xác nhận';
                });

                console.log('📋 Vaccine đã lọc theo học sinh:', filteredVaccines);
                console.log('🔍 Checking status của từng vaccine:');
                filteredVaccines.forEach((vaccine, index) => {
                    console.log(`  ${index}: recordID=${vaccine.recordID}, status="${vaccine.status}" (type: ${typeof vaccine.status})`);
                });

                console.log('🧪 Testing filter logic for VaccineRequest:');
                normalizedVaccines.forEach((vaccine, index) => {
                    const status = (vaccine.Status || '').toLowerCase();
                    const isPending = status === 'pending' || status === 'chờ xác nhận';
                    console.log(`  ${index}: recordID=${vaccine.RecordID}, status="${vaccine.Status}" → normalized="${status}" → isPending=${isPending}`);
                });

                console.log('🔔 Yêu cầu tiêm chủng cần phản hồi:', pendingRequests.map(v => `${v.RecordID}:${v.Status}`));

                setVaccines(pendingRequests);

            } else {
                console.warn('⚠️ Dữ liệu vaccine không phải array:', vaccineData);
                setVaccines([]);
                setAllVaccines([]);
            }
        } catch (error) {
            console.error('❌ Lỗi khi lấy dữ liệu vaccine:', error);
            message.error('Không thể tải danh sách yêu cầu tiêm chủng. Vui lòng thử lại!');
            setVaccines([]);
            setAllVaccines([]);
        } finally {
            setLoading(false);
        }
    };

    // ==================== HANDLER FUNCTIONS ====================

    const handleViewDetail = (record) => {
        console.log('👁️ Viewing vaccine detail:', record);
        setViewingVaccine(record);
        setIsDetailModalVisible(true);
    };

    const handleRefresh = () => {
        console.log('🔄 Refreshing data...');
        if (selectedStudentId) {
            fetchVaccineData();
        } else {
            fetchStudents();
        }
    };

    const handleConfirmVaccination = async (record) => {
        try {
            console.log('✅ Confirming vaccination:', record.RecordID);

            const response = await vaccineApi.parent.confirmVaccination({
                RecordID: record.RecordID
            });

            console.log('✅ Confirm vaccination response:', response);
            message.success('Đã đồng ý tiêm chủng thành công!');

            // Refresh data to update status
            fetchVaccineData();

        } catch (error) {
            console.error('❌ Error confirming vaccination:', error);
            message.error('Không thể xác nhận tiêm chủng. Vui lòng thử lại!');
        }
    };

    const handleDenyVaccination = async (record) => {
        try {
            console.log('❌ Denying vaccination:', record.RecordID);

            const response = await vaccineApi.parent.denyVaccination({
                RecordID: record.RecordID
            });

            console.log('❌ Deny vaccination response:', response);
            message.success('Đã từ chối tiêm chủng thành công!');

            // Refresh data to update status
            fetchVaccineData();

        } catch (error) {
            console.error('❌ Error denying vaccination:', error);
            message.error('Không thể từ chối tiêm chủng. Vui lòng thử lại!');
        }
    };

    // ==================== HELPER FUNCTIONS ====================

    // 📊 Tính toán thống kê yêu cầu tiêm chủng
    const getVaccineRequestStats = () => {
        if (!allVaccines || allVaccines.length === 0) {
            return {
                total: 0,
                responded: 0,
                notResponded: 0
            };
        }

        // Tổng yêu cầu phản hồi (bao gồm cả pending và đã phản hồi)
        const requestVaccines = allVaccines.filter(vaccine => {
            const status = (vaccine.Status || '').toLowerCase();
            // Bao gồm tất cả vaccine có liên quan đến yêu cầu phản hồi từ parent
            return status === 'pending' ||
                status === 'chờ xác nhận' ||
                status === 'confirmed' ||
                status === 'đã xác nhận' ||
                status === 'denied' ||
                status === 'từ chối' ||
                status === 'rejected' ||
                status === 'cancel' ||
                status === 'cancelled';
        });

        // Đã phản hồi (confirmed, denied, rejected, cancelled)
        const respondedVaccines = allVaccines.filter(vaccine => {
            const status = (vaccine.Status || '').toLowerCase();
            return status === 'confirmed' ||
                status === 'đã xác nhận' ||
                status === 'denied' ||
                status === 'từ chối' ||
                status === 'rejected' ||
                status === 'cancel' ||
                status === 'cancelled';
        });

        // Chưa phản hồi (pending)
        const notRespondedVaccines = allVaccines.filter(vaccine => {
            const status = (vaccine.Status || '').toLowerCase();
            return status === 'pending' || status === 'chờ xác nhận';
        });

        return {
            total: requestVaccines.length,
            responded: respondedVaccines.length,
            notResponded: notRespondedVaccines.length
        };
    };

    const getStatusTag = (status) => {
        const normalizedStatus = (status || '').toLowerCase();

        const statusConfig = {
            'pending': {
                color: 'orange',
                icon: <ClockCircleOutlined />,
                text: 'Chờ xác nhận'
            },
            'chờ xác nhận': {
                color: 'orange',
                icon: <ClockCircleOutlined />,
                text: 'Chờ xác nhận'
            }
        };

        const config = statusConfig[normalizedStatus] || {
            color: 'default',
            icon: <ClockCircleOutlined />,
            text: status || 'Chưa xác định'
        };

        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa xác định';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'Ngày không hợp lệ';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Chưa xác định';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Thời gian không hợp lệ';
        }
    };

    // ==================== TABLE COLUMNS ====================

    const columns = [
        {
            title: 'Mã tiêm',
            dataIndex: 'RecordID',
            key: 'RecordID',
            width: 120,
            render: (text) => <Text strong className="text-blue-500 text-xs">{text || 'N/A'}</Text>,
        },
        {
            title: 'Tên học sinh',
            key: 'student',
            width: 200,
            render: (_, record) => (
                <div>
                    <div><Text className="font-medium text-xs text-blue-500">{record.StudentName || 'Chưa có tên'}</Text></div>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Lớp: {record.Class || 'Chưa phân lớp'}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Loại vaccine',
            key: 'vaccine',
            width: 180,
            render: (_, record) => (
                <div>
                    <div><Text className="font-medium text-purple-700 text-xs">{record.VaccineName || 'Chưa xác định'}</Text></div>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Liều: {record.Dose || 'Chưa xác định'}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày dự kiến tiêm',
            dataIndex: 'VaccinatedAt',
            key: 'VaccinatedAt',
            width: 140,
            render: (text) => (
                <Text className="text-xs font-medium" style={{ color: "black" }}>
                    {formatDate(text)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'Status',
            key: 'Status',
            width: 130,
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space direction="vertical" size="small" style={{ width: '75%' }}>
                    <Tooltip title="Xem chi tiết và phản hồi">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetail(record)}
                            style={{
                                width: '100%',
                                background: '#1890ff',
                                borderColor: '#1890ff'
                            }}
                        >
                            Xem & Phản hồi
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '0px', background: "linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(226, 232, 240) 50%, rgb(241,245,249) 100%)" }}>
            {/* Header */}
            <div
                style={{
                    background: "linear-gradient(90deg, #0DACCD 0%, #2980b9 100%)",
                    borderRadius: "32px",
                    boxShadow: "0 10px 32px rgba(22,160,133,0.18)",
                    padding: "32px 40px 28px 40px",
                    margin: "32px 0 24px 0",
                    maxWidth: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 120
                }}
            >
                {/* Left: Icon + Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    {/* Icon */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 24,
                            background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow:
                                "0 8px 24px rgba(251,191,36,0.25), inset 0 2px 4px rgba(255,255,255,0.3)",
                            border: "2px solid rgba(255,255,255,0.4)",
                            backdropFilter: "blur(2px)",
                        }}
                    >
                        <span style={{ fontSize: 44, filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.13))" }}>⚠️</span>
                    </div>
                    {/* Title + Subtitle */}
                    <div>
                        <div
                            style={{
                                fontSize: 36,
                                fontWeight: 900,
                                color: "#fff",
                                textShadow: "2px 2px 8px rgba(0,0,0,0.13)",
                                letterSpacing: "0.5px",
                                marginBottom: 8
                            }}
                        >
                            Yêu cầu tiêm chủng
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#f59e0b",
                                    boxShadow: "0 0 0 4px rgba(245,158,11,0.18)"
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 17,
                                    color: "#f3f4f6",
                                    fontWeight: 500,
                                    textShadow: "1px 1px 3px rgba(0,0,0,0.10)"
                                }}
                            >
                                Phản hồi yêu cầu tiêm chủng từ trường
                            </span>
                        </div>
                    </div>
                </div>
                {/* Right: Statistics + Refresh Button */}
                <div style={{ display: "flex", gap: 18 }}>
                    {/* Total Requests */}
                    <div
                        style={{
                            background: "rgba(255,255,255,0.13)",
                            borderRadius: 18,
                            padding: "18px 28px",
                            minWidth: 90,
                            textAlign: "center",
                            color: "#fff",
                            boxShadow: "0 2px 8px rgba(245,158,11,0.12)"
                        }}
                    >
                        <div style={{ fontSize: 26, marginBottom: 4 }}>
                            <span role="img" aria-label="list">📋</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{vaccines.length}</div>
                        <div style={{ fontSize: 13, opacity: 0.85 }}>Yêu cầu</div>
                    </div>
                    {/* Today */}
                    <div
                        style={{
                            background: "rgba(255,255,255,0.13)",
                            borderRadius: 18,
                            padding: "18px 28px",
                            minWidth: 110,
                            textAlign: "center",
                            color: "#fff",
                            boxShadow: "0 2px 8px rgba(245,158,11,0.12)"
                        }}
                    >
                        <div style={{ fontSize: 26, marginBottom: 4 }}>
                            <span role="img" aria-label="clock">⏰</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {new Date().toLocaleDateString('vi-VN')}
                        </div>
                        <div style={{ fontSize: 13, opacity: 0.85 }}>Hôm nay</div>
                    </div>

                </div>
            </div>

            {/* Student Selector */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
                {/* Statistics Cards */}
                {selectedStudentId && (
                    <Row justify="center" style={{ marginBottom: 32 }}>
                        <Col xs={24}>
                            <Card
                                style={{
                                    borderRadius: 20,
                                    border: "none",
                                    background: "white",
                                    boxShadow: "0 8px 32px rgba(245,158,11,0.07), 0 0 0 1px #f3f4f6",
                                    marginBottom: 0,
                                }}
                                bodyStyle={{ padding: "24px 32px" }}
                                title={
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 12,
                                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 4px 12px rgba(245,158,11,0.13)",
                                                border: "2px solid rgba(255,255,255,0.2)",
                                                transform: "perspective(1000px) rotateX(5deg)",
                                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                                            }}
                                        >
                                            <span style={{
                                                color: "white",
                                                fontSize: 20,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                            }}>📊</span>
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                                                Thống kê yêu cầu tiêm chủng
                                            </Text>
                                            <div style={{ fontSize: 13, color: "#64748b" }}>
                                                Tổng quan về các yêu cầu phản hồi từ phụ huynh
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <Row gutter={24} justify="center">
                                    <Col xs={24} md={6}>
                                        <div style={{
                                            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                            borderRadius: 18,
                                            padding: "20px 0",
                                            textAlign: "center",
                                            boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                                            border: "2px solid rgba(255,255,255,0.2)",
                                            transform: "perspective(1000px) rotateX(1deg)",
                                            transition: "all 0.3s ease",
                                        }}>
                                            <div style={{
                                                fontSize: 36,
                                                marginBottom: 8,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                                            }}>📝</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                                                {getVaccineRequestStats().total}
                                            </div>
                                            <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>
                                                Tổng yêu cầu phản hồi
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <div style={{
                                            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                            borderRadius: 18,
                                            padding: "20px 0",
                                            textAlign: "center",
                                            boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                                            border: "2px solid rgba(255,255,255,0.2)",
                                            transform: "perspective(1000px) rotateX(1deg)",
                                            transition: "all 0.3s ease",
                                        }}>
                                            <div style={{
                                                fontSize: 36,
                                                marginBottom: 8,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                                            }}>✔️</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                                                {getVaccineRequestStats().responded}
                                            </div>
                                            <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>
                                                Đã phản hồi
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <div style={{
                                            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                            borderRadius: 18,
                                            padding: "20px 0",
                                            textAlign: "center",
                                            boxShadow: "0 4px 16px rgba(59,130,246,0.10)",
                                            border: "2px solid rgba(255,255,255,0.2)",
                                            transform: "perspective(1000px) rotateX(1deg)",
                                            transition: "all 0.3s ease",
                                        }}>
                                            <div style={{
                                                fontSize: 36,
                                                marginBottom: 8,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                                            }}>⏳</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                                                {getVaccineRequestStats().notResponded}
                                            </div>
                                            <div style={{ fontSize: 14, color: "#1d4ed8", fontWeight: 600 }}>
                                                Chưa phản hồi
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Main Content */}
                <Card
                    style={{
                        borderRadius: 20,
                        border: "none",
                        background: "white",
                        boxShadow: "0 8px 32px rgba(245,158,11,0.07), 0 0 0 1px #f3f4f6",
                    }}
                    bodyStyle={{ padding: 0 }}
                    title={
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "24px 32px 0", marginLeft: "-26px" }}>
                            <div>
                                <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                                    Yêu cầu tiêm chủng cần phản hồi
                                </Text>
                                <div style={{ fontSize: 13, color: "#64748b" }}>
                                    Các yêu cầu tiêm chủng từ trường đang chờ phản hồi từ phụ huynh
                                </div>
                            </div>

                             <div
                            style={{
                                width: "300px", // Giảm kích thước ô chọn học sinh
                                marginLeft: "auto", // Đẩy ô về phía bên trái
                            }}
                        >
                            <Select
                                placeholder="Chọn học sinh để xem thông tin tiêm chủng"
                                style={{ width: "100%" }}
                                value={selectedStudentId}
                                onChange={(value) => setSelectedStudentId(value)}
                                loading={studentsLoading}
                                showSearch
                                optionFilterProp="children"
                                allowClear
                                size="middle"
                            >
                                {students.map((student) => (
                                    <Option key={student.StudentID} value={student.StudentID}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '16px' }}>👨‍🎓</span>
                                            <div>
                                                <span>{student.StudentName}</span>
                                                <span>-</span>
                                                <span style={{ color: '#64748b', marginLeft: 8 }}>
                                                    Lớp {student.Class}
                                                </span>
                                            </div>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                            </div>
                        </div>
                    }
                >
                    <div style={{ padding: "0 32px 32px" }}>
                        {!selectedStudentId ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                                            Vui lòng chọn học sinh để xem yêu cầu tiêm chủng
                                        </Text>
                                        <br />
                                        <Text style={{ fontSize: '14px', color: '#bfbfbf' }}>
                                            Chọn một học sinh từ danh sách bên trên
                                        </Text>
                                    </div>
                                }
                                style={{ padding: "60px 0" }}
                            />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={vaccines}
                                rowKey="RecordID"
                                loading={loading}
                                pagination={{
                                    total: vaccines.length,
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} của ${total} bản ghi`,
                                }}
                                locale={{
                                    emptyText: (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description={
                                                <div>
                                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                                                        Không có yêu cầu tiêm chủng nào cần phản hồi
                                                    </Text>
                                                    <br />
                                                    <Text style={{ fontSize: '14px', color: '#bfbfbf' }}>
                                                        Tất cả yêu cầu tiêm chủng đã được xử lý
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    ),
                                }}
                                scroll={{ x: 1150 }}
                                style={{
                                    background: "transparent",
                                }}
                            />
                        )}
                    </div>
                </Card>
            </div>

            {/* Detail Modal */}
            <Modal
                title={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: '16px'
                    }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                                boxShadow: "0 4px 12px rgba(251,191,36,0.15)",
                            }}
                        >
                            <span style={{ fontSize: 16, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>⚠️</span>
                        </div>
                        <div>
                            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                                Chi tiết yêu cầu tiêm chủng
                            </Text>
                            <div style={{ fontSize: 13, color: "#64748b" }}>
                                Xem thông tin chi tiết và đưa ra quyết định
                            </div>
                        </div>
                    </div>
                }
                open={isDetailModalVisible}
                onCancel={() => {
                    setIsDetailModalVisible(false);
                    setViewingVaccine(null);
                }}
                footer={[
                    viewingVaccine && (() => {
                        const status = (viewingVaccine.Status || '').toLowerCase();
                        const isPending = status === 'pending' || status === 'chờ xác nhận';

                        return isPending ? (
                            <Space key="actions" style={{ marginTop: 16 }}>
                                <Popconfirm
                                    title="Xác nhận đồng ý tiêm chủng"
                                    description="Bạn có chắc chắn đồng ý cho con em mình tiêm vaccine này?"
                                    onConfirm={async () => {
                                        await handleConfirmVaccination(viewingVaccine);
                                        setIsDetailModalVisible(false);
                                        setViewingVaccine(null);
                                    }}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                    okType="primary"
                                >
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        size="large"
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            height: 44,
                                            paddingLeft: 24,
                                            paddingRight: 24
                                        }}
                                    >
                                        Đồng ý tiêm chủng
                                    </Button>
                                </Popconfirm>

                                <Popconfirm
                                    title="Xác nhận từ chối tiêm chủng"
                                    description="Bạn có chắc chắn từ chối cho con em mình tiêm vaccine này?"
                                    onConfirm={async () => {
                                        await handleDenyVaccination(viewingVaccine);
                                        setIsDetailModalVisible(false);
                                        setViewingVaccine(null);
                                    }}
                                    okText="Từ chối"
                                    cancelText="Hủy"
                                    okType="danger"
                                >
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<CloseOutlined />}
                                        size="large"
                                        style={{
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            height: 44,
                                            paddingLeft: 24,
                                            paddingRight: 24
                                        }}
                                    >
                                        Từ chối tiêm chủng
                                    </Button>
                                </Popconfirm>
                            </Space>
                        ) : null;
                    })(),
                ]}
                width={950}
                style={{
                    borderRadius: 16,
                    overflow: 'hidden'
                }}
                bodyStyle={{
                    padding: 0
                }}
            >
                {viewingVaccine && (
                    <div style={{ padding: '24px' }}>
                        {/* Alert Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            border: '1px solid #fbbf24',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 4px 12px rgba(251,191,36,0.08)'
                        }}>
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 12,
                                    boxShadow: "0 2px 8px rgba(251,191,36,0.2)",
                                }}
                            >
                                <span style={{ fontSize: 14, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}>⚠️</span>
                            </div>
                            <div>
                                <Text style={{ fontWeight: 'bold', color: '#92400e', fontSize: 15 }}>
                                    Yêu cầu cần phản hồi
                                </Text>
                                <br />
                                <Text style={{ fontSize: '13px', color: '#a16207' }}>
                                    Vui lòng xem xét và đưa ra quyết định cho việc tiêm chủng này.
                                </Text>
                            </div>
                        </div>

                        {/* Main Information */}
                        <Card
                            title={
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Text strong style={{ fontSize: 14,color: "black" }}>Thông tin chính</Text>
                                </div>
                            }
                            size="small"
                            style={{
                                marginBottom: '20px',
                                borderRadius: 12,
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                            bodyStyle={{ padding: '16px 20px' }}
                        >
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã vaccine" span={1}>
                                    <Text style={{ fontSize: '14px' }}>{viewingVaccine.RecordID}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái" span={1}>
                                    {getStatusTag(viewingVaccine.Status)}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tên học sinh" span={1}>
                                    <Text  style={{ fontSize: '14px' }}>{viewingVaccine.StudentName || 'Chưa có tên'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mã học sinh" span={1}>
                                    <Text>{viewingVaccine.StudentID}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Lớp" span={1}>
                                    <Text>{viewingVaccine.Class || 'Chưa phân lớp'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại vaccine" span={1}>
                                    <Text style={{ fontSize: '14px', color: '#1890ff' }}>
                                        {viewingVaccine.VaccineName || 'Chưa xác định'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Liều lượng" span={1}>
                                    <Text color="blue">Liều {viewingVaccine.Dose || 1}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tiêm dự kiến" span={1}>
                                    <Text style={{ fontSize: '14px', color: '#1890ff' }}>
                                        {formatDate(viewingVaccine.VaccinatedAt)}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Additional Information */}
                        <Card
                            title={
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Text strong style={{ fontSize: 14, color: "black"}}>Thông tin bổ sung</Text>
                                </div>
                            }
                            size="small"
                            style={{
                                marginBottom: '16px',
                                borderRadius: 12,
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                            bodyStyle={{ padding: '16px 20px' }}
                        >
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Thời gian tạo yêu cầu">
                                    <Text style={{ fontSize: '13px' }}>{formatDateTime(viewingVaccine.DateTime)}</Text>
                                </Descriptions.Item>

                                {viewingVaccine.Notes && (
                                    <Descriptions.Item label="Ghi chú từ y tá">
                                        <Text style={{ fontSize: '13px', fontStyle: 'italic' }}>{viewingVaccine.Notes}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VaccineRequest;