import { Spin, Space, Button, Form, InputNumber, Select } from "antd";
import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import React, { FC, useState } from "react";
import {
  PostId,
  CreateReplyPost,
  PostOperation,
  POST_OPERATIONS,
} from "./posts.types";

const { Option } = Select;

// TODO: replace this quick workaround
const checkIfValueAndOperationAreValid = ({ value, operation }: { value: number, operation: PostOperation }): boolean => {
  if (value === 0 && operation === PostOperation.Division) {
    return false;
  }
  return true;
};

export const AddReplyPost: FC<{ createReplyPost: CreateReplyPost; parentPostId: PostId }> = ({ createReplyPost, parentPostId }) => {
  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) {
    return (
      <Space size="middle">
        <Spin size="large" />
      </Space>
    );
  }
  const onFinish = (formData: { value: number, operation: PostOperation }) => {
    setIsLoading(true);
    pipe(
      TE.right({ value: formData.value, operation: formData.operation, parentPostId }),
      TE.filterOrElse(
        checkIfValueAndOperationAreValid,
        () => new Error("Invalid operation:value pair"),
      ),
      TE.fold(
        (e) => {
          alert(e);
          return TE.right(void 0);
        },
        (input) => {
          return pipe(
            createReplyPost({ value: formData.value, operation: formData.operation, parentPostId }),
            TE.fold(
              (e) => {
                alert(`Failed to load posts: ${e}`);
                return TE.right(void 0);
              },
              () => {
                return TE.right(void 0);
              }
            ),
          );
        },
      ),
      TE.map(() => {
        setIsLoading(false);
        return void 0;
      }),
    )();
  }
  return (
    <Form className="add-post-form" onFinish={onFinish} size="small">
      <Form.Item name="value" label="Value (number)" rules={[{ type: "number", required: true }]} wrapperCol={{ span: 12 }}>
        <InputNumber />
      </Form.Item>
      <Form.Item name="operation" label="Operation" rules={[{ required: true }]} wrapperCol={{ span: 12 }}>
        <Select>
          {POST_OPERATIONS.map((operation) => <Option key={operation} value={operation}>{operation}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }}>
        <Button type="primary" htmlType="submit">
          Reply
        </Button>
      </Form.Item>
    </Form>
  );
};
