import { useState } from 'react';
import { Button } from '../button/button';
import { Dialog, type DialogProps } from '../dialog/dialog';
import Modal from '../modal/modal';

export type AlertDialogProps = {
  trigger: React.ReactNode;
  onAccept: () => void;
  onCancel: () => void;
  headerText: string;
  bodyText: string;
} & Pick<DialogProps, 'children' | 'isCloseButtonVisible'>;

export const AlertDialog = ({
  headerText,
  bodyText,
  onCancel,
  onAccept,
  ...props
}: AlertDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    onCancel();
    setOpen(false);
  };

  const handleAccept = () => {
    onAccept();
    setOpen(false);
  };

  return (
    <Dialog
      onDialogClose={handleCancel}
      isCloseButtonVisible={false}
      trigger={props.trigger}
      open={open}
      setOpen={setOpen}
    >
      <Modal className='w-full max-w-xl'>
        <Modal.Header borderVisible={false}>{headerText}</Modal.Header>

        <Modal.Body
          borderVisible={false}
          className='flex flex-col'
        >
          {bodyText}
        </Modal.Body>

        <Modal.Footer
          borderVisible={false}
          className='flex items-center justify-end gap-2'
        >
          <Button
            onClick={handleCancel}
            variant={'secondary-outline'}
            label='Cancel'
          />
          <Button
            onClick={handleAccept}
            variant={'destructive'}
            label='Confirm'
          />
        </Modal.Footer>
      </Modal>
    </Dialog>
  );
};
