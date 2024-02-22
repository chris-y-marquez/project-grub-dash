const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));


// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


// checking middleware


// ensures body has data otherwise return an error
const bodyHasData = (property) => {
  return (req, res, next) => {
    const { data = {}} = req.body;
    if(data[property] && data[property] !== ''){
      next();
    }
    next({
      status: 400,
      message: `Dish must include a ${property}`
    })
  }
}

// matches seeked dish id with dish database for match
const matchingDish = (req, res, next) => {
  const { dishId } = req.params;
  const { data: {id} = {}} = req.body;
  if(id){
    if(id !== dishId){
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      })
    }
    next();
  }else{
    next();
  }
}

// ensures that no entered is price is below 0 
const validPrice = (req, res, next) => {
  const { data: { price } = {}} = req.body;
  if(Number(price) > 0 && typeof price === "number"){
    next();
  }else{
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    })
  }
}

// searches for matching dish
const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish ID does not exist: ${dishId}`,
    });
  }
};

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next ) {
    res.status(200).json({data: dishes});

}

// post hanlder 
const create = (req, res) => {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};


//Get one dish
const read = (req, res) => {
  const dish = res.locals.dish;
  res.json({ data: dish });
};
// update the dish
const update = (req, res) => {
  const dish = res.locals.dish;
  
  const {data: { name, description, price, image_url },
  } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
};




module.exports = {
  create: [
    bodyHasData("name"),
    bodyHasData("description"),
    bodyHasData("price"),
    validPrice,
    bodyHasData("image_url"),
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    matchingDish,
    bodyHasData("name"),
    bodyHasData("description"),
    bodyHasData("price"),
    validPrice,
    bodyHasData("image_url"),
    update,
  ],
  list,
};

