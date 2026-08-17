const { z } = require('zod');

const brandRegistrationSchema = z
  .object({
    companyName: z
      .string({ required_error: 'Company name is required' })
      .trim()
      .min(2, 'Company / Brand name must be at least 2 characters'),
    workEmail: z
      .string()
      .trim()
      .transform((s) => s.toLowerCase())
      .pipe(z.string().email('Please provide a valid work email address'))
      .optional(),
    email: z
      .string()
      .trim()
      .transform((s) => s.toLowerCase())
      .pipe(z.string().email('Please provide a valid email address'))
      .optional(),
    industryType: z.string().trim().optional(),
    aboutBrand: z.string().trim().optional(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
  })
  .transform((data) => {
    const mainEmail = data.workEmail || data.email;
    return {
      ...data,
      workEmail: mainEmail,
      email: mainEmail
    };
  })
  .refine((data) => Boolean(data.workEmail || data.email), {
    message: 'Work email is required',
    path: ['workEmail']
  });

module.exports = {
  brandRegistrationSchema
};
