import { Spin, Space, Button, Form, InputNumber } from "antd";
import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import React, { FC, useState } from "react";
import {
  CreatePost,
} from "./posts.types";

export const AddMainPost: FC<{ createPost: CreatePost }> = ({ createPost }) => {
  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) {
    return (
      <Space size="middle">
        <Spin size="large" />
      </Space>
    );
  }
  const onFinish = (formData: { value: number }) => {
    setIsLoading(true);
    pipe(
      createPost({ value: formData.value }),
      TE.fold(
        (e) => {
          alert(`Failed to load posts: ${e}`);
          return TE.right(void 0);
        },
        () => {
          return TE.right(void 0);
        }
      ),
      TE.map(() => {
        setIsLoading(false);
        return void 0;
      }),
    )();
  }
  return (
    <Form className="add-post-form" onFinish={onFinish} layout="inline">
      <Form.Item name={"value"} label="Value (number)" rules={[{ type: "number", required: true }]}>
        <InputNumber />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add post
        </Button>
      </Form.Item>
    </Form>
  );
};
