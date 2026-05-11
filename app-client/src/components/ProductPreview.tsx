import { Link } from "react-router-dom";

interface Props {
  id: string;
  name: string;
}

export const ProductPreview = ({ id, name }: Props) => (
  <Link to={`/products/${id}`} className="item-card">
    {name}
  </Link>
);
