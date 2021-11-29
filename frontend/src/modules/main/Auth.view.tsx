import { Form, Input, Button, Row, Col } from 'antd';
import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import React, { FC } from 'react';
import { useNavigate } from "react-router-dom";
import { Login } from "../../core/auth";
import { eitherToPromise } from "../../core/fp-ts/eitherToPromise";
import "./Auth.style.css";

const Auth: FC<{ login: Login }> = ({ login }) => {
  const navigate = useNavigate();
  const onFinish = ({ username }: { username: string }) => {
    eitherToPromise(
      pipe(
        login(username),
        TE.chain(() => TE.right(navigate("/private"))),
      ),
    );
  };
  return (
    <Row>
      <Col span={6} offset={9}>
        <Form
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }} className="button-wrapper">
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Auth;
