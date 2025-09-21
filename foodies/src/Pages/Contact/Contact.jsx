import React from "react";
import "./ContactUs.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Add your Web3Forms Access Key
    formData.append("access_key", "586dd462-48d2-4ec9-93dc-13a7484b63d2");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    }).then((res) => res.json());

    if (res.success) {
      toast.success("Email sent successfully!");
      event.target.reset(); // clear form after success
    } else {
      toast.error("Something went wrong. Try again!");
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="contact-form p-5 shadow-sm bg-white">
              <h2 className="text-center mb-4">Get in Touch</h2>
              <form onSubmit={onSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="first_name"
                      className="form-control custom-input"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="last_name"
                      className="form-control custom-input"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="email"
                      name="email"
                      className="form-control custom-input"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      name="message"
                      className="form-control custom-input"
                      rows="5"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100 py-3"
                      type="submit"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
