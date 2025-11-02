import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { EditRecipeFormSchema } from "@/formSchema/recipeFormSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CookingPot, Trash2 } from "lucide-react";

const EditRecipeForm = ({ recipe, onClose, onUpdated }) => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(recipe.coverImage || "");
  const [loading, setLoading] = useState(false);

  // Preview file
  const previewFiles = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  // Initialize form with defaults from recipe
  const form = useForm({
    resolver: zodResolver(EditRecipeFormSchema),
    defaultValues: {
      title: recipe.title || "",
      cookingTime: recipe.cookingTime || "",
      dishType: recipe.dishType || "",
      ingredients: recipe.ingredients || [
        { name: "", measurement: "", amount: "" },
      ],
      instructions: recipe.instructions || "",
    },
  });

  // Dynamic fields
  const { fields, append, remove } = useFieldArray({
    name: "ingredients",
    control: form.control,
  });

  // Submit handler
  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("cookingTime", values.cookingTime);
      formData.append("dishType", values.dishType);
      formData.append("ingredients", JSON.stringify(values.ingredients));
      formData.append("instructions", values.instructions);
      if (file) formData.append("coverImage", file);

      const res = await api.put(`/recipes/${recipe._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Recipe updated successfully!");
      onUpdated(res.data.recipe);
      onClose();
    } catch (error) {
      console.error("Update recipe error:", error);
      toast.error("Failed to update recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Give your masterpiece a name (e.g., Grandma’s Secret Apple Pie)"
                    {...field}
                  />
                </FormControl>
                {/* <FormDescription>
                  Make it catchy — your title is the first thing foodies see!
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dish Type and Cooking Time */}
          <div className="w-full flex flex-row gap-3">
            {/* Dish Type */}
            <div className="flex-1">
              <FormField
                control={form.control}
                name="dishType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dish Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                          <SelectValue placeholder="Select dish type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="side">Side</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="drink">Drink</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* <FormDescription>
                      Pick the dish’s role in the meal.
                    </FormDescription> */}
                  </FormItem>
                )}
              />
            </div>

            {/* Cooking Time */}
            <div className="flex-1">
              <FormField
                control={form.control}
                name="cookingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time to Make</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer h-9 border border-input bg-white">
                          <SelectValue placeholder="How long till we eat?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quick">{"<"} 30 minutes</SelectItem>
                        <SelectItem value="medium">30-60 minutes</SelectItem>
                        <SelectItem value="long">1-2 hours</SelectItem>
                        <SelectItem value="veryLong">{">"} 2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* <FormDescription>
                      Tell the clock what’s cooking.
                    </FormDescription> */}
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Ingredients */}
          <FormField
            control={form.control}
            name="ingredients"
            render={() => (
              <FormItem>
                <FormLabel>Ingredients</FormLabel>

                <div>
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.amount`}
                        render={({ field }) => (
                          <FormItem className="w-1/6">
                            <Input placeholder="Amount" {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.measurement`}
                        render={({ field }) => (
                          <FormItem className="w-2/6">
                            <Input placeholder="Units" {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.name`}
                        render={({ field }) => (
                          <Input
                            className="w-3/6"
                            placeholder="Ingredient name here"
                            {...field}
                          />
                        )}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                        disabled={idx === 0}
                        onClick={() => remove(idx)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    append({ name: "", measurement: "", amount: "" })
                  }
                >
                  <Plus /> Add Ingredient
                </Button>
                {/* <FormDescription>
                  Fill in the amount, unit, and ingredient — repeat until
                  delicious. Use ingredient amounts for 4 servings.
                </FormDescription> */}
              </FormItem>
            )}
          />

          {/* Instructions */}
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How to Cook It</FormLabel>
                <FormControl>
                  <Textarea
                    className="border border-input bg-white"
                    rows="7"
                    placeholder="Step 1: Chop veggies… Step 2: Sauté to glory!"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {/* <FormDescription>
                  Write it step by step so even kitchen newbies can follow
                  along.
                </FormDescription> */}
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Photo</FormLabel>
                <FormControl className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="text-muted-foreground"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file ?? null);
                      setFile(file);
                      if (file) previewFiles(file);
                    }}
                  />
                </FormControl>
                {/* <FormDescription>
                  They say we eat with our eyes first — make it drool-worthy!
                </FormDescription> */}
              </FormItem>
            )}
          />

          {image && (
            <img
              className="aspect-video h-48 object-cover border-accent border-1 rounded-sm"
              src={image}
              alt="Preview"
            />
          )}

          <div className="flex w-full justify-end">
            <Button
              className={`cursor-pointer ${loading ? "opacity-60" : ""}`}
              type="submit"
              disabled={loading}
            >
              <CookingPot /> {loading ? "Updating..." : "Update Recipe"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditRecipeForm;
