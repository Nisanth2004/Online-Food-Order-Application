import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addFood } from "../../services/FoodService";
import { fetchCategories, addCategory } from "../../services/CategoryService";

const AddFood = () => {
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]); // array of {id, name}
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    categories: [], // array of selected category IDs
    sponsored: false,
    featured: false,
    stock: "", // <-- new field
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox" && name === "categories") {
      if (checked) {
        setData((prev) => ({
          ...prev,
          categories: [...prev.categories, value],
        }));
      } else {
        setData((prev) => ({
          ...prev,
          categories: prev.categories.filter((id) => id !== value),
        }));
      }
    } else if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const res = await addCategory({ name: newCategory.trim() });
      setCategories((prev) => [...prev, res.data]);
      setData((prev) => ({
        ...prev,
        categories: [...prev.categories, res.data.id],
      }));
      setNewCategory("");
      toast.success("Category added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    const foodData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      categoryIds: data.categories,
      sponsored: !!data.sponsored,
      featured: !!data.featured,
      stock: parseInt(data.stock || "0", 10) || 0, // NEW
    };

    setSubmitting(true);
    try {
      await addFood(foodData, image);
      toast.success("Food added successfully");

      // reset form
      setData({
        name: "",
        description: "",
        price: "",
        categories: [],
        sponsored: false,
        featured: false,
        stock: "",
      });
      setImage(null);
    } catch (err) {
      console.error(err);
      toast.error("Error adding food");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-2 mt-3">
      <div className="row">
        <div className="card col-md-6">
          <div className="card-body">
            <h2 className="mb-4">Add Food</h2>

            <form onSubmit={onSubmitHandler}>
              <div className="mb-3">
                <label htmlFor="image" className="form-label" style={{ cursor: "pointer" }}>
                  <img
                    src={image ? URL.createObjectURL(image) : assets.upload}
                    alt="upload"
                    width={98}
                  />
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  placeholder="Chicken Biriyani"
                  className="form-control"
                  id="name"
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Write the description"
                  id="description"
                  rows="4"
                  name="description"
                  onChange={onChangeHandler}
                  value={data.description}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Categories</label>
                <div className="d-flex flex-wrap gap-2">
                  {categories.length === 0 && <span>No categories</span>}
                  {categories.map((cat) => (
                    <div className="form-check" key={cat.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`cat-${cat.id}`}
                        name="categories"
                        value={cat.id}
                        checked={data.categories.includes(cat.id)}
                        onChange={onChangeHandler}
                      />
                      <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                        {cat.name}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="d-flex mt-2">
                  <input
                    type="text"
                    placeholder="New Category"
                    className="form-control me-2"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button type="button" className="btn btn-success" onClick={handleAddCategory}>
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label">Price</label>
                <input
                  type="number"
                  placeholder="Rs.100"
                  className="form-control"
                  id="price"
                  name="price"
                  onChange={onChangeHandler}
                  value={data.price}
                  required
                />
              </div>

              {/* Inventory (stock) */}
              <div className="mb-3">
                <label htmlFor="stock" className="form-label">Stock (units)</label>
                <input
                  type="number"
                  placeholder="100"
                  className="form-control"
                  id="stock"
                  name="stock"
                  onChange={onChangeHandler}
                  value={data.stock}
                  min={0}
                  required
                />
                <small className="form-text text-muted">Set available quantity. Set 0 to mark as out-of-stock.</small>
              </div>

              <div className="mb-3 d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sponsored"
                    name="sponsored"
                    checked={data.sponsored}
                    onChange={onChangeHandler}
                  />
                  <label className="form-check-label" htmlFor="sponsored">Sponsored</label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={data.featured}
                    onChange={onChangeHandler}
                  />
                  <label className="form-check-label" htmlFor="featured">Featured</label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
