import React, { useEffect, useState } from "react";
import { deleteFood, getFoodList } from "../../services/FoodService";
import { toast } from "react-toastify";
import "./ListFood.css";

const ListFood = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const data = await getFoodList(pageNumber, 15);
      setList(data.foods || []);
      setPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Error occurred while getting the food list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(0);
  }, []);

  const removeFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      const success = await deleteFood(id);
      if (success) {
        toast.success("Food removed");
        await fetchList(page);
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
              <th>Stock</th>
              <th>Sponsored / Best Seller</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
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
                  <td>{item.categories?.join(", ") || "N/A"}</td>
                  <td>&#8377;{item.price}.00</td>
                  <td>
                    <div>
                      {item.outOfStock ? (
                        <span className="badge bg-danger">Out</span>
                      ) : item.lowStock ? (
                        <span className="badge bg-warning text-dark">Low ({item.stock})</span>
                      ) : (
                        <span className="badge bg-success">In ({item.stock})</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.sponsored && <span className="badge bg-danger me-1">Sponsored</span>}
                    {item.featured && <span className="badge bg-warning text-dark">Best Seller</span>}
                  </td>
                  <td className="text-danger">
                    <i
                      className="bi bi-x-circle-fill me-2"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => removeFood(item.id)}
                    />
                    <a className="btn btn-sm btn-outline-primary" href={`/edit/${item.id}`}>Edit</a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No foods found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Section */}
        <div className="pagination-container text-center my-3">
          <button
            className="btn btn-outline-primary mx-1"
            onClick={() => fetchList(page - 1)}
            disabled={page === 0 || loading}
          >
            ‹ Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn mx-1 ${i === page ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => fetchList(i)}
              disabled={loading}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-outline-primary mx-1"
            onClick={() => fetchList(page + 1)}
            disabled={page + 1 >= totalPages || loading}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFood;
