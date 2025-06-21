import React, { useState } from "react";
import { Layout, Input, Button, Space, Avatar, Dropdown } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

function AppHeader() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");


  const handleSearch = (value) => {
    console.log("Searching for:", value);
   
  };

  return (
    <Header className="bg-white shadow-md border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
      {/* Left Section - Logo */}
      <div className="flex items-center">
        <div className="flex items-center cursor-pointer" 
        onClick={() => navigate("/home")}
        style={{marginLeft:'160px'}}>
          <img 
            src="/favicon.svg" 
            alt="School Logo" 
            className="w-10 h-10 mr-3"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Y Tế Học Đường
          </span>
        </div>
      </div>

      {/* Center Section - Search + Navigation */}
      <div className="flex items-center space-x-8"
      style={{marginRight:'106px'}}>
        {/* Search Bar */}
<div className="flex items-center">
  <div className="relative flex items-center">
    <Input
      placeholder="Tìm kiếm tại đây"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onPressEnter={() => handleSearch(searchValue)}
      className="w-80 h-10 rounded-full border-gray-300 focus:border-blue-500 focus:outline-none"
      style={{
        borderRadius: '25px',
        paddingLeft: '16px',
        paddingRight: '50px',
        border: '1px solid #d1d5db',
      }}
    />
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={() => handleSearch(searchValue)}
        className="bg-blue-500 hover:bg-blue-600 border-0 rounded-full w-8 h-8 flex items-center justify-center shadow-md"
        style={{
          minWidth: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '-2px',
        }}
      />
    </div>
  </div>
</div>
        {/* Navigation Menu */}
        <nav className="flex items-center space-x-6">
  <button
    onClick={() => navigate("/home")}
    className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
    style={{marginLeft:'17px'}}
  >
    <HomeOutlined className="mr-2" />
    Trang chủ
  </button>
  
  <button
    onClick={() => navigate("/tin-tuc")}
    className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
    style={{margin:'33px'}}
  >
    <FileTextOutlined className="mr-2" />
    Tin tức
  </button>
  
  <button
    onClick={() => navigate("/gioi-thieu")}
    className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
    style={{margin:'0px'}}
  >
    <InfoCircleOutlined className="mr-2" />
    Giới thiệu
  </button>
</nav>
      </div>

      {/* Right Section - Login/User */}
      <div className="flex items-center space-x-4">
       

        {/* Login Button or User Dropdown */}
        {false ? ( // Change this condition based on authentication state
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <div className="flex items-center space-x-2 cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <Avatar 
                icon={<UserOutlined />} 
                className="bg-blue-500"
              />
              <span className="text-gray-700 font-medium">Admin</span>
            </div>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 h-10 px-6 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200"
            style={{marginRight:'115px'}}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </Header>
  );
}

export default AppHeader;