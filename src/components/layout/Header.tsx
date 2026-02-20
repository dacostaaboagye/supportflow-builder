import { Link } from "@tanstack/react-router";

export const Header = () => {
  return (
    <header>
      <h1 className="text-2xl font-bold p-4">SupportFlow Visual Builder</h1>
      <div>
        <ul className="flex gap-4 p-4 py-2 bg-slate-100 shadow-lg border-b">
          <li>
            <Link
              to="/"
              className="text-blue-500"
              activeProps={{ className: "text-blue-500! font-bold" }}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/animation-demo"
              className="text-blue-500"
              activeProps={{ className: "text-red-500! font-bold" }}
            >
              Animation Demo
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};
