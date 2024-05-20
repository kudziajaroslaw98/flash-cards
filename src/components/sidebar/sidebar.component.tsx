'use client';

import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { NavigationGroup } from '#/shared/types/navigation-group.type';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  EllipsisVerticalIcon,
  LanguageIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import HamburgerMenuComponent from '../hamburger-menu/hamburger-menu.component';
import ThemeSwitchComponent from '../theme-switch/theme-switch.component';
import AvatarComponent from '../ui/avatar/avatar.component';
import ButtonComponent from '../ui/button/button.component';
import ContextMenuComponent from '../ui/context-menu/context-menu.component';
import NavigationGroupComponent from '../ui/navigation/navigation-group.component';
import NavigationItemComponent from '../ui/navigation/navigation-item.component';
import { ToggleButtonComponent } from '../ui/toggle-button/toggle-button.component';

export default function SidebarComponent() {
  const [expanded, toggleExpand] = useState<boolean>(true);
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { isLoggedIn, session, logOut } = useSessionContext();
  const firstName = session?.user?.user_metadata?.firstName;
  const lastName = session?.user?.user_metadata?.lastName;

  const iconSize = expanded ? 'h-4 w-4' : 'h-5 w-5';
  const groupIconSize = 'h-5 w-5';
  const navigationItems: NavigationItem[] = [
    {
      type: 'item',
      label: 'Learn',
      href: APP_ROUTES.flashcards.learn,
      icon: <AcademicCapIcon className={iconSize} />,
    },
    {
      type: 'item',
      label: 'Revise',
      href: APP_ROUTES.flashcards.revise,
      icon: <LanguageIcon className={iconSize} />,
    },
  ];

  const navigation: (NavigationItem | NavigationGroup)[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      icon: <Squares2X2Icon className={iconSize} />,
    },
    {
      type: 'group',
      label: 'Flash Cards',
      icon: <BoltIcon className={groupIconSize} />,
      items: [
        {
          type: 'item',
          label: 'Learn',
          href: APP_ROUTES.flashcards.learn,
          icon: <AcademicCapIcon className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Revise',
          href: APP_ROUTES.flashcards.revise,
          icon: <LanguageIcon className={iconSize} />,
        },
        // {
        //   type: 'item',
        //   label: 'Sets',
        //   href: '/flashcards/sets',
        //   icon: <RectangleStackIcon className={iconSize} />,
        // },
      ],
    },
  ];

  const handleToggle = () => {
    toggleExpand(!expanded);
  };

  return (
    <aside
      className={`sticky top-4 z-50 hidden max-h-[calc(100vh-2rem)] flex-col rounded-md border border-gray-200 bg-gray-50 transition-all dark:border-slate-900 dark:bg-slate-950 md:flex
      ${expanded ? 'w-80' : 'w-20'}
    `}
    >
      <div
        className={`relative flex items-center border-b border-gray-200 p-4 dark:border-slate-900 ${expanded ? 'justify-between' : 'justify-center'}`}
      >
        <Link
          href={'/dashboard'}
          className={`flex items-center font-thin tracking-wider ${expanded && 'gap-2'}`}
        >
          <Image
            width={expanded ? 16 : 24}
            height={16}
            src={'/images/flash-cards-logo.svg'}
            alt={'Flash Cards Logo'}
          />

          <h5
            className={`overflow-clip text-lg font-bold tracking-tighter text-green-400 transition-all dark:text-green-500 ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
          >
            FLASHC
            <span className='font-medium'>A</span>
            <span className='font-light'>R</span>
            <span className='font-extralight'>D</span>
            <span className='font-thin'>S</span>
          </h5>
        </Link>

        <ToggleButtonComponent
          type='icon-only'
          class='absolute -right-2 !h-5 !w-5 bg-green-400 !p-0 hover:bg-green-500 active:focus:bg-green-600 dark:bg-green-500 dark:hover:bg-green-500 dark:active:focus:bg-green-700'
          activeIcon={<ArrowLeftIcon className='h-3 w-3' />}
          inactiveIcon={<ArrowRightIcon className='h-3 w-3' />}
          toggled={expanded}
          toggle={handleToggle}
        />
      </div>

      <div className={`flex h-full w-full flex-col justify-center gap-8 p-4`}>
        <div
          className={`hidden flex-col gap-8 md:flex ${!expanded && 'items-center'}`}
        >
          {navigation?.map((section) => (
            <span key={section.label}>
              {section?.type === 'item' && (
                <NavigationItemComponent
                  item={section}
                  expanded={expanded}
                />
              )}

              {section?.type === 'group' && (
                <NavigationGroupComponent
                  group={section}
                  expanded={expanded}
                />
              )}
            </span>
          ))}
        </div>

        <span className='md:hidden'>
          <HamburgerMenuComponent navigationItems={navigationItems} />
        </span>

        <div className='flex h-full w-full items-end justify-center'>
          <div className='flex flex-col items-center justify-center gap-8'>
            <ThemeSwitchComponent showLabel={expanded} />
            <div
              className='flex'
              ref={menuRef}
            >
              <div className='flex items-center justify-center gap-2'>
                <ContextMenuComponent
                  open={!expanded && isOpen}
                  name={'avatar-context'}
                  afterMenuClass='py-4 justify-center'
                  contextPossiton='top-left'
                  triggerComponent={
                    <AvatarComponent
                      avatarClass='h-12 w-12'
                      text={isLoggedIn ? `${firstName} ${lastName}` : 'Guest'}
                      onClick={() => {
                        if (!expanded) {
                          setOpen(!isOpen);
                          toggle(!toggled);
                        }
                      }}
                    ></AvatarComponent>
                  }
                  menuItems={[
                    {
                      label: isLoggedIn ? 'Log Out' : 'Log In',
                      onClick: () => {
                        if (isLoggedIn) {
                          logOut();
                          setOpen(false);
                          toggle(!toggled);
                        } else {
                          router.push(APP_ROUTES.signIn);
                          setOpen(false);
                          toggle(!toggled);
                        }
                      },
                    },
                  ]}
                ></ContextMenuComponent>

                <div
                  className={`w-32 flex-col ${expanded ? 'flex' : 'hidden'}`}
                >
                  <span className='flex overflow-hidden text-ellipsis font-extrabold text-slate-800 dark:text-gray-100'>
                    {isLoggedIn ? `${firstName} ${lastName}` : 'Guest'}
                  </span>

                  <span className='w-full overflow-hidden text-ellipsis text-xs text-gray-400 dark:text-slate-500'>
                    {isLoggedIn ? session?.user?.email : 'You need to log in'}
                  </span>
                </div>

                <ContextMenuComponent
                  open={expanded && isOpen}
                  name={'dots-context'}
                  afterMenuClass='py-4 justify-center'
                  contextPossiton='top'
                  triggerComponent={
                    <ButtonComponent
                      icon={
                        <EllipsisVerticalIcon className={`cursor-pointer`} />
                      }
                      onClick={() => {
                        if (expanded) {
                          setOpen(!isOpen);
                          toggle(!toggled);
                        }
                      }}
                      class={`
                      ${expanded ? 'flex' : 'hidden'}
                      !h-8 !w-8 
                      text-slate-800 
                      hover:bg-green-500 hover:text-gray-100
                      active:focus:bg-green-600 active:focus:text-gray-300 
                      dark:text-gray-100 dark:hover:bg-green-400 
                    `}
                    />
                  }
                  menuItems={[
                    {
                      label: isLoggedIn ? 'Log Out' : 'Log In',
                      onClick: () => {
                        if (isLoggedIn) {
                          logOut();
                          setOpen(false);
                          toggle(!toggled);
                        } else {
                          router.push(APP_ROUTES.signIn);
                          setOpen(false);
                          toggle(!toggled);
                        }
                      },
                    },
                  ]}
                ></ContextMenuComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
