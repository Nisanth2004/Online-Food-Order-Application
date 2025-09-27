import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./ListFood.css";
import { deleteFood, getFoodList } from "../../services/FoodService";

const ListFood = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getFoodList();
      setList(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while getting the food list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const removeFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      const success = await deleteFood(id);
      if (success) {
        toast.success("Food removed");
        await fetchList();
      } else {
        toast.error("Error occurred while removing the food");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while removing the food");
    }
  };

  return (
    <div className="py-5 row justify-content-center">
      <div className="col-11 card">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sponsored / Best Seller</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : list.length > 0 ? (
              list.map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <img src={item.imageUrl} alt="" height={60} width={60} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>&#8377;{item.price}.00</td>
                  <td>
                    {item.sponsored && <span className="badge bg-danger me-1">Sponsored</span>}
                    {item.featured && <span className="badge bg-warning text-dark">Best Seller</span>}
                  </td>
                  <td className="text-danger">
                    <i
                      className="bi bi-x-circle-fill"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => removeFood(item.id)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No foods found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListFood;
