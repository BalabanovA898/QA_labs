import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DishesPage } from "./pages/DishesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductInfo } from "./pages/ProductInfo";
import { ProductEdit } from "./pages/ProductEdit";
import { DishesInfo } from "./pages/DishesInfo";
import { DishEdit } from "./pages/DishEdit";
import { NotificationContainer } from "./store/NotificationContainer";

const Pager = () => {
  const { pathname } = useLocation();
  return (
    <nav className="nav">
      <Link
        to="/products"
        className={`nav-link${pathname === "/products" ? " nav-link--active" : ""}`}
      >
        Продукты
      </Link>
      <Link
        to="/dishes"
        className={`nav-link${pathname === "/dishes" ? " nav-link--active" : ""}`}
      >
        Блюда
      </Link>
    </nav>
  );
};

export const App = () => {
  return (
    <div className="app-shell">
      <NotificationContainer />
      <Pager />
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/dishes" element={<DishesPage />} />
        <Route path="/products/:id" element={<ProductInfo />} />
        <Route path="/products/:id/edit" element={<ProductEdit />} />
        <Route path="/dishes/:id" element={<DishesInfo />} />
        <Route path="/dishes/:id/edit" element={<DishEdit />} />
      </Routes>
    </div>
  );
};
