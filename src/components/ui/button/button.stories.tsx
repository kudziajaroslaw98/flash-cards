import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.component';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      type: 'boolean',
      control: 'boolean',
    },
    loading: {
      type: 'boolean',
      control: 'boolean',
    },
    iconPosition: {
      options: ['left', 'right'],
      control: 'radio',
    },
    icon: {
      mapping: {
        true: <PlusIcon className='h-4 w-4' />,
        false: '',
      },
      control: 'boolean',
    },
    variant: {
      options: [
        'primary',
        'primary-outline',
        'primary-text',
        'destructive',
        'destructive-outline',
        'destructive-text',
        'secondary',
        'secondary-outline',
        'secondary-text',
      ],
      control: 'radio',
    },
    size: {
      options: ['default', 'sm', 'lg', 'xlg', 'icon', 'icon-mini'],
      control: 'radio',
    },
    label: {
      type: 'string',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const TextOnly: Story = {
  args: {
    label: 'Reshuffle',
  },
};

export const TextOnlyDisabled: Story = {
  args: {
    label: 'Reshuffle',
    disabled: true,
  },
};

export const TextWithIconLeft: Story = {
  args: {
    label: 'Reshuffle',
    icon: <ArrowPathIcon className='h-4 w-4' />,
    iconPosition: 'right',
  },
};

export const TextWithIconRight: Story = {
  args: {
    label: 'Reshuffle',
    icon: <ArrowPathIcon className='h-4 w-4' />,
    iconPosition: 'left',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <ArrowPathIcon className='h-4 w-4' />,
    size: 'icon',
  },
};

export const IconOnlyDisabled: Story = {
  args: {
    icon: <ArrowPathIcon className='h-4 w-4' />,
    disabled: true,
    size: 'icon',
  },
};

export const Loading: Story = {
  args: {
    icon: <ArrowPathIcon className='h-4 w-4' />,
    loading: true,
    size: 'icon',
  },
};

export const LoadingWithText: Story = {
  args: {
    label: 'Sign In',
    icon: <ArrowPathIcon className='h-4 w-4' />,
    iconPosition: 'left',
    loading: true,
  },
};
