import React from 'react'
import { categories } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Categories = () => {
    const navigate = useNavigate()
    return (
        <div className="container-fluid mt-1">
            <p className="fs-3 fw-semibold">Categories</p>
            <div className="row">
                {categories.map((category, index) => (
                    <div className="col-12 col-md-6 col-lg-3 mb-3" key={index}>
                        <div className="card shadow-sm border-0 p-3 h-100 text-center category-card" style={{ backgroundColor: category.bgColor, cursor: 'pointer' }}
                            onClick={() => {
                                navigate(`/products?category=${category.path}`)
                            }}
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                style={{ width: "90px", height: "90px", margin: "0 auto" }}
                                className="category-image"
                            />
                            <p className="mt-2 mb-0 fw-semibold">{category.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Categories
