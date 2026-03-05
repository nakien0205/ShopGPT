import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "#0E0C0A" }}
    >
      <ShoppingBag className="w-10 h-10 text-[#D4A847]" />
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-[#F5F0E8]">404</h1>
        <p className="mt-2 text-sm font-mono-custom text-[#8A8070] uppercase tracking-[0.15em]">
          Page not found
        </p>
      </div>
      <button
        onClick={() => navigate("/")}
        className="text-xs font-mono-custom text-[#8A8070] hover:text-[#D4A847] transition-colors uppercase tracking-[0.15em] mt-2"
      >
        ← Return home
      </button>
    </div>
  );
};

export default NotFound;
