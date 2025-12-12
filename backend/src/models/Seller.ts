import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ISeller extends Document {
  // Authentication
  sellerName: string;
  password: string;
  email: string;
  mobile: string;

  // Store Info
  storeName: string;
  panCard?: string;
  category: string;
  taxName?: string;
  address: string;
  taxNumber?: string;

  // Store Location Info
  city: string;
  serviceableArea: string;
  searchLocation?: string;
  latitude?: string;
  longitude?: string;

  // Payment Details
  accountName?: string;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  ifsc?: string;

  // Documents (URLs pointing to cloud storage)
  profile?: string;
  idProof?: string;
  addressProof?: string;

  // Settings
  requireProductApproval: boolean;
  viewCustomerDetails: boolean;
  commission: number;

  // Status
  status: 'Approved' | 'Pending' | 'Rejected';
  balance: number;
  categories: string[];
  logo?: string;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SellerSchema = new Schema<ISeller>(
  {
    // Authentication
    sellerName: {
      type: String,
      required: [true, 'Seller name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Mobile number must be 10 digits',
      },
    },

    // Store Info
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    panCard: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    taxName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    taxNumber: {
      type: String,
      trim: true,
    },

    // Store Location Info
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    serviceableArea: {
      type: String,
      required: [true, 'Serviceable area is required'],
      trim: true,
    },
    searchLocation: {
      type: String,
      trim: true,
    },
    latitude: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },

    // Payment Details
    accountName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifsc: {
      type: String,
      trim: true,
    },

    // Documents (URLs)
    profile: {
      type: String,
      trim: true,
    },
    idProof: {
      type: String,
      trim: true,
    },
    addressProof: {
      type: String,
      trim: true,
    },

    // Settings
    requireProductApproval: {
      type: Boolean,
      default: false,
    },
    viewCustomerDetails: {
      type: Boolean,
      default: false,
    },
    commission: {
      type: Number,
      required: [true, 'Commission is required'],
      default: 0,
      min: [0, 'Commission cannot be negative'],
    },

    // Status
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    categories: {
      type: [String],
      default: [],
    },
    logo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
SellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
SellerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Seller = mongoose.model<ISeller>('Seller', SellerSchema);

export default Seller;

