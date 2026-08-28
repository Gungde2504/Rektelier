import { useTransition } from '../context/TransitionContext';

export default function TransitionLink({ to, children, className, onClick, ...props }) {
  const { goTo } = useTransition();

  function handleClick(e) {
    e.preventDefault();
    if (onClick) onClick(e);
    goTo(to);
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}