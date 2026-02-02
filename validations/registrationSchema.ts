import z from "zod";

/* -------------------- ZOD SCHEMA -------------------- */
export const CoffeeSponsorSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required'),

    email: z
        .string()
        .email('Please enter a valid email address'),

    mobile: z
        .string()
        .min(10, 'Mobile number must be at least 10 digits')
        .max(15, 'Mobile number must not exceed 15 digits'),

    couponCode: z
        .string()
        .min(1, 'Coupon code is required'),

})

export type CoffeeSponsorForm = z.infer<typeof CoffeeSponsorSchema>