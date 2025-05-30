import mongoose, {Schema} from 'mongoose';

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  state: string;
  price: number;
  city: string;
  areaSqFt: number;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  furnished: string;
  availableFrom: Date;
  listedBy: string;
  tags: string;
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
}

const propertySchema = new Schema({
    id: {type : String, required: true, unique: true},
    title: {type : String, required: true},
    type: {type : String, required: true},
    state: {type : String, required: true},
    price: {type : Number, required: true},
    city: {type : String, required: true},
    areaSqFt: {type : Number, required: true},
    bedrooms: {type : String, required: true},
    bathrooms: {type : String, required: true},
    amenities: {type : String, required: true},
    furnished: {type : String, required: true},
    availableFrom: {type : Date, required: true},
    listedBy: {type : String, required: true},
    tags: {type : String, required: true},
    colorTheme: {type : String, required: true},
    rating: {type : Number, required: true},
    isVerified: {type : Boolean, required: true},
    listingType: {type : String, required: true},
});

export const Property = mongoose.model("Property", propertySchema, "property");