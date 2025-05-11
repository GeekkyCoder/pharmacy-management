import { useState } from "react";

const useModal = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = (state) => {
    setModalOpen(state);
  };

  return {
    modalOpen,
    toggleModal,
  };
};

export default useModal
