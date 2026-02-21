import z from 'zod'

/* -------------------- ZOD SCHEMA -------------------- */
export const CoffeeSponsorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required'),

 email: z
  .string()
  .min(1, "Email is required")
  .trim()
  .email("Please enter a valid email address"),


  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(10, 'Mobile number must not exceed 10 digits'),

  couponId: z
    .string()
    .min(1, 'select one option'),
})

export type CoffeeSponsorForm = z.infer<typeof CoffeeSponsorSchema>
