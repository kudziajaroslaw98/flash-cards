'use client';

import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { NavigationGroup } from '#/shared/types/navigation-group.type';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  BoltIcon,
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
import ContextMenu from '../ui/context-menu/context-menu.component';
import NavigationGroupComponent from '../ui/navigation/navigation-group.component';
import NavigationItemComponent from '../ui/navigation/navigation-item.component';
import { ToggleButton } from '../ui/toggle-button/toggle-button.component';

export default function SidebarComponent() {
  const [expanded, toggleExpand] = useState<boolean>(true);
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const { isLoggedIn, session, logOut } = useSessionContext();
  const firstName = session?.user?.user_metadata?.firstName;
  const lastName = session?.user?.user_metadata?.lastName;

  const iconSize = expanded ? 'size-4' : 'size-5';
  const groupIconSize = 'size-5';
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

        <ToggleButton
          size='icon-mini'
          className='absolute -right-2'
          activeIcon={<ArrowLeftIcon className='size-3' />}
          inactiveIcon={<ArrowRightIcon className='size-3' />}
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
                <ContextMenu
                  open={isOpen}
                  className='-left-4'
                  name={'avatar-context'}
                  afterMenuClass='py-4 justify-center'
                  contextPosition={'top-left'}
                  triggerComponent={
                    <AvatarComponent
                      avatarClass='size-12'
                      text={isLoggedIn ? `${firstName} ${lastName}` : 'Guest'}
                      onClick={() => {
                        setOpen(!isOpen);
                        toggle(!toggled);
                      }}
                    ></AvatarComponent>
                  }
                  menuItems={[
                    {
                      label: isLoggedIn ? 'Log Out' : 'Log In',
                      icon: isLoggedIn ? (
                        <ArrowRightStartOnRectangleIcon className='size-6' />
                      ) : (
                        <ArrowRightEndOnRectangleIcon className='size-6' />
                      ),
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
                ></ContextMenu>

                <div
                  className={`w-full max-w-32 flex-col ${expanded ? 'flex' : 'hidden'}`}
                >
                  <span className='flex overflow-hidden text-ellipsis font-extrabold text-slate-800 dark:text-gray-100'>
                    {isLoggedIn ? `${firstName} ${lastName}` : 'Guest'}
                  </span>

                  <span className='w-full overflow-hidden text-ellipsis text-xs text-gray-400 dark:text-slate-500'>
                    {isLoggedIn ? session?.user?.email : 'Click here to log in'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
