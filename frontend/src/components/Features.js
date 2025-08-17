import fresh from '../assets/fresh.png'
import delivery from '../assets/delivery_truck_icon.png'
import payment from '../assets/secure_payment.png'
import return_icon from '../assets/return_icon.png'
function Features() {
    return (
        <div className="container-fluid mt-5">
            <div className="row text-center">
                <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <div className="card shadow-sm border-0 p-3 h-100">
                        <img src={delivery} alt="Fast Delivery" style={{ width: "40px", height: "40px", margin: "0 auto" }} />
                        <p className="mt-2 mb-0 fw-semibold">Fast Delivery</p>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <div className="card shadow-sm border-0 p-3 h-100">
                        <img src={fresh} alt="Fresh Products" style={{ width: "40px", height: "40px", margin: "0 auto" }} />
                        <p className="mt-2 mb-0 fw-semibold">Fresh Products</p>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <div className="card shadow-sm border-0  p-3 h-100">
                        <img src={return_icon} alt="Easy Returns" style={{ width: "40px", height: "40px", margin: "0 auto" }} />
                        <p className="mt-2 mb-0 fw-semibold">Easy Returns</p>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <div className="card shadow-sm border-0 p-3 h-100">
                        <img src={payment} alt="Secure Payment" style={{ width: "40px", height: "40px", margin: "0 auto" }} />
                        <p className="mt-2 mb-0 fw-semibold">Secure Payment</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Features;