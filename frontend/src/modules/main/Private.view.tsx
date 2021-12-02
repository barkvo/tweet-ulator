import { Button, Row, Col } from 'antd';
import React, { FC } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { Logout } from "../../core/auth";
import "./Private.style.css";

const Private: FC<{ logout: Logout }> = ({ logout }) => {
  const navigate = useNavigate();
  const onLogoutClick = () => {
    logout();
    navigate("/");
  }
  return (
    <Row>
      <Col span={10} offset={6} className="logout-button-container">
        <Button type="primary" onClick={onLogoutClick}>Logout</Button>
      </Col>
      <Col span={10} offset={6}>
        <Outlet />
      </Col>
    </Row>
  );
};

export default Private;
