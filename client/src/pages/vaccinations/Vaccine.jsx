import React from 'react';
import { Link } from 'react-router-dom';
import "./Vaccination.css";

const Vaccine = () => {
    const vaccinDate = [
        {
            id: 'history',
            tilte:'Lịch sử tiêm chủng',
            body : 'Đây là nơi bạn có thể xem lịch sử tiêm chủng của trẻ. Hãy đảm bảo rằng trẻ đã được tiêm đầy đủ các loại vắc xin cần thiết.',
            image: 'https://img.freepik.com/free-vector/vaccination-concept-illustration_114360-5361.jpg'
        },
        {
            id: 'results',
            tilte:'Kết quả tiêm chủng',
            body : 'Kết quả tiêm chủng là rất quan trọng cho sức khỏe của trẻ. Hãy kiểm tra lịch trình và đảm bảo tiêm chủng đúng hạn.',
            image: 'https://img.freepik.com/free-vector/doctor-examining-patient-illustrated_23-2148856559.jpg'
        },
        {
            id: 'requirements',
            tilte:'Yêu cầu tiêm chủng',
            body : 'Đảm bảo rằng trẻ của bạn đáp ứng tất cả các yêu cầu tiêm chủng. Kiểm tra danh sách các loại vắc xin cần thiết và lịch trình của chúng.',
            image: 'https://png.pngtree.com/template/20190926/ourmid/pngtree-medical-logo-design-health-care-logo-pharmacy-healthcare-vecto-image_309764.jpg'
        },
    ];

    return (
        <div className='vaccine-container'>
            <h1 className='vaccine-title'>Thông tin tiêm chủng</h1>
            {vaccinDate.map((vaccine) => (
                <Link 
                    to={`/parent/vaccinations/${vaccine.id}`}
                    key={vaccine.id}
                    className='vaccine-section-link'
                >
                    <div className='vaccine-section'>   
                        <div className='img-container'>
                            <img 
                                src={vaccine.image} 
                                alt={vaccine.tilte}
                                className='vaccine-image'
                            />
                        </div>
                        <div className='vaccine-content'>
                            <h2 className='vaccine-subtitle'>{vaccine.tilte}</h2>
                            <p className='vaccine-body'>{vaccine.body}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default Vaccine;