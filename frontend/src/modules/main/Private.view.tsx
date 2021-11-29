import { Button } from 'antd';
import React, { FC } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { Logout } from "../../core/auth";

const Private: FC<{ logout: Logout }> = ({ logout }) => {
  const navigate = useNavigate();
  const onLogoutClick = () => {
    logout();
    navigate("/");
  }
  return (
    <div>
      <Button type="primary" onClick={onLogoutClick}>Logout</Button>
      <h2>Private</h2>
      <Outlet />
    </div>
  );
};

export default Private;
