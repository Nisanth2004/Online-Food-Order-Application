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
    category: "",      // will store category name string
    sponsored: false,  // new
    featured: false    // new
  });

  // fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        // res.data expected to be [{id, name}, ...]
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setData((prev) => ({ ...prev, category: res.data[0].name }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add category inline (admin)
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const res = await addCategory({ name: newCategory.trim() });
      // res.data should be the created category object { id, name }
      setCategories((prev) => [...prev, res.data]);
      setData((prev) => ({ ...prev, category: res.data.name }));
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

    // prepare foodData object - ensure proper types
    const foodData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      category: data.category,
      sponsored: !!data.sponsored,
      featured: !!data.featured
      // don't include imageUrl here - backend will set after S3 upload
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
        category: categories.length > 0 ? categories[0].name : "",
        sponsored: false,
        featured: false
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
              {/* Image Upload */}
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

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
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

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
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

              {/* Category */}
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  className="form-control"
                  onChange={onChangeHandler}
                  value={data.category}
                  required
                >
                  {categories.length === 0 && <option value="">No categories</option>}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Add new category inline */}
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

              {/* Price */}
              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
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

              {/* Sponsored / Featured */}
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
                  <label className="form-check-label" htmlFor="sponsored">
                    Sponsored
                  </label>
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
                  <label className="form-check-label" htmlFor="featured">
                    Featured
                  </label>
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
