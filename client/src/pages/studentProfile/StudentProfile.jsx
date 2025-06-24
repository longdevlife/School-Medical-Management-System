import React from 'react';
import { Typography } from 'antd';

const StudentProfile = () => {
  return (
    <div className="flex max-w-[1200px] w-[90%] mx-auto my-5 rounded-lg overflow-hidden shadow-card h-[580px] gap-7 bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-[300px] bg-[#8dd3e7] bg-[url('/medicalsymbol.jpg')] bg-cover bg-center py-9 px-5 flex flex-col items-center text-gray-800 rounded-r-md">
        <div className="w-[160px] h-[160px] rounded-full flex justify-center items-center bg-white mb-[30px] overflow-hidden">
          <span className="text-[22px]">AVATAR</span>
        </div>
        <div className="text-[24px] my-[18px] text-center">LÊ VĂN BÌNH</div>
        <div className="text-[20px] my-3">LỚP : 2E</div>
        <div className="text-[18px] my-3 break-all">EMAIL :levanbinh@gmail.com</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white flex flex-col border border-[#12A1DD]">
        <Typography.Title 
        level={3}
        className="text-center text-[16px] py-[18px] px-0 m-0 !text-white font-medium tracking-normal bg-[#12A1DD] border-b-0"
        style={{marginBottom: '0px'}}>
          THÔNG TIN HỌC SINH
        </Typography.Title>
        
        <div className="w-full border-collapse">
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">HỌ VÀ TÊN</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">LÊ VĂN BÌNH</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">MÃ HỌC SINH</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">B2209</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">LỚP</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">2E</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">GIỚI TÍNH</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">NAM</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">NGÀY SINH</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">22-09-2004</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">HỌ TÊN CHA/MẸ</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">NGUYỄN THỊ HẠNH</div>
          </div>
          
          <div className="flex border-b border-[#12A1DD] min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">SỐ ĐIỆN THOẠI CHA/MẸ</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">083643832</div>
          </div>
          
          <div className="flex min-h-[35px]">
            <div className="w-[200px] py-[17.5px] px-[17.5px] font-normal bg-white border-r border-[#12A1DD] text-[15px]">ĐỊA CHỈ</div>
            <div className="flex-1 py-[17.5px] px-[17.5px] bg-white text-[15px]">LIÊN PHƯỜNG, QUẬN 9, TP THỦ ĐỨC, TP HỒ CHÍ MINH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 