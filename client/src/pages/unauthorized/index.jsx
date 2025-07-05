import React from 'react';
import { Button, Result } from 'antd';
import {useNavigate} from 'react-router-dom';



const UnAuthorized = () => {

  const navigate = useNavigate();

  const handleGoBack = () => {
     navigate(-1);
  }

 return <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={<Button type="primary" onClick={handleGoBack}>Back Home</Button>}
  />
};
export default UnAuthorized;