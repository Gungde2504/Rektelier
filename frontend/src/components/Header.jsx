import { useLocation } from 'react-router-dom';
import TransitionLink from './TransitionLink';

const FONT_STACK = "font-['Helvetica_Neue',Helvetica,Arial,'Lucida_Grande',sans-serif]";
const LOGO_TEXT = `${FONT_STACK} uppercase font-bold tracking-[0.4px] [transform:scaleY(0.85)] leading-none`;
const NAV_TEXT = `${FONT_STACK} uppercase font-normal tracking-[0.4px] [transform:scaleY(0.85)] leading-none`;

const navItems = [
  { to: '/news', label: 'News' },
  { to: '/projects', label: 'Proyek' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const location = useLocation();

  function isActive(item) {
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  }

  function navClass(item) {
    const active = isActive(item);
    return `${NAV_TEXT} transition-colors duration-300 ease-in-out ${
      active ? 'text-rektelier-black' : 'text-rektelier-black hover:text-rektelier-muted'
    }`;
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-[1030] h-24 md:h-20">
      {/* Mobile: logo di tengah atas, nav satu baris di tengah bawahnya */}
      <div className="flex md:hidden flex-col items-center justify-center h-full px-6 gap-2">
        <TransitionLink to="/" className={`${LOGO_TEXT} text-lg`}>
          Rektelier
        </TransitionLink>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <TransitionLink key={item.to} to={item.to} className={`${navClass(item)} text-xs`}>
              {item.label}
            </TransitionLink>
          ))}
        </nav>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-4 items-center h-full px-10">
        <TransitionLink to="/" className={`justify-self-start ${LOGO_TEXT} text-base md:text-lg lg:text-2xl`}>
          Rektelier
        </TransitionLink>
        {navItems.map((item) => (
          <TransitionLink key={item.to} to={item.to} className={`justify-self-start ${navClass(item)} text-sm md:text-base lg:text-xl`}>
            {item.label}
          </TransitionLink>
        ))}
      </div>
    </header>
  );
}