import { useState } from 'react';

export default function useToggleList<T extends { id: string }>(): [
  T[],
  (item: T | undefined) => void
] {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const handleToggle = (item: T | undefined) => {
    if (!item) return setSelectedItems([]);
    if (selectedItems.some((i) => i.id === item.id)) {
      const updatedSelectedUser = selectedItems.filter((i) => i.id !== item.id);
      setSelectedItems(updatedSelectedUser);
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  return [selectedItems, handleToggle];
}
