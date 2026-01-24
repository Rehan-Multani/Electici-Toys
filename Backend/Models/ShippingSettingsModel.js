import mongoose from "mongoose";

const shippingSettingsSchema = new mongoose.Schema(
    {
        freeShippingEnabled: {
            type: Boolean,
            default: false
        },
        codEnabled: {
            type: Boolean,
            default: true
        },
        codCharge: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

// Singleton pattern - ensure only one settings document exists
shippingSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            freeShippingEnabled: false,
            codEnabled: true,
            codCharge: 0
        });
    }
    return settings;
};

export default mongoose.model("ShippingSettings", shippingSettingsSchema);
