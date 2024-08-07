import React, { useEffect, useState } from "react";
import { Button, Modal, Result } from "antd";
import Link from "next/link";

interface SuccessType {
  isSuccess: boolean | null;
}
function ConfirmationDialog(props: SuccessType) {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (props.isSuccess === true) setOpen(true);
    if (props.isSuccess === false) setOpen(true);
  }, [props.isSuccess]);

  return (
    <Modal
      open={isOpen}
      onOk={() => setOpen(false)}
      closeIcon={false}
      footer={null}
    >
      {props.isSuccess && isOpen && (
        <Success isSuccess={props.isSuccess} setOpen={setOpen} />
      )}
      {props.isSuccess === false && isOpen && (
        <Failure isSuccess={props.isSuccess} setOpen={setOpen} />
      )}
    </Modal>
  );
}

interface Type {
  isSuccess: boolean;
  setOpen: (e: boolean) => void;
}

function Success(props: Type) {
  return (
    <Result
      status="success"
      title="Successfully Registered!"
      subTitle="Our Team will get back once they verified your details!"
      extra={[
        <Link key="console" href="/">
          <Button type="primary" onClick={() => props.setOpen(false)}>
            Go Back
          </Button>
        </Link>,
      ]}
    />
  );
}

function Failure(props: Type) {
  return (
    <Result
      status="error"
      title="Submission Failed"
      subTitle="Something went wrong! Please contact the Admin for more info."
      extra={[
        <Link key="console" href="/">
          <Button type="primary" onClick={() => props.setOpen(false)}>
            Go Back
          </Button>
        </Link>,
      ]}
    ></Result>
  );
}

export default ConfirmationDialog;
