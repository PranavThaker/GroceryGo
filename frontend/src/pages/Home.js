import HomeBanner from "../components/HomeBanner";
import Categories from "../components/Categories";
import Features from "../components/Features";
import QuickPicks from "../components/QuickPicks";

function Home({ isLoggedIn, updateCartCount }) {
    return (
        <div>
            <div className="container-fluid px-4 mt-2">
                <br />
                <HomeBanner />
                <Features />
                <Categories />
                <QuickPicks isLoggedIn={isLoggedIn} updateCartCount={updateCartCount} />
            </div >
        </div >
    );
}

export default Home;