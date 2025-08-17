import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HomeBanner = () => {
    const words = ["Milk", "Bread", "Vegetables", "Fruits", "Spices", "Snacks", "Essentials"];
    const wordColors = {
        Milk: "#DCCCA3",
        Bread: "#D7A86E",
        Vegetables: "#81C784",
        Fruits: "#FFB74D",
        Spices: "#E57373",
        Snacks: "#FFD54F",
        Essentials: "#A1887F"
    };

    const [displayedText, setDisplayedText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const typingInterval = 120;
        const pauseDuration = 300;

        let timer;

        if (!isDeleting && charIndex === words[wordIndex].length) {
            timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        } else {
            timer = setTimeout(() => {
                setDisplayedText(
                    words[wordIndex].slice(0, isDeleting ? charIndex - 1 : charIndex + 1)
                );
                setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
            }, typingInterval);
        }

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, wordIndex, words]);

    useEffect(() => {
        const cursorTimer = setInterval(() => setShowCursor((prev) => !prev), 500);
        return () => clearInterval(cursorTimer);
    }, []);

    const getColorForWord = (word) => wordColors[word];

    return (
        <div className="container-fluid position-relative">
            <img
                src={assets.main_banner_bg}
                className="w-100 d-none d-lg-block rounded-3"
                alt="Banner Image For Laptop"
            />
            <img
                src={assets.main_banner_bg_sm}
                className="w-100 d-block d-lg-none rounded-3"
                alt="Banner Image For Mobile"
            />

            <div className="position-absolute start-0 ms-5 text-dark text-start banner-text">
                <h1 className="fw-bold display-5">
                    <span style={{ color: "#4CAF50" }}>Fresh</span>{" "}
                    {displayedText.split("").map((char, index) => (
                        <span key={index} style={{ color: getColorForWord(words[wordIndex]) }}>
                            {char}
                        </span>
                    ))}
                    <span
                        style={{
                            color: "green",
                            visibility: showCursor ? "visible" : "hidden",
                            transition: "visibility 0.1s linear",
                        }}
                    >
                        |
                    </span>{" "}
                    <br /> Delivered At Your <span className='text-success'>Door</span><br /> <span className='text-success'>In Minutes!</span>
                </h1>

                <div className="mt-4">
                    <Link to="/products" className="btn btn-primary btn-lg me-3">
                        Shop Now <img src={assets.white_arrow_icon} alt="arrow" />
                    </Link>
                </div>
            </div>
            <style>
                {`.banner-text {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .banner-text {
            position: relative;
            transform: none;
            margin-top: 20px;
            text-align: center;
          }
        }`}
            </style>
        </div>
    );
};

export default HomeBanner;
