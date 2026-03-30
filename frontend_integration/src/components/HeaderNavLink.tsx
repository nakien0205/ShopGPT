import { useNavigate } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";

interface HeaderNavLinkProps {
  to: string;
  label: string;
}

const HeaderNavLink = ({ to, label }: HeaderNavLinkProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="p-2 rounded-lg bg-primary/10"
      title={label}
    >
      <HomeIcon className="text-primary" size={22} />
    </button>
  );
};

export default HeaderNavLink;
