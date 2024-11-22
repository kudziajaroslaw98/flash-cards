'use client';

import { useSessionContext } from '#/providers/session-provider.component';
import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import AvatarComponent from '#/components/_ui/avatar/avatar';
import React, { useState, useEffect } from 'react';
import Input from '#/components/_ui/input/input';
import Card from '#/components/_ui/card/card';
import { z } from 'zod';

export default function SettingsPage() {
  const { user, updateUser, deleteUser } = useSessionContext();
  const [firstName, setFirstName] = useState(user?.user_metadata?.firstName);
  const [lastName, setLastName] = useState(user?.user_metadata?.lastName);
  const [email, setEmail] = useState(user?.email);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user?.user_metadata?.firstName);
      setLastName(user?.user_metadata?.lastName);
      setEmail(user?.email);
    }
  }, [user]);

  const handleUpdateProfile = () => {
    const metadata = {
      firstName: firstName,
      lastName: lastName,
    };

    const updateUserBody = {
      email: email,
      data: metadata,
    };
    console.log(updateUserBody);

    const validation = z.object({
      data: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
      }),
      email: z.string().email('Email is incorrect').optional(),
    });

    const result = validation.safeParse(updateUserBody);

    console.log(result);

    if (result.success) {
      updateUser(updateUserBody);
    }
  };

  const handleDeleteUser = () => {
    setIsDeleting(true);
    deleteUser();
    //     try {
    //       const { data, error } = await supabase
    //         .from('users')
    //         .delete({ id: user.id });
    //       if (error) {
    //         console.error(error);
    //       } else {
    //         deleteUser();
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       setIsDeleting(false);
    //     }
  };

  return (
    <div className='flex w-full flex-col items-center gap-4'>
      <h1 className='mb-4 text-3xl font-bold'>Account Settings</h1>

      <Card
        motion={false}
        className='w-full max-w-sm'
      >
        <section className='flex flex-col gap-4'>
          <h2 className='text-2xl font-bold'>Account Information</h2>

          <div className='flex w-full justify-center'>
            <AvatarComponent
              className='size-24'
              text={`${firstName} ${lastName}`}
            />
          </div>

          <p className='text-gray-600'>
            <b>Email:</b> {email}
          </p>

          <p className='text-gray-600'>
            <b>First Name:</b> {firstName}
          </p>

          <p className='text-gray-600'>
            <b>Last Name:</b> {lastName}
          </p>
        </section>
      </Card>

      <Card
        motion={false}
        className='w-full max-w-sm'
      >
        <section className='mb-8 flex flex-col gap-4'>
          <h2 className='mb-2 text-2xl font-bold'>Edit Metadata</h2>
          <Input
            label='First Name'
            type='text'
            value={firstName}
            valid={true}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label='Last Name'
            type='text'
            value={lastName}
            valid={true}
            onChange={(e) => setLastName(e.target.value)}
          />

          <button
            onClick={handleUpdateProfile}
            className='rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:border-blue-500 focus:outline-none focus:ring'
          >
            Save Changes
          </button>
        </section>
      </Card>

      <Card
        motion={false}
        className='w-full max-w-sm'
      >
        <section className='flex flex-col gap-8'>
          <h2 className='text-2xl font-bold'>Delete Account</h2>
          <p className='flex flex-col gap-2 text-gray-600'>
            <span className='text-xl font-bold text-red-500'>Warning!</span>
            <span>
              Deleting your account will permanently remove all your data.
            </span>
          </p>
          <AlertDialog
            headerText='Delete Account'
            bodyText='Are you sure you want to delete your account? This action cannot be undone.'
            trigger={
              <button
                disabled={isDeleting}
                className={`rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:border-red-500 focus:outline-none focus:ring ${
                  isDeleting ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            }
            onAccept={handleDeleteUser}
            onCancel={() => setIsDeleting(false)}
          ></AlertDialog>
        </section>
      </Card>
    </div>
  );
}
