import { Request, Response } from "express";
import cloudinary from "cloudinary";
import Hotel from "../Models/hotel";
import { BookingType, HotelSearchResponse, HotelType } from "../Shared/types";
import { validationResult } from "express-validator";
import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export const payment = async (req: Request, res: Response) => {
  const { numberOfNights } = req.body;
  const hotelId = req.params.hotelId;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return res.status(404).json({ message: "no such hotel found" });
  }

  const totalCost = hotel.pricePerNight * numberOfNights;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCost * 100,
    currency: "aud",
    metadata: {
      hotelId,
      userId: req.userId,
    },
  });
  if (!paymentIntent.client_secret) {
    return res.status(500).json({ message: "Error Creating Payment Intent" });
  }

  const response = {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret.toString(),
    totalCost,
  };

  return res.send(response);
};


export const getHotelBookingById = async (req: Request, res: Response) => {
  try {
    const paymentIntentId = req.body.paymentIntentId;
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId as string
    );
    if (!paymentIntent) {
      return res.status(404).json({ message: "Payment Intent not found!" });
    }

    if (
      paymentIntent.metadata.hotelId !== req.params.hotelId ||
      paymentIntent.metadata.userId !== req.userId
    ) {
      return res.status(400).json({ message: "payment intent mismatch!" });
    }

    if (!paymentIntent.status) {
      return res
        .status(400)
        .json({
          message: `payment intent not succeeded. Status ${paymentIntent.status}`,
        });
    }

    const newBooking: BookingType = {
      ...req.body,
      userId: req.userId,
    };

     const hotel = await Hotel.findOneAndUpdate(
       { _id: req.params.hotelId },
       {
         $push: { bookings: newBooking },
       }
     );
      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

    await hotel.save();
    return res.status(200).json(hotel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Internal Server Error!"})
  }
};

const uploadImages = async (imageFiles: Express.Multer.File[]) => {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
};

export const uploadData = async (req: Request, res: Response) => {
  try {
    const imageFiles = req.files as Express.Multer.File[];
    const newHotel: HotelType = req.body;
    //upload to cloudinary
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.v2.uploader.upload(dataURI);
      return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    newHotel.imageUrls = imageUrls;
    newHotel.lastUpdated = new Date();
    newHotel.userId = req.userId;
    const hotel = new Hotel(newHotel);
    await hotel.save();
    return res.status(201).json({ message: "created", hotel });
  } catch (error) {
    console.log("Error creating hotels.", error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export const getMyHotel = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    return res.json(hotels);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getHotel = async (req: Request, res: Response) => {
   try {
     const hotels = await Hotel.find().sort("-lastUpdated");
     return res.status(200).json(hotels);
   } catch (error) {
     console.log("error", error);
     return res.status(500).json({ message: "Error fetching hotels" });
   }
};

export const getHotelById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ message: "no hotel found" });
  }
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId, //check when token function runs see the id matches to users
    });
    if (!hotel) {
      return res.status(404).json({ message: "no hotel found" });
    }
    return res.status(200).json(hotel);
  } catch (error) {
    return res.json(500).json({ message: "Server error" });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const updatedHotel: HotelType = req.body;
    updatedHotel.lastUpdated = new Date();

    const hotel = await Hotel.findOneAndUpdate(
      {
        _id: req.params.hotelId,
        userId: req.userId,
      },
      updatedHotel,
      {
        new: true,
      }
    );

    if (!hotel) {
      return res.status(404).json({ message: "No hotel found!" });
    }
    const files = req.files as Express.Multer.File[];
    const updateImages = await uploadImages(files);

    hotel.imageUrls = [...updateImages, ...(updatedHotel.imageUrls || [])];
    await hotel.save();
    return res.status(201).json({ message: "update success" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const searchHotel = async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);
    let sortOption = {};

    switch (req.query.sortOption) {
      case "startRating":
        sortOption = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOption = { pricePerNight: 1 };
        break;
      case "pricePerNightDec":
        sortOption = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5; //for pagination
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;
    const hotels = await Hotel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);
    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: "something went wrong!" });
  }
};

export const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export const getDataById = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const id = req.params.id.toString();

  try {
    const hotel = await Hotel.findById(id);
    return res.json(hotel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
