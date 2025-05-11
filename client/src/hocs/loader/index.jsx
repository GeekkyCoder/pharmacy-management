import React,{useState} from "react";
import { Spin } from "antd";

const WithLoader = (WrappedComponent) => {
  return function LoaderWrapper(props) {
    const [loading, setLoading] = useState(false);

    return (
      <Spin spinning={loading}>
        <WrappedComponent
          loading={loading}
          setLoading={setLoading}
          {...props}
        />
      </Spin>
    );
  };
};

export default WithLoader;
