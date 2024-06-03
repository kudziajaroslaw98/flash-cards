import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleButton } from './toggle-button.component';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const ToggleButtonStory: Story = {
  args: {
    activeIcon: <PlusIcon className='h-4 w-4' />,
    inactiveIcon: <MinusIcon className='h-4 w-4' />,
    toggled: true,
  },
};
