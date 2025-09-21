import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addFood } from '../../services/FoodService';
import { fetchCategories, addCategory } from "../../services/CategoryService"; 

const AddFood = () => {
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setData((prev) => ({ ...prev, category: res.data[0] }));
        }
      } catch (err) {
        toast.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  // Handle Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const res = await addCategory({ name: newCategory });
      toast.success("Category Added");
      setCategories((prev) => [...prev, res.data.name]); // Update dropdown
      setData((prev) => ({ ...prev, category: res.data.name })); // Select new category
      setNewCategory("");
    } catch (err) {
      toast.error("Failed to add category");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error('Please select an image');
      return;
    }

    try {
      await addFood(data, image);
      toast.success("Food Added Successfully");
      setData({
        name: '',
        description: '',
        price: '',
        category: categories.length > 0 ? categories[0] : ''
      });
      setImage(null);
    } catch (error) {
      toast.error("Error Adding Food");
    }
  };

  return (
    <div className="mx-2 mt-3">
      <div className="row">
        <div className="card col-md-4">
          <div className="card-body">
            <h2 className="mb-4">Add Food</h2>

            <form onSubmit={onSubmitHandler}>
              {/* Image Upload */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">
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
                  onChange={(e) => setImage(e.target.files[0])} 
                />
              </div>

              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input 
                  type="text" 
                  placeholder='Chicken Biriyani' 
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
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  placeholder='Write the description' 
                  id="description" 
                  rows="5" 
                  name="description" 
                  onChange={onChangeHandler} 
                  value={data.description} 
                  required
                ></textarea>
              </div>

              {/* Category */}
              {/* Category */}
<div className="mb-3">
  <label htmlFor="category" className="form-label">Category</label>
  <select
    name="category"
    id="category"
    className="form-control"
    onChange={onChangeHandler}
    value={data.category}
  >
    {categories.map((cat) => (
      <option key={cat.id} value={cat.name}>{cat.name}</option>
    ))}
  </select>

  {/* Add new category */}
  <div className="d-flex mt-2">
    <input 
      type="text" 
      placeholder="New Category" 
      className="form-control me-2" 
      value={newCategory} 
      onChange={(e) => setNewCategory(e.target.value)} 
    />
    <button 
      type="button" 
      className="btn btn-success" 
      onClick={handleAddCategory}
    >
      Add
    </button>
  </div>
</div>


              {/* Price */}
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Price</label>
                <input 
                  type="number" 
                  placeholder='Rs.100' 
                  className="form-control" 
                  id="price" 
                  name="price" 
                  onChange={onChangeHandler} 
                  value={data.price} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
