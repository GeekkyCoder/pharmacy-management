import React from "react";
import { message } from "antd";

const WithMessages = (WrappedComponent) => {
  return function Component(props) {
    const [messageApi, contextHolder] = message.useMessage();

    const success = (content) => {
      messageApi.open({
        type: "success",
        content: content
      });
    };

    const error = (content) => {
      messageApi.open({
        type: "error",
        content: content,
      });
    };

    const warning = (content) => {
      messageApi.open({
        type: "warning",
        content: content
      });
    };

    return (
      <>
        {contextHolder}
        <WrappedComponent
          success={success}
          error={error}
          warning={warning}
          {...props}
        />
      </>
    );
  };
};

export default WithMessages;
