import type { Meta, StoryObj } from '@storybook/react';
import AvatarComponent from './avatar.component';

const meta: Meta<typeof AvatarComponent> = {
  component: AvatarComponent,
};

export default meta;
type Story = StoryObj<typeof AvatarComponent>;

export const FullName: Story = {
  args: {
    avatarClass: 'size-12',
    text: 'FirstName SecondName',
  },
};

export const OnePartName: Story = {
  args: {
    avatarClass: 'size-12',
    text: 'Guest',
  },
};
