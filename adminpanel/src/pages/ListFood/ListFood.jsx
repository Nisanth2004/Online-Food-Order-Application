import React from "react";
import { useAdminFood } from "../../context/AdminFoodContext";
import "./ListFood.css";

const ListFood = () => {
  const {
    foods,
    loading,
    page,
    totalPages,
    fetchFoods,
    removeFood,
  } = useAdminFood();

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
                <td colSpan={7} className="text-center py-4">
                  <div className="spinner-border text-primary" />
                </td>
              </tr>
            ) : foods.length ? (
              foods.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.imageUrl} width={60} height={60} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.categories?.join(", ")}</td>
                  <td>₹{item.price}</td>
                  <td>
                    {item.outOfStock ? (
                      <span className="badge bg-danger">Out</span>
                    ) : (
                      <span className="badge bg-success">
                        In ({item.stock})
                      </span>
                    )}
                  </td>
                  <td>
                    {item.sponsored && (
                      <span className="badge bg-danger me-1">Sponsored</span>
                    )}
                    {item.featured && (
                      <span className="badge bg-warning text-dark">
                        Best Seller
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => removeFood(item.id)}
                    >
                      Delete
                    </button>
                    <a
                      className="btn btn-sm btn-outline-primary"
                      href={`/edit/${item.id}`}
                    >
                      Edit
                    </a>
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

        {/* Pagination */}
        <div className="text-center my-3">
          <button
            className="btn btn-outline-primary mx-1"
            disabled={page === 0}
            onClick={() => fetchFoods(page - 1)}
          >
            ‹ Prev
          </button>

          <span className="mx-2">
            {page + 1} / {totalPages}
          </span>

          <button
            className="btn btn-outline-primary mx-1"
            disabled={page + 1 >= totalPages}
            onClick={() => fetchFoods(page + 1)}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFood;
