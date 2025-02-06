export interface ModalProps<T> {
  handleNew: (values: T[]) => void;
  handleEdit: (editRecords: Partial<T>[]) => void;
  selected: T[];
  isInEditMode?: boolean;
  trigger: React.ReactNode;
}
