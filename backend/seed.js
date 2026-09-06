require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('./models/productModel')

const products = [
    // Vegetables
    {
        name: "Potato 500g",
        description: "Fresh and organic potatoes, rich in carbohydrates, ideal for curries, baking, and crispy fries.",
        image: "assets/potato_image_1",
        category: "Vegetables",
        stock: 100,
        price: 25
    },
    {
        name: "Tomato 1 kg",
        description: "Juicy, ripe red tomatoes rich in Vitamin C, perfect for fresh salads, soups, and rich gravies.",
        image: "assets/tomato_image",
        category: "Vegetables",
        stock: 100,
        price: 40
    },
    {
        name: "Carrot 500g",
        description: "Sweet and crunchy farm carrots, rich in Vitamin A and beta-carotene, ideal for salads, juices, and cooking.",
        image: "assets/carrot_image",
        category: "Vegetables",
        stock: 100,
        price: 30
    },
    {
        name: "Spinach 500g",
        description: "Fresh leafy green spinach, packed with iron and dietary vitamins, perfect for healthy soups, curries, and salads.",
        image: "assets/spinach_image_1",
        category: "Vegetables",
        stock: 100,
        price: 18
    },
    {
        name: "Onion 500g",
        description: "Pungent and crisp kitchen staple onions, essential for all savory recipes, gravies, and seasonings.",
        image: "assets/onion_image_1",
        category: "Vegetables",
        stock: 100,
        price: 22
    },

    // Fruits
    {
        name: "Apple 1 kg",
        description: "Crisp and juicy sweet apples, rich in dietary fiber and antioxidants, excellent for healthy daily snacking.",
        image: "assets/apple_image",
        category: "Fruits",
        stock: 100,
        price: 120
    },
    {
        name: "Orange 1 kg",
        description: "Sweet, tangy, and juicy citrus oranges, loaded with Vitamin C to refresh and boost daily immunity.",
        image: "assets/orange_image",
        category: "Fruits",
        stock: 100,
        price: 80
    },
    {
        name: "Banana 1 kg",
        description: "Naturally ripe sweet bananas, packed with potassium and instant energy, great for smoothies and snacks.",
        image: "assets/banana_image_1",
        category: "Fruits",
        stock: 100,
        price: 50
    },
    {
        name: "Mango 1 kg",
        description: "Rich, aromatic, and lusciously sweet mangoes, ideal for desserts, shakes, and direct snacking.",
        image: "assets/mango_image_1",
        category: "Fruits",
        stock: 100,
        price: 150
    },
    {
        name: "Grapes 500g",
        description: "Sweet, juicy, seedless fresh green grapes, bursting with antioxidants and natural refreshment.",
        image: "assets/grapes_image_1",
        category: "Fruits",
        stock: 100,
        price: 70
    },

    // Dairy
    {
        name: "Amul Milk 1L",
        description: "Pure, fresh pasteurized milk rich in calcium and essential vitamins, perfect for tea, coffee, and daily nutrition.",
        image: "assets/amul_milk_image",
        category: "Dairy",
        stock: 100,
        price: 60
    },
    {
        name: "Paneer 200g",
        description: "Soft and fresh cottage cheese, rich in protein, ideal for creamy curries, grilling, and wholesome snacks.",
        image: "assets/paneer_image",
        category: "Dairy",
        stock: 100,
        price: 90
    },
    {
        name: "Eggs 12 pcs",
        description: "Farm-fresh protein-packed grade A eggs, ideal for hearty breakfasts, baking, and balanced daily meals.",
        image: "assets/eggs_image",
        category: "Dairy",
        stock: 100,
        price: 90
    },
    {
        name: "Fresh Malai Paneer 200g",
        description: "Extra soft, melt-in-mouth traditional malai paneer, crafted for authentic Indian delicacies and tikkas.",
        image: "assets/paneer_image_2",
        category: "Dairy",
        stock: 100,
        price: 95
    },
    {
        name: "Cheese 200g",
        description: "Creamy, flavorful processed cheese block, perfect for gourmet pizzas, grilled sandwiches, and pasta bakes.",
        image: "assets/cheese_image",
        category: "Dairy",
        stock: 100,
        price: 140
    },

    // Beverages
    {
        name: "Coca-Cola 1.5L",
        description: "Classic refreshing carbonated soft drink with an iconic crisp taste, best served chilled for parties and get-togethers.",
        image: "assets/coca_cola_image",
        category: "Beverages",
        stock: 100,
        price: 80
    },
    {
        name: "Pepsi 1.5L",
        description: "Bold and crisp cola refreshment, perfectly fizzy and invigorating, best enjoyed ice-cold.",
        image: "assets/pepsi_image",
        category: "Beverages",
        stock: 100,
        price: 78
    },
    {
        name: "Sprite 1.5L",
        description: "Refreshing lemon-lime flavored sparkling beverage with a clean, crisp finish to quench any thirst.",
        image: "assets/sprite_image_1",
        category: "Beverages",
        stock: 100,
        price: 79
    },
    {
        name: "Fanta 1.5L",
        description: "Bright, bubbly, and fruity orange flavored soft drink that brings playful refreshment to any occasion.",
        image: "assets/fanta_image_1",
        category: "Beverages",
        stock: 100,
        price: 77
    },
    {
        name: "7 Up 1.5L",
        description: "Clear lemon-lime fizzy soda that delivers crisp, caffeine-free refreshment with every sip.",
        image: "assets/seven_up_image_1",
        category: "Beverages",
        stock: 100,
        price: 76
    },

    // Grains
    {
        name: "Basmati Rice 5kg",
        description: "Long-grain aromatic royal basmati rice with exquisite fragrance, perfect for biryanis, pilafs, and daily feasts.",
        image: "assets/basmati_rice_image",
        category: "Grains",
        stock: 100,
        price: 550
    },
    {
        name: "Wheat Flour 5kg",
        description: "100% whole wheat chakki-fresh atta, ground to perfection for soft, fluffy, and nutritious rotis and chapatis.",
        image: "assets/wheat_flour_image",
        category: "Grains",
        stock: 100,
        price: 250
    },
    {
        name: "Organic Quinoa 500g",
        description: "Nutrient-dense superfood quinoa, high in plant protein and dietary fiber, naturally gluten-free and easy to cook.",
        image: "assets/quinoa_image",
        category: "Grains",
        stock: 100,
        price: 450
    },
    {
        name: "Brown Rice 1kg",
        description: "Wholesome unpolished brown rice rich in fiber, minerals, and magnesium, supporting balanced and healthy diets.",
        image: "assets/brown_rice_image",
        category: "Grains",
        stock: 100,
        price: 120
    },
    {
        name: "Barley 1kg",
        description: "High-fiber whole grain pearled barley, excellent for hearty soups, wholesome stews, and digestive health.",
        image: "assets/barley_image",
        category: "Grains",
        stock: 100,
        price: 150
    },

    // Bakery
    {
        name: "Brown Bread 400g",
        description: "Soft, wholesome brown bread baked with whole wheat flour, high in dietary fiber for wholesome breakfasts.",
        image: "assets/brown_bread_image",
        category: "Bakery",
        stock: 100,
        price: 40
    },
    {
        name: "Butter Croissant 100g",
        description: "Golden, flaky, and buttery artisanal croissant with delicate layers, ideal for breakfast or coffee accompaniment.",
        image: "assets/butter_croissant_image",
        category: "Bakery",
        stock: 100,
        price: 50
    },
    {
        name: "Chocolate Cake 500g",
        description: "Decadent, rich chocolate sponge cake made with premium cocoa and smooth ganache frosting, perfect for celebrations.",
        image: "assets/chocolate_cake_image",
        category: "Bakery",
        stock: 100,
        price: 350
    },
    {
        name: "Whole Wheat Bread 400g",
        description: "Freshly baked whole wheat loaf rich in grains, ideal for healthy club sandwiches, toasts, and snacks.",
        image: "assets/whole_wheat_bread_image",
        category: "Bakery",
        stock: 100,
        price: 45
    },
    {
        name: "Vanilla Muffins 6 pcs",
        description: "Fluffy, tender bakery muffins infused with pure aromatic vanilla extract, great for tea-time and dessert.",
        image: "assets/vanilla_muffins_image",
        category: "Bakery",
        stock: 100,
        price: 100
    },

    // Snacks
    {
        name: "Maggi Noodles 280g",
        description: "India's favorite 2-minute instant noodles with the classic masala tastemaker spice blend for a quick, comforting meal.",
        image: "assets/maggi_image",
        category: "Snacks",
        stock: 100,
        price: 55
    },
    {
        name: "Top Ramen 270g",
        description: "Flavorful curry flavored instant noodles with authentic oriental spices, quick and satisfying for any craving.",
        image: "assets/top_ramen_image",
        category: "Snacks",
        stock: 100,
        price: 45
    },
    {
        name: "Knorr Cup Soup 70g",
        description: "Delicious, rich and hearty instant vegetable soup with crunchy croutons, ready in just 1 minute.",
        image: "assets/knorr_soup_image",
        category: "Snacks",
        stock: 100,
        price: 35
    },
    {
        name: "Yippee Noodles 260g",
        description: "Non-sticky, round-block slurpy instant noodles loaded with veggies and rich savory spices.",
        image: "assets/yippee_image",
        category: "Snacks",
        stock: 100,
        price: 50
    },
    {
        name: "Maggi Oats Noodles 72g",
        description: "Wholesome instant noodles made with goodness of grain oats and aromatic herbs for a balanced tasty snack.",
        image: "assets/maggi_oats_image",
        category: "Snacks",
        stock: 100,
        price: 40
    }
]

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        await Product.deleteMany({})
        await Product.insertMany(products)
        console.log(`Seeded ${products.length} products`)
    } catch (err) {
        console.error('Error seeding products:', err)
    } finally {
        await mongoose.disconnect()
    }
}

seed()