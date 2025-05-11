import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import WithLoader from '../../hocs/loader';

const AntModal = ({
    centered=false,
    modalOpen,
    title,
    setModal,
    children,
    actionBtns,
    loading,
    ...rest
}) => {

  return (
    <>
     
      <Modal
        title={title}
        centered={centered}
        open={modalOpen}
        footer={actionBtns}
        // onOk={() => setModal(false)}
        // onCancel={() => setModal(false)}
        {...rest}
      >
        {children}
      </Modal>
    
    </>
  );
};
export default WithLoader(AntModal);