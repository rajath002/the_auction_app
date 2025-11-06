import React, { useEffect, useState } from "react";
import { Button, Modal, Result } from "antd";
import Link from "next/link";

interface ConfirmationDialogProps {
  isSuccess: boolean | null;
  recordCount?: number;
}

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
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
        <Success 
          isSuccess={props.isSuccess} 
          setOpen={setOpen} 
          recordCount={props.recordCount} 
        />
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
  recordCount?: number;
}

function Success(props: Type) {
  return (
    <Result
      status="success"
      title="Successfully Registered!"
      subTitle={`${props.recordCount || 0} player(s) have been registered successfully. Our Team will get back once they verify the details!`}
      extra={[
        <Link key="console" href="/">
          <Button type="primary" onClick={() => props.setOpen(false)}>
            Go Back
          </Button>
        </Link>,
        <Button key="another" onClick={() => props.setOpen(false)}>
          Register More
        </Button>,
      ]}
    />
  );
}

function Failure(props: Type) {
  return (
    <Result
      status="error"
      title="Registration Failed"
      subTitle="Please check the data and try again!"
      extra={[
        <Button
          type="primary"
          key="console"
          onClick={() => props.setOpen(false)}
        >
          Try Again
        </Button>,
      ]}
    />
  );
}
