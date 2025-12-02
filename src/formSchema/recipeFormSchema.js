import { z } from 'zod';

// Ingredient schema (matches IngredientSchema in Mongoose)
export const IngredientFormSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.coerce.number().min(0),
  measurement: z.enum([
    'tsp',
    'tbsp',
    'cup',
    'ml',
    'l',
    'fl oz',
    'g',
    'kg',
    'oz',
    'lb',
    'piece',
    'slice',
    'clove',
    'stick',
    'pinch',
    'dash',
    'handful',
  ]),
});

// Recipe form schema
export const RecipeFormSchema = z.object({
  title: z.string().trim().min(5, { message: 'Title must be at least 5 characters.' }),

  // Cover image can be either a URL string or a File (from input type="file")
  coverImage: z.union([z.string().url(), z.instanceof(File)]),

  // Example enums for dropdowns — adjust to match your UI
  cookingTime: z.enum(['quick', 'medium', 'long', 'veryLong']),
  dishType: z.enum(['starter', 'main', 'side', 'dessert', 'drink']),

  ingredients: z
    .array(IngredientFormSchema)
    .min(1, { message: 'At least one ingredient is required.' }),

  instructions: z.string().trim().min(5, { message: 'Please provide instructions.' }),

  remixNote: z.string().max(1000).optional().default(''),
});

// relaxed schema for editing recipes
export const EditRecipeFormSchema = z.object({
  title: z.string().trim().optional(),
  coverImage: z.union([z.string().url(), z.instanceof(File)]).optional(),
  cookingTime: z.enum(['quick', 'medium', 'long', 'veryLong']).optional(),
  dishType: z.enum(['starter', 'main', 'side', 'dessert', 'drink']).optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().optional(),
        amount: z.coerce.number().optional(),
        measurement: z
          .enum([
            'tsp',
            'tbsp',
            'cup',
            'ml',
            'l',
            'fl oz',
            'g',
            'kg',
            'oz',
            'lb',
            'piece',
            'slice',
            'clove',
            'stick',
            'pinch',
            'dash',
            'handful',
          ])
          .optional(),
      }),
    )
    .optional(),
  instructions: z.string().trim().optional(),
});
