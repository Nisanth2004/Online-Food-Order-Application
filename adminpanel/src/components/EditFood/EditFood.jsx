import React, { useEffect, useState } from "react";
import { getFood, updateFood, getCategories } from "../../services/FoodService";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const EditFood = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    mrp: "",
    sellingPrice: "",
    offerActive: false,
    offerLabel: "",
    categoryIds: [],
    sponsored: false,
    featured: false,
    stock: "",
    lowStockThreshold: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [foodResp, catResp] = await Promise.all([getFood(id), getCategories()]);
        setCategories(catResp || []);

        setForm({
          name: foodResp.name,
          description: foodResp.description,
          mrp: foodResp.mrp,
          sellingPrice: foodResp.sellingPrice,
          offerActive: foodResp.offerActive,
          offerLabel: foodResp.offerLabel || "",
          categoryIds: foodResp.categoryIds || [],
          sponsored: foodResp.sponsored,
          featured: foodResp.featured,
          stock: foodResp.stock,
          lowStockThreshold: foodResp.lowStockThreshold || "",
        });

        setPreview(foodResp.imageUrl);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load food");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "categoryIds") {
      if (checked) {
        setForm((p) => ({ ...p, categoryIds: [...p.categoryIds, value] }));
      } else {
        setForm((p) => ({ ...p, categoryIds: p.categoryIds.filter((id) => id !== value) }));
      }
    } else if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();

    try {
      await updateFood(id, form, image);
      toast.success("Food updated successfully");
      navigate("/list");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="mx-2 mt-3">
      <div className="row">
        <div className="card col-md-6">
          <div className="card-body">
            <h2 className="mb-4">Edit Food</h2>

            <form onSubmit={onSubmit}>
              {/* IMAGE */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label" style={{ cursor: "pointer" }}>
                  <img
                    src={image ? URL.createObjectURL(image) : preview || assets.upload}
                    alt="upload"
                    width={98}
                    style={{ borderRadius: "8px" }}
                  />
                </label>
                <input
                  type="file"
                  id="image"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              {/* NAME & DESCRIPTION */}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} name="description" value={form.description} onChange={onChange} required />
              </div>

              {/* CATEGORIES */}
              <div className="mb-3">
                <label className="form-label">Categories</label>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <div className="form-check" key={c.id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`cat-${c.id}`}
                        value={c.id}
                        name="categoryIds"
                        checked={form.categoryIds.includes(c.id)}
                        onChange={onChange}
                      />
                      <label className="form-check-label" htmlFor={`cat-${c.id}`}>{c.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICING */}
              <div className="mb-3">
                <label className="form-label">MRP (Original Price)</label>
                <input type="number" className="form-control" name="mrp" value={form.mrp} onChange={onChange} min={0} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Selling Price</label>
                <input type="number" className="form-control" name="sellingPrice" value={form.sellingPrice} onChange={onChange} min={0} required />
              </div>

              {/* IPO / OFFER */}
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="offerActive" name="offerActive" checked={form.offerActive} onChange={onChange} />
                <label className="form-check-label" htmlFor="offerActive">Activate IPO / Offer</label>
                {form.offerActive && (
                  <input
                    type="text"
                    placeholder="Offer Label e.g. IPO 20% OFF"
                    className="form-control mt-2"
                    name="offerLabel"
                    value={form.offerLabel}
                    onChange={onChange}
                  />
                )}
              </div>

              {/* STOCK */}
              <div className="mb-3">
                <label className="form-label">Stock (units)</label>
                <input type="number" className="form-control" name="stock" value={form.stock} onChange={onChange} min={0} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Low Stock Threshold</label>
                <input type="number" className="form-control" name="lowStockThreshold" value={form.lowStockThreshold} onChange={onChange} min={0} />
                <small className="text-muted">Notify when stock is below this number</small>
              </div>

              {/* SPONSORED + FEATURED */}
              <div className="mb-3 d-flex gap-3">
                <div className="form-check">
                  <input type="checkbox" name="sponsored" className="form-check-input" checked={form.sponsored} onChange={onChange} />
                  <label className="form-check-label">Sponsored</label>
                </div>
                <div className="form-check">
                  <input type="checkbox" name="featured" className="form-check-input" checked={form.featured} onChange={onChange} />
                  <label className="form-check-label">Featured</label>
                </div>
              </div>

              <button className="btn btn-primary" type="submit">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFood;
